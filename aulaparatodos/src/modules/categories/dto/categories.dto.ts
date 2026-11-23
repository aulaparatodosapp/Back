
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Programación',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Cursos relacionados con programación',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
