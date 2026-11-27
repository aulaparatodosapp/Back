import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repository';

import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    ModulesModule,
  ],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonsRepository,
  ],
  exports: [LessonsService],
})
export class LessonsModule {}
