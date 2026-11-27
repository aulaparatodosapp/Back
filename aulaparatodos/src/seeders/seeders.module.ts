import { Module } from '@nestjs/common';
import { SeedersService } from '../seeders/seeders.service';

@Module({
  providers: [SeedersService],
  exports: [SeedersService],
})
export class SeedersModule {}