import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import type { Request } from 'express';
import { IsNull } from 'typeorm';
import type { Repository } from 'typeorm';
import { Session } from '../../session.entity';

export interface AuthenticatedRequest extends Request {
  user: { sub: string; sid: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = request.headers.authorization?.match(/^Bearer (\S+)$/i);

    if (!match) {
      throw new UnauthorizedException('Token requerido');
    }

    let payload: Record<string, unknown>;

    try {
      payload = await this.jwtService.verifyAsync<Record<string, unknown>>(
        match[1],
      );
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      !isUUID(payload.sub) ||
      !isUUID(payload.sid)
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    const session = await this.sessionsRepository.findOneBy({
      id: payload.sid,
      userId: payload.sub,
      revokedAt: IsNull(),
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Sesión cerrada o vencida');
    }

    request.user = { sub: payload.sub, sid: payload.sid };
    return true;
  }
}
