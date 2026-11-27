import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { CourseModule } from './entities/course-module.entity';
import { Course } from '../courses/entities/course.entity';
import { UpdateModuleDto } from './dto/modules.dto';

@Injectable()
export class ModulesRepository {
  constructor(
    @InjectRepository(CourseModule)
    private readonly repository: Repository<CourseModule>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    moduleData: Partial<CourseModule>,
  ): Promise<CourseModule> {
    return await this.dataSource.transaction(async (manager) => {
      const courseId = moduleData.cursoId!;
      const orden = moduleData.orden!;

      await this.lockCourse(manager, courseId);

      const repository = manager.getRepository(CourseModule);

      const total = await repository.count({
        where: { cursoId: courseId },
      });

      if (orden !== total + 1) {
        throw new BadRequestException(
          `El nuevo módulo debe ocupar la posición ${total + 1}`,
        );
      }

      const courseModule = repository.create(moduleData);

      return await repository.save(courseModule);
    });
  }

  async findByCourse(
    courseId: string,
  ): Promise<CourseModule[]> {
    return await this.repository.find({
      where: { cursoId: courseId },
      order: {
        orden: 'ASC',
        id: 'ASC',
      },
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

  async update(
    courseModule: CourseModule,
    updateModuleDto: UpdateModuleDto,
  ): Promise<CourseModule> {
    return await this.dataSource.transaction(async (manager) => {
      await this.lockCourse(manager, courseModule.cursoId);

      const repository = manager.getRepository(CourseModule);

      const modules = await repository.find({
        where: { cursoId: courseModule.cursoId },
        order: { orden: 'ASC', id: 'ASC' },
      });

      const currentIndex = modules.findIndex(
        (item) => item.id === courseModule.id,
      );

      if (currentIndex === -1) {
        throw new NotFoundException(
          'Módulo educativo no encontrado',
        );
      }

      const currentModule = modules[currentIndex];

      const newOrder =
        updateModuleDto.orden ?? currentModule.orden;

      if (newOrder < 1 || newOrder > modules.length) {
        throw new BadRequestException(
          `El orden debe estar entre 1 y ${modules.length}`,
        );
      }

      if (newOrder !== currentModule.orden) {
        modules.splice(currentIndex, 1);
        modules.splice(newOrder - 1, 0, currentModule);

        await this.reorderModules(manager, modules);
      }

      Object.assign(currentModule, updateModuleDto);

      return await repository.save(currentModule);
    });
  }

  async remove(courseModule: CourseModule): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.lockCourse(manager, courseModule.cursoId);

      const repository = manager.getRepository(CourseModule);

      const currentModule = await repository.findOne({
        where: { id: courseModule.id },
      });

      if (!currentModule) {
        throw new NotFoundException(
          'Módulo educativo no encontrado',
        );
      }

      const lessonsCount = await repository
        .createQueryBuilder('module')
        .innerJoin('module.clases', 'lesson')
        .where('module.id = :id', { id: currentModule.id })
        .select('COUNT(lesson.id)', 'total')
        .getRawOne<{ total: string }>();

      if (Number(lessonsCount?.total ?? 0) > 0) {
        throw new BadRequestException(
          'No se puede eliminar un módulo que contiene clases',
        );
      }

      await repository.remove(currentModule);

      const remainingModules = await repository.find({
        where: { cursoId: courseModule.cursoId },
        order: { orden: 'ASC', id: 'ASC' },
      });

      await this.reorderModules(manager, remainingModules);
    });
  }

  async countLessons(id: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('module')
      .innerJoin('module.clases', 'lesson')
      .where('module.id = :id', { id })
      .select('COUNT(lesson.id)', 'total')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  private async lockCourse(
    manager: EntityManager,
    courseId: string,
  ): Promise<void> {
    const course = await manager.findOne(Course, {
      where: { id: courseId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
  }

  private async reorderModules(
    manager: EntityManager,
    modules: CourseModule[],
  ): Promise<void> {
    if (modules.length === 0) return;

    const repository = manager.getRepository(CourseModule);

    const maxOrder = Math.max(
      ...modules.map((item) => item.orden),
      modules.length,
    );

    // Asignamos posiciones temporales sin duplicados
    for (let i = 0; i < modules.length; i++) {
      await repository.update(modules[i].id, {
        orden: maxOrder + i + 1,
      });
    }

    // Asignamos las posiciones definitivas
    for (let i = 0; i < modules.length; i++) {
      modules[i].orden = i + 1;

      await repository.update(modules[i].id, {
        orden: i + 1,
      });
    }
  }
}
