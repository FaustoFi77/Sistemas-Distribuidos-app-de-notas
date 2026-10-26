import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateNotaDto } from './create-nota.dto.js';

export class UpdateNotaDto extends PartialType(CreateNotaDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Marca la nota como notificada cuando vence su tiempo de validez',
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo notified debe ser booleano.' })
  notified?: boolean;
}
