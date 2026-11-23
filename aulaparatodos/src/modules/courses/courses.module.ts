
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    CategoriesModule,
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    CoursesRepository,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
