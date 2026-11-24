import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
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
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @ApiProperty({
    description: 'Posición del módulo dentro del curso',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  orden!: number;
}

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}
