import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ALUMNO = 'alumno',
  ADMINISTRADOR = 'administrador',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  phoneCountryCode!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ALUMNO })
  role!: UserRole;
}
