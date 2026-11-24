import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

import { CourseModality } from '../../../common/course-modality.enum';
import { Category } from '../../categories/entities/category.entity';
import { CourseModule } from '../../modules/entities/course-module.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'int' })
  duracionHoras!: number;

  @Column({
    type: 'enum',
    enum: CourseModality,
  })
  modalidad!: CourseModality;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'int', default: 0 })
  cuposDisponibles!: number;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(
  () => CourseModule,
  (courseModule) => courseModule.curso,
  )
  modulos!: CourseModule[];
}