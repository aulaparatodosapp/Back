import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CompleteProfileDto } from './dtos/auth-dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  completeProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.usersService.completeProfile(request.user.sub, dto);
  }
}
