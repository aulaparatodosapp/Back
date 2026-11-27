import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from './entities/course-module.entity';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { ModulesRepository } from './modules.repository';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseModule]),
    CoursesModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService, ModulesRepository],
  exports: [ModulesService],
})
export class ModulesModule {}

