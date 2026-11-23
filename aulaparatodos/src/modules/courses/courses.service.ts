import { Injectable, NotFoundException } from '@nestjs/common';

import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, FilterCoursesDto } from './dto/courses.dto';
import { CoursesRepository } from './courses.repository';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  
  async findAll(filters: FilterCoursesDto) {
  const { page, limit, categoryId, modalidad } = filters;

  const [courses, total] = await this.coursesRepository.findAll(
    page,
    limit,
    categoryId,
    modalidad,
  );

  return {
    data: courses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne(id);

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { categoryId, ...courseData } = createCourseDto;

    const category = await this.categoriesService.findOne(categoryId);

    return this.coursesRepository.create({
      ...courseData,
      category,
    });
  }

  
  async update(
  id: string,
  updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
  // Verificamos que el curso exista y esté activo
  const course = await this.findOne(id);

  // Separamos la categoría del resto de los datos
  const { categoryId, ...courseData } = updateCourseDto;

  // Actualizamos los atributos recibidos
  Object.assign(course, courseData);

  // Si se envió una nueva categoría, verificamos su existencia
  if (categoryId !== undefined) {
    const category = await this.categoriesService.findOne(categoryId);

    course.category = category;
  }

  // Guardamos los cambios
  return await this.coursesRepository.update(course);
  }


  async remove(id: string): Promise<{ id: string }> {
    // Verificamos que el curso exista y esté activo
    const course = await this.findOne(id);

    // Realizamos el borrado lógico
    course.activo = false;

    // Guardamos el cambio en PostgreSQL
    await this.coursesRepository.update(course);

    return { id: course.id };
  }


}

