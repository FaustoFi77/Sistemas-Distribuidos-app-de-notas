import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonDb } from '../database/json-db.js';
import { AuthService } from './auth.service.js';
import { UsersRepository } from './users.repository.js';

describe('AuthService', () => {
  let directory: string;
  let service: AuthService;
  const previousDataFile = process.env.DATA_FILE;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'auth-test-'));
    process.env.DATA_FILE = join(directory, 'db.json');

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersRepository, JsonDb],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (previousDataFile === undefined) {
      delete process.env.DATA_FILE;
    } else {
      process.env.DATA_FILE = previousDataFile;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it('registra un usuario nuevo y emite un token válido', async () => {
    const registrado = await service.register({
      name: 'Ana Pérez',
      email: 'ana@correo.edu',
      password: 'password123',
    });

    expect(registrado.id).toEqual(expect.any(String));
    expect(registrado.name).toBe('Ana Pérez');
    expect(registrado.email).toBe('ana@correo.edu');
    expect(registrado.token).toEqual(expect.any(String));

    const verificado = await service.verifyToken(registrado.token);
    expect(verificado).toEqual({
      userId: registrado.id,
      email: 'ana@correo.edu',
    });
  });

  it('rechaza un email repetido con ConflictException', async () => {
    await service.register({
      name: 'Ana Pérez',
      email: 'ana@correo.edu',
      password: 'password123',
    });

    await expect(
      service.register({
        name: 'Otra Ana',
        email: 'ana@correo.edu',
        password: 'otraPassword123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('inicia sesión con credenciales correctas y rechaza inválidas', async () => {
    await service.register({
      name: 'Ana Pérez',
      email: 'ana@correo.edu',
      password: 'password123',
    });

    const sesion = await service.login({
      email: 'ana@correo.edu',
      password: 'password123',
    });
    expect(sesion.email).toBe('ana@correo.edu');
    expect(sesion.token).toEqual(expect.any(String));

    await expect(
      service.login({
        email: 'ana@correo.edu',
        password: 'incorrecta',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('devuelve los datos del usuario autenticado con getMe', async () => {
    const registrado = await service.register({
      name: 'Ana Pérez',
      email: 'ana@correo.edu',
      password: 'password123',
    });

    const perfil = await service.getMe(registrado.id);
    expect(perfil).toEqual({
      id: registrado.id,
      name: 'Ana Pérez',
      email: 'ana@correo.edu',
    });
  });
});
