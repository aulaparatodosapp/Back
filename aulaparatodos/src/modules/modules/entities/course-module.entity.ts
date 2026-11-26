import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique
} from 'typeorm';

import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('course_modules')
@Unique('UQ_course_modules_curso_orden', ['cursoId', 'orden'])
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  cursoId!: string;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'int' })
  orden!: number;

  @ManyToOne(
    () => Course,
    (course) => course.modulos,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'cursoId' })
  curso!: Course;

  @OneToMany(
  () => Lesson,
  (lesson) => lesson.modulo,
   )
   clases!: Lesson[];
}

