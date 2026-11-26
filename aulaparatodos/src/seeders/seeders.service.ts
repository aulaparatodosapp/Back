import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { Category } from '../modules/categories/entities/category.entity';
import { Course } from '../modules/courses/entities/course.entity';

import { categoriesSeed } from './data/categories.seed';
import { coursesSeed } from './data/courses.seed';

@Injectable()
export class SeedersService {
  private readonly logger = new Logger(SeedersService.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async seed(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.seedCategories(manager);
      await this.seedCourses(manager);
    });

    this.logger.log('Seeders ejecutados correctamente');
  }

  private async seedCategories(
    manager: EntityManager,
  ): Promise<void> {
    const categoriesRepository = manager.getRepository(Category);

    for (const categoryData of categoriesSeed) {
      const existingCategory = await categoriesRepository.findOneBy({
        nombre: categoryData.nombre,
      });

      if (existingCategory) {
        continue;
      }

      const category = categoriesRepository.create(categoryData);

      await categoriesRepository.save(category);

      this.logger.log(`Categoría creada: ${category.nombre}`);
    }
  }

  private async seedCourses(
    manager: EntityManager,
  ): Promise<void> {
    const coursesRepository = manager.getRepository(Course);
    const categoriesRepository = manager.getRepository(Category);

    for (const courseSeed of coursesSeed) {
      const { categoriaNombre, ...courseData } = courseSeed;

      const existingCourse = await coursesRepository.findOneBy({
        titulo: courseData.titulo,
      });

      if (existingCourse) {
        continue;
      }

      const category = await categoriesRepository.findOneBy({
        nombre: categoriaNombre,
      });

      if (!category) {
        throw new Error(
          `No se encontró la categoría: ${categoriaNombre}`,
        );
      }

      const course = coursesRepository.create({
        ...courseData,
        category,
        activo: true,
      });

      await coursesRepository.save(course);

      this.logger.log(`Curso creado: ${course.titulo}`);
    }
  }
}
