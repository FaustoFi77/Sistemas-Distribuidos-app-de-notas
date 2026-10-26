import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Nota {
  @ApiProperty({
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Identificador único de la nota',
  })
  id: string;

  @ApiProperty({
    example: 'Estudiar Sistemas Distribuidos',
    description: 'Título de la nota',
  })
  title: string;

  @ApiPropertyOptional({
    example: '#ffff88',
    description: 'Color visual de la nota adhesiva',
  })
  color?: string;

  @ApiProperty({
    example: 'Repasar separación en capas, DTOs, inyección de dependencias y Swagger',
    description: 'Contenido o descripción del recordatorio',
  })
  text: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    description: 'Minutos de validez antes de que venza el recordatorio',
  })
  minutes: number;

  @ApiProperty({
    example: 1761420000000,
    description: 'Timestamp (ms) de creación o última edición de la nota',
  })
  createdAt: number;

  @ApiProperty({
    example: false,
    description: 'Indica si la nota ya fue notificada al usuario',
  })
  notified: boolean;
}

export function expiresAt(note: Nota): number {
  return note.createdAt + note.minutes * 60_000;
}

export function isExpired(note: Nota, now: number = Date.now()): boolean {
  return now >= expiresAt(note);
}
