import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Lesson } from './entities/lesson.entity';
import { CourseModule } from '../modules/entities/course-module.entity';
import { Course } from '../courses/entities/course.entity';
import { UpdateLessonDto } from './dto/lessons.dto';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectRepository(Lesson)
    private readonly repository: Repository<Lesson>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    lessonData: Partial<Lesson>,
  ): Promise<Lesson> {
    return await this.dataSource.transaction(async (manager) => {
      const moduleId = lessonData.moduloId!;
      const orden = lessonData.orden!;

      await this.lockModule(manager, moduleId);

      const repository = manager.getRepository(Lesson);

      const total = await repository.count({
        where: { moduloId: moduleId },
      });

      if (orden !== total + 1) {
        throw new BadRequestException(
          `La nueva clase debe ocupar la posición ${total + 1}`,
        );
      }

      const lesson = repository.create(lessonData);

      return await repository.save(lesson);
    });
  }

  async findByModule(
    moduleId: string,
  ): Promise<Lesson[]> {
    return await this.repository.find({
      where: { moduloId: moduleId },
      order: {
        orden: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Lesson | null> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        modulo: {
          curso: true,
        },
      },
    });
  }

  async update(
    lesson: Lesson,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return await this.dataSource.transaction(async (manager) => {
      await this.lockModule(manager, lesson.moduloId);

      const repository = manager.getRepository(Lesson);

      const lessons = await repository.find({
        where: { moduloId: lesson.moduloId },
        order: {
          orden: 'ASC',
          id: 'ASC',
        },
      });

      const currentIndex = lessons.findIndex(
        (item) => item.id === lesson.id,
      );

      if (currentIndex === -1) {
        throw new NotFoundException('Clase no encontrada');
      }

      const currentLesson = lessons[currentIndex];

      const newOrder =
        updateLessonDto.orden ?? currentLesson.orden;

      if (newOrder < 1 || newOrder > lessons.length) {
        throw new BadRequestException(
          `El orden debe estar entre 1 y ${lessons.length}`,
        );
      }

      if (newOrder !== currentLesson.orden) {
        lessons.splice(currentIndex, 1);
        lessons.splice(newOrder - 1, 0, currentLesson);

        await this.reorderLessons(manager, lessons);
      }

      Object.assign(currentLesson, updateLessonDto);

      return await repository.save(currentLesson);
    });
  }

  async remove(lesson: Lesson): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.lockModule(manager, lesson.moduloId);

      const repository = manager.getRepository(Lesson);

      const currentLesson = await repository.findOne({
        where: { id: lesson.id },
      });

      if (!currentLesson) {
        throw new NotFoundException('Clase no encontrada');
      }

      await repository.remove(currentLesson);

      const remainingLessons = await repository.find({
        where: { moduloId: lesson.moduloId },
        order: {
          orden: 'ASC',
          id: 'ASC',
        },
      });

      await this.reorderLessons(manager, remainingLessons);
    });
  }

  private async lockModule(
    manager: EntityManager,
    moduleId: string,
  ): Promise<void> {
    const courseModule = await manager.findOne(CourseModule, {
      where: { id: moduleId },
    });

    if (!courseModule) {
      throw new NotFoundException(
        'Módulo educativo no encontrado',
      );
    }

    const course = await manager.findOne(Course, {
      where: { id: courseModule.cursoId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificamos nuevamente el módulo después de bloquear el curso
    const existingModule = await manager.findOne(CourseModule, {
      where: {
        id: moduleId,
        cursoId: course.id,
      },
    });

    if (!existingModule) {
      throw new NotFoundException(
        'Módulo educativo no encontrado',
      );
    }
  }

  private async reorderLessons(
    manager: EntityManager,
    lessons: Lesson[],
  ): Promise<void> {
    if (lessons.length === 0) return;

    const repository = manager.getRepository(Lesson);

    const maxOrder = Math.max(
      ...lessons.map((item) => item.orden),
      lessons.length,
    );

    // Asignamos posiciones temporales sin duplicados
    for (let i = 0; i < lessons.length; i++) {
      await repository.update(lessons[i].id, {
        orden: maxOrder + i + 1,
      });
    }

    // Asignamos las posiciones definitivas
    for (let i = 0; i < lessons.length; i++) {
      lessons[i].orden = i + 1;

      await repository.update(lessons[i].id, {
        orden: i + 1,
      });
    }
  }
}