import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las categorías',
    description: 'Obtiene las categorías disponibles.',
  })
  @ApiOkResponse({
    description: 'Categorías obtenidas correctamente',
    type: Category,
    isArray: true,
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener categoría por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoría',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Categoría encontrada',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una categoría',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCreatedResponse({
    description: 'Categoría creada correctamente',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'La categoría ya existe',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una categoría',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoría',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({
    description: 'Categoría actualizada correctamente',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID incorrecto',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra categoría con ese nombre',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una categoría',
    description:
      'Elimina físicamente una categoría. La operación puede fallar si existen cursos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la categoría',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Categoría eliminada correctamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string }> {
    return this.categoriesService.remove(id);
  }
}

