import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CoursesService } from '../courses/courses.service';
import { ModulesRepository } from './modules.repository';

import {
  CreateModuleDto,
  UpdateModuleDto,
} from './dto/modules.dto';

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
    const course =
      await this.coursesService.findOneAdmin(courseId);

    return await this.modulesRepository.create({
      ...createModuleDto,
      cursoId: course.id,
      curso: course,
    });
  }

  async findByCourse(
    courseId: string,
  ): Promise<CourseModule[]> {
    await this.coursesService.findOne(courseId);

    return await this.modulesRepository.findByCourse(courseId);
  }

  async findOne(id: string): Promise<CourseModule> {
    const courseModule =
      await this.modulesRepository.findOne(id);

    if (!courseModule || !courseModule.curso.activo) {
      throw new NotFoundException(
        'Módulo educativo no encontrado',
      );
    }

    return courseModule;
  }

  async findOneAdmin(id: string): Promise<CourseModule> {
    const courseModule =
      await this.modulesRepository.findOne(id);

    if (!courseModule) {
      throw new NotFoundException(
        'Módulo educativo no encontrado',
      );
    }

    return courseModule;
  }

  async update(
    id: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<CourseModule> {
    const courseModule = await this.findOneAdmin(id);

    return await this.modulesRepository.update(
      courseModule,
      updateModuleDto,
    );
  }

  async remove(id: string): Promise<{ id: string }> {
    const courseModule = await this.findOneAdmin(id);

    await this.modulesRepository.remove(courseModule);

    return { id };
  }
}