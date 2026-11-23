import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsUUID,
  IsOptional,
  IsBoolean,
  Max
} from 'class-validator';

import { CourseModality } from '../../../common/course-modality.enum';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Introducción a JavaScript',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @ApiProperty({
    example: 'Curso introductorio de JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

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

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

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
}