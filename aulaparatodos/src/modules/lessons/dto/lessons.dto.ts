import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Título de la clase',
    example: 'Introducción a las variables',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la clase',
    example: 'Aprenderemos a declarar variables en JavaScript',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @ApiPropertyOptional({
    description: 'Contenido educativo de la clase',
    example: 'Las variables permiten almacenar información...',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  contenido?: string | null;

  @ApiPropertyOptional({
    description: 'URL del video educativo',
    example: 'https://www.youtube.com/watch?v=ejemplo',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: true })
  @MaxLength(500)
  videoUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si la clase es premium',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esPremium?: boolean;

  @ApiProperty({
    description: 'Posición de la clase dentro del módulo',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  orden!: number;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
