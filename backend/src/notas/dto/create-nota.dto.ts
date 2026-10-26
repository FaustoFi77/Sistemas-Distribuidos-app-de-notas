import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNotaDto {
  @ApiProperty({
    example: 'Estudiar Sistemas Distribuidos',
    description: 'Título obligatorio de la nota (también acepta "titulo")',
  })
  @Transform(
    ({
      value,
      obj,
    }: {
      value: unknown;
      obj?: Record<string, unknown>;
    }) => {
      const val = value ?? obj?.titulo;
      return typeof val === 'string' ? val.trim() : val;
    },
  )
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres.' })
  title: string;

  @ApiPropertyOptional({
    example: 'Repasar NestJS, repositorios JSON y Swagger',
    default: '',
    description: 'Texto o detalle de la nota (también acepta "texto")',
  })
  @Transform(
    ({
      value,
      obj,
    }: {
      value: unknown;
      obj?: Record<string, unknown>;
    }) => {
      const val = value ?? obj?.texto;
      return typeof val === 'string' ? val.trim() : '';
    },
  )
  @IsOptional()
  @IsString({ message: 'El texto debe ser una cadena de caracteres.' })
  text?: string = '';

  @ApiPropertyOptional({
    example: '#ffff88',
    default: '#ffff88',
    description: 'Color visual de la nota',
  })
  @IsOptional()
  @IsString()
  color?: string = '#ffff88';

  @ApiProperty({
    example: 5,
    minimum: 1,
    description: 'Minutos de validez (entero mayor a 0, también acepta "minutosValidez")',
  })
  @Transform(
    ({
      value,
      obj,
    }: {
      value: unknown;
      obj?: Record<string, unknown>;
    }) => {
      return value ?? obj?.minutosValidez;
    },
  )
  @Type(() => Number)
  @IsInt({
    message: 'Los minutos de validez tienen que ser un entero mayor a 0.',
  })
  @Min(1, {
    message: 'Los minutos de validez tienen que ser un entero mayor a 0.',
  })
  minutes: number;

  @IsOptional()
  titulo?: string;

  @IsOptional()
  texto?: string;

  @IsOptional()
  minutosValidez?: number;
}
