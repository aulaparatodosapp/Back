
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseModality } from '../../common/course-modality.enum';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  
async findAll(
  page: number,
  limit: number,
  categoryId?: string,
  modalidad?: CourseModality,
): Promise<[Course[], number]> {
  const query = this.repository
    .createQueryBuilder('course')
    .leftJoinAndSelect('course.category', 'category')
    .where('course.activo = :activo', { activo: true });

  if (categoryId) {
    query.andWhere('category.id = :categoryId', { categoryId });
  }

  if (modalidad) {
    query.andWhere('course.modalidad = :modalidad', { modalidad });
  }

  return query
    .orderBy('course.titulo', 'ASC')
    .addOrderBy('course.id', 'ASC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();
}


  async findOne(id: string): Promise<Course | null> {
    return this.repository.findOne({
      where: { id, activo: true },
      relations: { category: true },
    });
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.repository.create(courseData);
    return this.repository.save(course);
  }

  async update(course: Course): Promise<Course> {
    return await this.repository.save(course);
}
}
  

