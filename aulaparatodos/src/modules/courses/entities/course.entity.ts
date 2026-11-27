import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { CourseModality } from '../../../common/course-modality.enum';
import { CourseLevel } from '../../../common/course-level.enum';
import { Category } from '../../categories/entities/category.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', nullable: true })
  descripcionDetallada!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl!: string | null;

  @Column({
    type: 'enum',
    enum: CourseLevel,
  })
  nivel!: CourseLevel;

  @Column({
    type: 'text',
    array: true,
    default: '{}',
  })
  objetivos!: string[];

  @Column({
    type: 'text',
    array: true,
    default: '{}',
  })
  requisitos!: string[];

  @Column({ type: 'int' })
  duracionHoras!: number;

  @Column({
    type: 'enum',
    enum: CourseModality,
  })
  modalidad!: CourseModality;

  @Column({ type: 'boolean', default: false })
  activo!: boolean;

  @Column({ type: 'int', default: 0 })
  cuposDisponibles!: number;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;
}
