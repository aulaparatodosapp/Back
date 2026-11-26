import {
  Controller,
  Get,
  Post,
  Patch,
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
  FilterAdminCoursesDto,
  UpdateCourseStatusDto,
} from './dto/courses.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  // Listado público
  @Get()
  @ApiOperation({
    summary: 'Listar cursos activos',
    description:
      'Permite obtener cursos activos con paginación, filtros por categoría, modalidad y nivel, y búsqueda por título o descripción.',
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

  // Detalle público
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un curso activo por ID',
    description:
      'Devuelve el detalle de un curso activo junto con su categoría, nivel, imagen, descripción detallada, objetivos y requisitos.',
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

  // ADMIN: Crear curso
  @Post()
  @ApiOperation({
    summary: 'Crear un curso',
    description:
      'Permite al administrador crear un curso inactivo asociado a una categoría existente y asignarle un nivel básico, intermedio o avanzado.',
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

  // ADMIN: Editar curso
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un curso',
    description:
      'Permite al administrador modificar parcialmente los datos de un curso activo o inactivo, incluyendo su nivel.',
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

  // ADMIN: Activar o desactivar curso
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Activar o desactivar un curso',
    description:
      'Permite al administrador modificar el estado de un curso sin eliminarlo de la base de datos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del curso',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCourseStatusDto })
  @ApiOkResponse({
    description: 'Estado del curso actualizado correctamente',
    type: Course,
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido o UUID incorrecto',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso no encontrado',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseStatusDto: UpdateCourseStatusDto,
  ): Promise<Course> {
    return this.coursesService.updateStatus(
      id,
      updateCourseStatusDto,
    );
  }
}

@ApiTags('Admin - Courses')
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
  ) {}

  // ADMIN: Listar todos los cursos
  @Get()
  @ApiOperation({
    summary: 'Listar todos los cursos',
    description:
      'Permite al administrador consultar cursos activos e inactivos, con paginación, búsqueda y filtros por categoría, modalidad, nivel y estado.',
  })
  @ApiOkResponse({
    description: 'Listado de cursos obtenido correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos',
  })
  async findAllAdmin(
    @Query() filters: FilterAdminCoursesDto,
  ) {
    return this.coursesService.findAllAdmin(filters);
  }

  // ADMIN: Consultar cualquier curso por ID
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cualquier curso por ID',
    description:
      'Permite al administrador consultar el detalle de un curso independientemente de su estado.',
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
  async findOneAdmin(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Course> {
    return this.coursesService.findOneAdmin(id);
  }
}




