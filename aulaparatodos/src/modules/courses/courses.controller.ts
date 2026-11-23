import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

import {
  CreateCourseDto,
  UpdateCourseDto,
  FilterCoursesDto,
} from './dto/courses.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar cursos activos',
    description:
      'Permite obtener cursos activos con paginación y filtros opcionales por categoría y modalidad.',
  })
  @ApiOkResponse({
    description: 'Listado de cursos obtenido correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  async findAll(@Query() filters: FilterCoursesDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un curso por ID',
    description:
      'Devuelve el detalle de un curso activo junto con su categoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del curso',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Curso encontrado correctamente',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un curso',
    description:
      'Crea un curso asociado a una categoría existente.',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiCreatedResponse({
    description: 'Curso creado correctamente',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos del curso inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un curso',
    description:
      'Permite modificar parcialmente los datos de un curso activo.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del curso a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiOkResponse({
    description: 'Curso actualizado correctamente',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID incorrecto',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso o categoría no encontrada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar un curso',
    description:
      'Realiza un borrado lógico estableciendo activo=false. El curso permanece almacenado en la base de datos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del curso a desactivar',
    type: String,
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Curso desactivado correctamente',
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
    description: 'Curso no encontrado o ya desactivado',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string }> {
    return this.coursesService.remove(id);
  }
}



