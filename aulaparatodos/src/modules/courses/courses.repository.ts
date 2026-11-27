import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { Course } from './entities/course.entity';
import { CourseModality } from '../../common/course-modality.enum';
import { CourseLevel } from '../../common/course-level.enum';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  // Listado público y administrativo de cursos
  async findAll(
    page: number,
    limit: number,
    categoryId?: string,
    modalidad?: CourseModality,
    nivel?: CourseLevel,
    search?: string,
    activo?: boolean,
  ): Promise<[Course[], number]> {
    const query = this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category');

    if (activo !== undefined) {
      query.andWhere('course.activo = :activo', {
        activo,
      });
    }

    if (categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId,
      });
    }

    if (modalidad) {
      query.andWhere('course.modalidad = :modalidad', {
        modalidad,
      });
    }

    if (nivel) {
      query.andWhere('course.nivel = :nivel', {
        nivel,
      });
    }

    if (search?.trim()) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('course.titulo ILIKE :search', {
            search: `%${search.trim()}%`,
          }).orWhere('course.descripcion ILIKE :search');
        }),
      );
    }

    return query
      .orderBy('course.titulo', 'ASC')
      .addOrderBy('course.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  // Buscar un curso activo (consulta pública)
  async findOne(id: string): Promise<Course | null> {
    return this.repository.findOne({
      where: { id, activo: true },
      relations: { category: true },
    });
  }

  // Buscar un curso independientemente de su estado
  async findOneAdmin(id: string): Promise<Course | null> {
    return this.repository.findOne({
      where: { id },
      relations: { category: true },
    });
  }

  // Crear curso
  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.repository.create(courseData);
    return this.repository.save(course);
  }

  // Actualizar curso
  async update(course: Course): Promise<Course> {
    return await this.repository.save(course);
  }
}

  

