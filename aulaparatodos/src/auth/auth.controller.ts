import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto, LoginDto, RegisterDto } from './dtos/auth-dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @HttpCode(200)
  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Post('logout')
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user.sub, request.user.sid);
  }
}
