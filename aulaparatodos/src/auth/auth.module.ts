import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ProfileController } from './profile.controller';
import { Session } from './session.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([Session]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
          expiresIn: '2h',
        },
        verifyOptions: {
          algorithms: ['HS256'],
        },
      }),
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: OAuth2Client,
      useFactory: () => new OAuth2Client(),
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
