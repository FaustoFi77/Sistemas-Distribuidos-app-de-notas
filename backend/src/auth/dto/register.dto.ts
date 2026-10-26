import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Pérez', description: 'Nombre del usuario' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'ana.perez@correo.edu', description: 'Email del usuario' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  email: string;

  @ApiProperty({
    example: 'secreto123',
    minLength: 6,
    description: 'Contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, {
    message: 'La contraseña tiene que tener al menos 6 caracteres.',
  })
  password: string;
}
