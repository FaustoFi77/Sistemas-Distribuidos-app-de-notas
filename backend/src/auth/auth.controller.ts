import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';
import { AuthService, SESSION_COOKIE } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiCreatedResponse({
    description: 'Usuario registrado exitosamente y sesión iniciada',
  })
  @ApiConflictResponse({ description: 'Ese email ya está registrado.' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiOkResponse({ description: 'Sesión iniciada correctamente' })
  @ApiUnauthorizedResponse({ description: 'Email o contraseña incorrectos.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar la sesión actual' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie(SESSION_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener los datos del usuario autenticado' })
  @ApiOkResponse({ description: 'Datos del usuario actual' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user!.userId);
  }
}
