import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CoursesModule } from './modules/courses/courses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SeedersModule } from './seeders/seeders.module';
import { ModulesModule } from './modules/modules/modules.module';
import { LessonsModule } from './modules/lessons/lessons.module';

import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        typeOrmConfig(configService),
    }),

    CoursesModule,
    CategoriesModule,
    ModulesModule,
    LessonsModule,
    SeedersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}