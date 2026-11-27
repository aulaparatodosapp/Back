import { Injectable, NotFoundException } from '@nestjs/common';

import { Course } from './entities/course.entity';

import {
  CreateCourseDto,
  UpdateCourseDto,
  FilterCoursesDto,
  FilterAdminCoursesDto,
  UpdateCourseStatusDto,
} from './dto/courses.dto';

import { CoursesRepository } from './courses.repository';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  // Listado público de cursos activos
  async findAll(filters: FilterCoursesDto) {
    const {
      page,
      limit,
      categoryId,
      modalidad,
      nivel,
      search,
    } = filters;

    const [courses, total] =
      await this.coursesRepository.findAll(
        page,
        limit,
        categoryId,
        modalidad,
        nivel,
        search,
        true,
      );

    return {
      data: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Listado administrativo de cursos
  async findAllAdmin(filters: FilterAdminCoursesDto) {
    const {
      page,
      limit,
      categoryId,
      modalidad,
      nivel,
      search,
      activo,
    } = filters;

    const [courses, total] =
      await this.coursesRepository.findAll(
        page,
        limit,
        categoryId,
        modalidad,
        nivel,
        search,
        activo,
      );

    return {
      data: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Buscar un curso activo
  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne(id);

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  // Buscar un curso independientemente de su estado
  async findOneAdmin(id: string): Promise<Course> {
    const course =
      await this.coursesRepository.findOneAdmin(id);

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  // Crear un curso inactivo
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { categoryId, ...courseData } = createCourseDto;

    const category =
      await this.categoriesService.findOne(categoryId);

    return this.coursesRepository.create({
      ...courseData,
      category,
      activo: false,
    });
  }

  // Editar un curso activo o inactivo
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.findOneAdmin(id);

    const { categoryId, ...courseData } = updateCourseDto;

    Object.assign(course, courseData);

    if (categoryId !== undefined) {
      const category =
        await this.categoriesService.findOne(categoryId);

      course.category = category;
    }

    return this.coursesRepository.update(course);
  }

  // Activar o desactivar un curso
  async updateStatus(
    id: string,
    updateCourseStatusDto: UpdateCourseStatusDto,
  ): Promise<Course> {
    const course = await this.findOneAdmin(id);

    course.activo = updateCourseStatusDto.activo;

    return this.coursesRepository.update(course);
  }

  // Desactivación lógica del curso
  async remove(id: string): Promise<{ id: string }> {
    const course = await this.updateStatus(id, {
      activo: false,
    });

    return { id: course.id };
  }
}


