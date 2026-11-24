import { Injectable } from '@nestjs/common';

import { CoursesService } from '../courses/courses.service';
import { ModulesRepository } from './modules.repository';
import { CreateModuleDto } from './dto/modules.dto';
import { CourseModule } from './entities/course-module.entity';

@Injectable()
export class ModulesService {
  constructor(
    private readonly modulesRepository: ModulesRepository,
    private readonly coursesService: CoursesService,
  ) {}

  async create(
    courseId: string,
    createModuleDto: CreateModuleDto,
  ): Promise<CourseModule> {
    // Verificamos que el curso exista y esté activo
    const course = await this.coursesService.findOne(courseId);

    // Creamos el módulo asociado al curso
    return await this.modulesRepository.create({
      ...createModuleDto,
      curso: course,
    });
  }

  async findByCourse(courseId: string): Promise<CourseModule[]> {
  // Verificamos que el curso exista y esté activo
  await this.coursesService.findOne(courseId);

  // Obtenemos los módulos educativos del curso
  return await this.modulesRepository.findByCourse(courseId);
}
}
