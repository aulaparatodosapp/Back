import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { typeOrmConfig } from './typeorm.config';

import { Category } from '../modules/categories/entities/category.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { CourseModule } from '../modules/modules/entities/course-module.entity';
import { Lesson } from '../modules/lessons/entities/lesson.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  ...typeOrmConfig(configService),

  entities: [
    Category,
    Course,
    CourseModule,
    Lesson,
  ],

  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
} as DataSourceOptions);