import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Get
} from '@nestjs/common';

import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/modules.dto';

@ApiTags('Modules')
@Controller()
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
  ) {}

  @Post('courses/:courseId/modules')
  @ApiOperation({
    summary: 'Crear un módulo educativo dentro de un curso',
  })
  @ApiParam({
    name: 'courseId',
    description: 'UUID del curso',
    type: String,
  })
  @ApiBody({ type: CreateModuleDto })
  @ApiCreatedResponse({
    description: 'Módulo educativo creado correctamente',
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
    summary: 'Obtener todos los módulos educativos de un curso',
    })
    @ApiParam({
    name: 'courseId',
    description: 'UUID del curso',
    type: String,
    })
    @ApiOkResponse({
    description: 'Listado de módulos educativos ordenados correctamente',
    })
    async findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    ) {
    return await this.modulesService.findByCourse(courseId);
    }
}
