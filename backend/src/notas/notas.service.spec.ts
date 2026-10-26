import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonDb } from '../database/json-db.js';
import { NotasRepository } from './notas.repository.js';
import { NotasService } from './notas.service.js';

describe('NotasService', () => {
  let directory: string;
  let service: NotasService;
  const previousDataFile = process.env.DATA_FILE;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'notas-test-'));
    process.env.DATA_FILE = join(directory, 'db.json');

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotasService, NotasRepository, JsonDb],
    }).compile();

    service = module.get<NotasService>(NotasService);
  });

  afterEach(async () => {
    if (previousDataFile === undefined) {
      delete process.env.DATA_FILE;
    } else {
      process.env.DATA_FILE = previousDataFile;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it('crea una nota y la persiste en la base JSON', async () => {
    const nota = await service.create({
      title: '  Repasar NestJS  ',
      text: '  Ver controladores, servicios y repositorios  ',
      minutes: 10,
    });

    expect(nota.id).toEqual(expect.any(String));
    expect(nota.title).toBe('Repasar NestJS');
    expect(nota.text).toBe('Ver controladores, servicios y repositorios');
    expect(nota.minutes).toBe(10);
    expect(nota.notified).toBe(false);
    expect(nota.createdAt).toEqual(expect.any(Number));

    await expect(service.findAll()).resolves.toEqual([nota]);
  });

  it('obtiene una nota por su id', async () => {
    const creada = await service.create({
      title: 'Comprar café',
      text: 'Molido para filtro',
      minutes: 5,
    });

    const encontrada = await service.findOne(creada.id);
    expect(encontrada).toEqual(creada);
  });

  it('lanza NotFoundException cuando la nota no existe', async () => {
    await expect(service.findOne('id-inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('actualiza una nota existente y reinicia el estado de notificación', async () => {
    const creada = await service.create({
      title: 'Título inicial',
      text: 'Texto inicial',
      minutes: 5,
    });

    await service.markNotified(creada.id);

    const actualizada = await service.update(creada.id, {
      title: 'Título actualizado',
      text: 'Texto actualizado',
      minutes: 15,
    });

    expect(actualizada.title).toBe('Título actualizado');
    expect(actualizada.text).toBe('Texto actualizado');
    expect(actualizada.minutes).toBe(15);
    expect(actualizada.notified).toBe(false);
    expect(actualizada.createdAt).toBeGreaterThanOrEqual(creada.createdAt);
  });

  it('marca una nota como notificada', async () => {
    const creada = await service.create({
      title: 'Reunión de equipo',
      text: 'Daily a las 10:00',
      minutes: 1,
    });

    const notificada = await service.markNotified(creada.id);
    expect(notificada.notified).toBe(true);
  });

  it('permite marcar como notificada mediante update con notified: true', async () => {
    const creada = await service.create({
      title: 'Entregar TP',
      text: 'Subir repositorio a GitHub',
      minutes: 30,
    });

    const notificada = await service.update(creada.id, { notified: true });
    expect(notificada.notified).toBe(true);
  });

  it('lanza NotFoundException al intentar actualizar una nota inexistente', async () => {
    await expect(
      service.update('id-inexistente', { title: 'Nuevo' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('elimina una nota existente y lanza NotFoundException si ya no existe', async () => {
    const creada = await service.create({
      title: 'Nota temporal',
      text: 'Borrar luego',
      minutes: 5,
    });

    const resultado = await service.remove(creada.id);
    expect(resultado).toEqual({
      mensaje: 'Nota eliminada',
      id: creada.id,
      ok: true,
    });

    await expect(service.findOne(creada.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.remove(creada.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('verifica correctamente si una nota ha expirado según sus minutos de validez', async () => {
    const creada = await service.create({
      title: 'Recordatorio corto',
      text: 'Vence en 5 minutos',
      minutes: 5,
    });

    const antesDeVencer = creada.createdAt + 4 * 60_000;
    const alVencer = creada.createdAt + 5 * 60_000;

    expect(service.isExpired(creada, antesDeVencer)).toBe(false);
    expect(service.isExpired(creada, alVencer)).toBe(true);
  });

  it('filtra las notas por usuario cuando se provee userId', async () => {
    const notaUsuario1 = await service.create(
      { title: 'Nota Ana', text: 'Privada de Ana', minutes: 5 },
      'user-1',
    );
    await service.create(
      { title: 'Nota Juan', text: 'Privada de Juan', minutes: 10 },
      'user-2',
    );

    const notasAna = await service.findAll('user-1');
    expect(notasAna).toEqual([notaUsuario1]);
  });
});
