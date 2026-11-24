import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CourseModule } from './entities/course-module.entity';

@Injectable()
export class ModulesRepository {
  constructor(
    @InjectRepository(CourseModule)
    private readonly repository: Repository<CourseModule>,
  ) {}

  async create(
    moduleData: Partial<CourseModule>,
  ): Promise<CourseModule> {
    const courseModule = this.repository.create(moduleData);

    return await this.repository.save(courseModule);
  }

  async findByCourse(courseId: string): Promise<CourseModule[]> {
  return await this.repository.find({
    where: { cursoId: courseId },
    order: { orden: 'ASC' },
  });
  }

  async findOne(id: string): Promise<CourseModule | null> {
  return await this.repository.findOne({
    where: { id },
    relations: {
      curso: true,
    },
  });
  }
}
