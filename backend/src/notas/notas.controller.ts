import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  OptionalAuthGuard,
  type AuthenticatedRequest,
} from '../auth/auth.guard.js';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
import { Nota } from './entities/nota.entity.js';
import { NotasService } from './notas.service.js';

@ApiTags('notas')
@ApiBearerAuth()
@UseGuards(OptionalAuthGuard)
@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva nota o recordatorio' })
  @ApiCreatedResponse({
    description: 'Nota creada exitosamente',
    type: Nota,
  })
  create(
    @Body() createNotaDto: CreateNotaDto,
    @Req() req?: AuthenticatedRequest,
  ): Promise<Nota> {
    return this.notasService.create(createNotaDto, req?.user?.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las notas (ordenadas de más reciente a más antigua)',
  })
  @ApiOkResponse({
    description: 'Listado de notas',
    type: [Nota],
  })
  findAll(@Req() req?: AuthenticatedRequest): Promise<Nota[]> {
    return this.notasService.findAll(req?.user?.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nota por su ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la nota' })
  @ApiOkResponse({ description: 'Nota encontrada', type: Nota })
  @ApiNotFoundResponse({ description: 'Nota no encontrada' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<Nota> {
    return this.notasService.findOne(id, req?.user?.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Actualizar una nota existente (reinicia validez) o marcarla como notificada',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la nota' })
  @ApiOkResponse({ description: 'Nota actualizada', type: Nota })
  @ApiNotFoundResponse({ description: 'Nota no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotaDto: UpdateNotaDto,
    @Req() req?: AuthenticatedRequest,
  ): Promise<Nota> {
    return this.notasService.update(id, updateNotaDto, req?.user?.userId);
  }

  @Patch(':id/notified')
  @ApiOperation({ summary: 'Marcar una nota como notificada' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la nota' })
  @ApiOkResponse({ description: 'Nota marcada como notificada', type: Nota })
  @ApiNotFoundResponse({ description: 'Nota no encontrada' })
  markNotified(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<Nota> {
    return this.notasService.markNotified(id, req?.user?.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una nota por su ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID de la nota' })
  @ApiOkResponse({
    description: 'Nota eliminada',
    schema: {
      example: {
        mensaje: 'Nota eliminada',
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        ok: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Nota no encontrada' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    return this.notasService.remove(id, req?.user?.userId);
  }
}
