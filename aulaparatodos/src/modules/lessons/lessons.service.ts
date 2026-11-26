import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ModulesService } from '../modules/modules.service';
import { LessonsRepository } from './lessons.repository';

import {
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/lessons.dto';

import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepository: LessonsRepository,
    private readonly modulesService: ModulesService,
  ) {}

  async create(
    moduleId: string,
    createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    const courseModule =
      await this.modulesService.findOneAdmin(moduleId);

    return await this.lessonsRepository.create({
      ...createLessonDto,
      esPremium: createLessonDto.esPremium ?? false,
      moduloId: courseModule.id,
      modulo: courseModule,
    });
  }

  async findByModule(moduleId: string) {
    await this.modulesService.findOne(moduleId);

    const lessons =
      await this.lessonsRepository.findByModule(moduleId);

    return lessons.map((lesson) =>
      this.toPublicLesson(lesson),
    );
  }

  async findOne(id: string) {
    const lesson =
      await this.lessonsRepository.findOne(id);

    if (!lesson || !lesson.modulo.curso.activo) {
      throw new NotFoundException(
        'Clase no encontrada',
      );
    }

    return this.toPublicLesson(lesson);
  }

  async findOneAdmin(id: string): Promise<Lesson> {
    const lesson =
      await this.lessonsRepository.findOne(id);

    if (!lesson) {
      throw new NotFoundException(
        'Clase no encontrada',
      );
    }

    return lesson;
  }

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    const lesson = await this.findOneAdmin(id);

    return await this.lessonsRepository.update(
      lesson,
      updateLessonDto,
    );
  }

  async remove(id: string): Promise<{ id: string }> {
    const lesson = await this.findOneAdmin(id);

    await this.lessonsRepository.remove(lesson);

    return { id };
  }

  private toPublicLesson(lesson: Lesson) {
    return {
      id: lesson.id,
      moduloId: lesson.moduloId,
      titulo: lesson.titulo,
      descripcion: lesson.descripcion,
      esPremium: lesson.esPremium,
      orden: lesson.orden,
    };
  }
}
