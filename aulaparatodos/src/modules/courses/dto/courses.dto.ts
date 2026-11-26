import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsUUID,
  IsOptional,
  Max,
  IsArray,
  IsUrl,
  ValidateIf,
  IsBoolean,
} from 'class-validator';

import { CourseModality } from '../../../common/course-modality.enum';
import { CourseLevel } from '../../../common/course-level.enum';
import { Type, Transform } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Informática general',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @ApiProperty({
    example: 'Aprende los fundamentos de la informática',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional({
    description: 'Descripción ampliada del curso',
    example: 'Este curso está diseñado para desarrollar habilidades informáticas básicas.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcionDetallada?: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen de portada',
    example: 'https://example.com/informatica.jpg',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(500)
  imagenUrl?: string | null;

  @ApiProperty({
    description: 'Nivel de dificultad del curso',
    enum: CourseLevel,
    example: CourseLevel.BASICO,
  })
  @IsEnum(CourseLevel, {
    message: 'El nivel debe ser basico, intermedio o avanzado',
  })
  nivel!: CourseLevel;

  @ApiPropertyOptional({
    description: 'Objetivos de aprendizaje del curso',
    type: [String],
    example: [
      'Comprender el funcionamiento de una computadora',
      'Identificar los componentes informáticos',
      'Utilizar herramientas digitales básicas',
    ],
    default: [],
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  objetivos?: string[];

  @ApiPropertyOptional({
    description: 'Requisitos para realizar el curso',
    type: [String],
    example: [
      'No necesitas conocimientos previos',
      'Tener interés en aprender informática',
    ],
    default: [],
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  requisitos?: string[];

  @ApiProperty({
    description: 'Duración del curso expresada en horas',
    example: 40,
  })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración debe ser mayor a cero' })
  duracionHoras!: number;

  @ApiProperty({
    enum: CourseModality,
    example: CourseModality.VIRTUAL,
  })
  @IsEnum(CourseModality)
  modalidad!: CourseModality;

  @ApiProperty({
    description: 'Cantidad de cupos disponibles (máximo 5)',
    example: 5,
    minimum: 0,
    maximum: 5,
  })
  @IsInt({ message: 'Los cupos deben ser un número entero' })
  @Min(0, { message: 'Los cupos no pueden ser negativos' })
  @Max(5, { message: 'El máximo permitido es de 5 cupos' })
  cuposDisponibles!: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;
}

export class UpdateCourseDto extends PartialType(
  CreateCourseDto,
  { skipNullProperties: false },
) {}

export class FilterCoursesDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de cursos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'UUID de la categoría',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Modalidad del curso',
    enum: CourseModality,
  })
  @IsOptional()
  @IsEnum(CourseModality)
  modalidad?: CourseModality;

  @ApiPropertyOptional({
    description: 'Nivel de dificultad del curso',
    enum: CourseLevel,
    example: CourseLevel.BASICO,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  nivel?: CourseLevel;

  @ApiPropertyOptional({
    description: 'Buscar cursos por título o descripción',
    example: 'informática',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  search?: string;
}

// DTO exclusivo para activar o desactivar cursos
export class UpdateCourseStatusDto {
  @ApiProperty({
    description: 'Estado del curso',
    example: true,
  })
  @IsBoolean({
    message: 'El estado del curso debe ser un booleano',
  })
  activo!: boolean;
}

// Filtros exclusivos del administrador
export class FilterAdminCoursesDto extends FilterCoursesDto {
  @ApiPropertyOptional({
    description: 'Filtrar cursos por estado activo o inactivo',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({
    message: 'El estado debe ser true o false',
  })
  activo?: boolean;
}
