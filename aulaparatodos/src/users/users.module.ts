import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneCountriesController } from './phone-countries.controller';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PhoneCountriesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
