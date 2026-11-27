
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { CourseModule } from '../../modules/entities/course-module.entity';

@Entity('lessons')
@Unique('UQ_lessons_modulo_orden', ['moduloId', 'orden'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  moduloId!: string;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'text', nullable: true })
  contenido!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl!: string | null;

  @Column({ type: 'boolean', default: false })
  esPremium!: boolean;

  @Column({ type: 'int' })
  orden!: number;

  @ManyToOne(
    () => CourseModule,
    (courseModule) => courseModule.clases,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'moduloId' })
  modulo!: CourseModule;
}

