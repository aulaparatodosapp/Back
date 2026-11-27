import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';

import { Transform } from 'class-transformer';

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Título de la clase',
    example: 'Introducción a las variables',
    maxLength: 150,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El título debe ser un texto',
  })
  @IsNotEmpty({
    message: 'El título es obligatorio',
  })
  @MaxLength(150, {
    message: 'El título no puede superar los 150 caracteres',
  })
  titulo!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la clase',
    example: 'Aprenderemos a declarar variables en JavaScript',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'La descripción debe ser un texto',
  })
  descripcion?: string | null;

  @ApiPropertyOptional({
    description: 'Contenido educativo de la clase',
    example: 'Las variables permiten almacenar información...',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'El contenido debe ser un texto',
  })
  contenido?: string | null;

  @ApiPropertyOptional({
    description: 'URL del video educativo',
    example: 'https://www.youtube.com/watch?v=ejemplo',
    type: String,
    format: 'uri',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'La URL del video debe ser un texto',
  })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: true,
    },
    {
      message: 'La URL del video debe ser válida',
    },
  )
  @MaxLength(500, {
    message: 'La URL no puede superar los 500 caracteres',
  })
  videoUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si la clase es Premium',
    example: false,
    default: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean({
    message: 'esPremium debe ser un valor booleano',
  })
  esPremium?: boolean;

  @ApiProperty({
    description: 'Posición de la clase dentro del módulo',
    example: 1,
    minimum: 1,
  })
  @IsInt({
    message: 'El orden debe ser un número entero',
  })
  @Min(1, {
    message: 'El orden debe ser mayor o igual a 1',
  })
  orden!: number;
}

export class UpdateLessonDto extends PartialType(
  CreateLessonDto,
  { skipNullProperties: false },
) {}
