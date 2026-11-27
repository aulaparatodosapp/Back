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

import { ModulesService } from './modules.service';

import {
  CreateModuleDto,
  UpdateModuleDto,
} from './dto/modules.dto';

const moduleExample = {
  id: '828ef6df-8deb-4018-9430-7ba18488e5fd',
  cursoId: '761dee18-48bf-4f95-b6f3-48890608d686',
  titulo: 'Introducción a JavaScript',
  orden: 1,
};

@ApiTags('Modules')
@Controller()
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
  ) {}

  @Post('courses/:courseId/modules')
  @ApiOperation({
    summary: 'Crear un módulo educativo dentro de un curso',
    description:
      'Operación administrativa. El nuevo módulo debe ocupar la siguiente posición disponible dentro del curso.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'UUID del curso',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: CreateModuleDto })
  @ApiCreatedResponse({
    description: 'Módulo educativo creado correctamente',
    schema: {
      example: moduleExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Curso no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'UUID inválido, datos incorrectos o posición no consecutiva.',
  })
  async create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return await this.modulesService.create(
      courseId,
      createModuleDto,
    );
  }

  @Get('courses/:courseId/modules')
  @ApiOperation({
    summary: 'Obtener todos los módulos de un curso activo',
    description:
      'Consulta pública. Devuelve los módulos ordenados de forma ascendente según su posición.',
  })
  @ApiParam({
    name: 'courseId',
    description: 'UUID del curso',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Listado de módulos ordenados correctamente',
    schema: {
      example: [moduleExample],
    },
  })
  @ApiNotFoundResponse({
    description: 'Curso no encontrado o inactivo',
  })
  @ApiBadRequestResponse({
    description: 'UUID del curso inválido',
  })
  async findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return await this.modulesService.findByCourse(courseId);
  }

  @Get('modules/:id')
  @ApiOperation({
    summary: 'Consultar un módulo educativo por su ID',
    description:
      'Consulta pública de un módulo perteneciente a un curso activo.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del módulo',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Módulo encontrado correctamente',
  })
  @ApiNotFoundResponse({
    description: 'Módulo no encontrado o curso inactivo',
  })
  @ApiBadRequestResponse({
    description: 'UUID del módulo inválido',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.modulesService.findOne(id);
  }

  @Patch('modules/:id')
  @ApiOperation({
    summary: 'Actualizar un módulo educativo',
    description:
      'Operación administrativa. Permite actualizar el título y la posición del módulo. Si se modifica el orden, los demás módulos se reorganizan automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del módulo',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiBody({ type: UpdateModuleDto })
  @ApiOkResponse({
    description: 'Módulo actualizado correctamente',
    schema: {
      example: moduleExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'Módulo no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'UUID inválido, datos incorrectos o posición fuera del rango permitido.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return await this.modulesService.update(
      id,
      updateModuleDto,
    );
  }

  @Delete('modules/:id')
  @ApiOperation({
    summary: 'Eliminar un módulo educativo sin clases',
    description:
      'Operación administrativa. Solo permite eliminar módulos que no contienen clases. Los módulos restantes se reordenan automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del módulo',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiOkResponse({
    description: 'Módulo eliminado correctamente',
    schema: {
      example: {
        id: moduleExample.id,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Módulo no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'UUID inválido o módulo con clases asociadas.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.modulesService.remove(id);
  }
}