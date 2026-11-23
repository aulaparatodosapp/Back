import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleLoginDto, LoginDto, RegisterDto } from './dtos/auth-dto';
import { Session } from './session.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { IsNull, QueryFailedError } from 'typeorm';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const SESSION_TTL_SECONDS = 2 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleClient: OAuth2Client,

    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException(
        'La contraseña no puede superar los 72 bytes',
      );
    }

    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      return await this.usersService.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const databaseError = error.driverError as {
          code?: string;
        };

        if (databaseError.code === '23505') {
          throw new ConflictException('El correo ya está registrado');
        }
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const user = await this.usersService.findByEmailForLogin(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!matches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.createSessionToken(user.id);
  }

  async googleLogin(dto: GoogleLoginDto) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')?.trim();

    if (!clientId) {
      throw new ServiceUnavailableException(
        'El inicio de sesión con Google todavía no está configurado',
      );
    }

    const ticket = await this.googleClient
      .verifyIdToken({ idToken: dto.idToken, audience: clientId })
      .catch(() => {
        throw new UnauthorizedException('Credencial de Google inválida');
      });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Cuenta de Google no verificada');
    }

    const existingUser = await this.usersService.findByGoogleId(payload.sub);

    if (existingUser) {
      return this.createSessionToken(existingUser.id);
    }

    const sameEmail = await this.usersService.findByEmail(payload.email);

    if (sameEmail) {
      if (sameEmail.googleId === payload.sub) {
        return this.createSessionToken(sameEmail.id);
      }

      throw new ConflictException(
        'Iniciá sesión con tu cuenta existente para vincular Google',
      );
    }

    try {
      const createdUser = await this.usersService.create({
        name: Array.from(payload.name?.trim() || 'Usuario de Google')
          .slice(0, 100)
          .join(''),
        email: payload.email,
        googleId: payload.sub,
      });

      return this.createSessionToken(createdUser.id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        const concurrentUser = await this.usersService.findByGoogleId(
          payload.sub,
        );

        if (concurrentUser) {
          return this.createSessionToken(concurrentUser.id);
        }

        throw new ConflictException(
          'Iniciá sesión con tu cuenta existente para vincular Google',
        );
      }

      throw error;
    }
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.sessionsRepository.update(
      { id: sessionId, userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async createSessionToken(userId: string) {
    const session = await this.sessionsRepository.save(
      this.sessionsRepository.create({
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
        revokedAt: null,
      }),
    );
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, sid: session.id },
      { expiresIn: SESSION_TTL_SECONDS },
    );

    return { access_token: accessToken };
  }
}
