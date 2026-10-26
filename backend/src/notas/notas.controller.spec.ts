import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { NotasController } from './notas.controller.js';
import { NotasRepository } from './notas.repository.js';
import { NotasService } from './notas.service.js';

describe('NotasController', () => {
  let directory: string;
  let controller: NotasController;
  const previousDataFile = process.env.DATA_FILE;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'notas-ctrl-'));
    process.env.DATA_FILE = join(directory, 'db.json');

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, AuthModule],
      controllers: [NotasController],
      providers: [NotasService, NotasRepository],
    }).compile();

    controller = module.get<NotasController>(NotasController);
  });

  afterEach(async () => {
    if (previousDataFile === undefined) {
      delete process.env.DATA_FILE;
    } else {
      process.env.DATA_FILE = previousDataFile;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it('should be defined and create/list notes', async () => {
    expect(controller).toBeDefined();
    const created = await controller.create({
      title: 'Test desde controller',
      text: 'Contenido',
      minutes: 5,
    });
    expect(created.title).toBe('Test desde controller');
    await expect(controller.findAll()).resolves.toEqual([created]);
  });
});
