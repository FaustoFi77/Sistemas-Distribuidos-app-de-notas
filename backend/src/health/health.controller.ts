import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar el estado de salud del servicio' })
  @ApiOkResponse({ schema: { example: { estado: 'ok' } } })
  check() {
    return { estado: 'ok' };
  }
}
