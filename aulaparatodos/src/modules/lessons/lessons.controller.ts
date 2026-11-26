import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';

import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { LessonsService } from './lessons.service';

import {
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/lessons.dto';

const publicLessonExample = {
  id: '0967f3e7-04d8-4b39-b335-41c733bc2262',
  moduloId: 'd91d3755-c929-4863-be37-51a519e52a24',
  titulo: 'Ejercicios prácticos con variables',
  descripcion: 'Ejercicios para aplicar los conocimientos adquiridos.',
  esPremium: true,
  orden: 1,
};

const adminLessonExample = {
  ...publicLessonExample,
  contenido: 'Resolución de ejercicios prácticos.',
  videoUrl: 'https://www.youtube.com/watch?v=ejemplo',
};

@ApiTags('Lessons')
@Controller()
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
  ) {}

  @Post('modules/:moduleId/lessons')
  @ApiOperation({
    summary: 'Crear una clase dentro de un módulo',
    description:
      'Operación administrativa. Permite crear clases estándar o Premium. La nueva clase debe ocupar la siguiente posición disponible dentro del módulo.',
  })
  @ApiParam({
    name: 'moduleId',
    description: 'UUID del módulo educativo',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: CreateLessonDto })
  @ApiCreatedResponse({
    description: 'Clase creada correctamente',
    schema: {
      example: adminLessonExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Módulo no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'UUID inválido, datos incorrectos o posición no consecutiva.',
  })
  async create(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return await this.lessonsService.create(
      moduleId,
      createLessonDto,
    );
  }

  @Get('modules/:moduleId/lessons')
  @ApiOperation({
    summary: 'Listar información pública de las clases de un módulo',
    description:
      'Consulta pública. Devuelve las clases ordenadas de forma ascendente, incluyendo su clasificación estándar o Premium, sin exponer el contenido educativo ni la URL del video.',
  })
  @ApiParam({
    name: 'moduleId',
    description: 'UUID del módulo educativo',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Listado de clases ordenadas correctamente',
    schema: {
      example: [publicLessonExample],
    },
  })
  @ApiNotFoundResponse({
    description: 'Módulo no encontrado o curso inactivo',
  })
  @ApiBadRequestResponse({
    description: 'UUID del módulo inválido',
  })
  async findByModule(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
  ) {
    return await this.lessonsService.findByModule(moduleId);
  }

  @Get('lessons/:id')
  @ApiOperation({
    summary: 'Consultar información pública de una clase',
    description:
      'Consulta pública de una clase perteneciente a un curso activo. No incluye el contenido educativo ni la URL del video.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la clase',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Clase encontrada correctamente',
    schema: {
      example: publicLessonExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Clase no encontrada o curso inactivo',
  })
  @ApiBadRequestResponse({
    description: 'UUID de la clase inválido',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.lessonsService.findOne(id);
  }

  @Patch('lessons/:id')
  @ApiOperation({
    summary: 'Actualizar una clase',
    description:
      'Operación administrativa. Permite actualizar el título, descripción, contenido, video, clasificación Premium y posición de una clase. Si se modifica el orden, las demás clases se reorganizan automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la clase',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: UpdateLessonDto })
  @ApiOkResponse({
    description: 'Clase actualizada correctamente',
    schema: {
      example: adminLessonExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Clase no encontrada',
  })
  @ApiBadRequestResponse({
    description:
      'UUID inválido, datos incorrectos o posición fuera del rango permitido.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return await this.lessonsService.update(
      id,
      updateLessonDto,
    );
  }

  @Delete('lessons/:id')
  @ApiOperation({
    summary: 'Eliminar una clase',
    description:
      'Operación administrativa. Elimina una clase y reorganiza automáticamente las posiciones de las clases restantes dentro del módulo.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la clase',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Clase eliminada correctamente',
    schema: {
      example: {
        id: publicLessonExample.id,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Clase no encontrada',
  })
  @ApiBadRequestResponse({
    description: 'UUID de la clase inválido',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.lessonsService.remove(id);
  }
}
