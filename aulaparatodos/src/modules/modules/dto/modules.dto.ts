import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Título del módulo educativo',
    example: 'Introducción a JavaScript',
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

  @ApiProperty({
    description: 'Posición del módulo dentro del curso',
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

export class UpdateModuleDto extends PartialType(
  CreateModuleDto,
  { skipNullProperties: false },
) {}
