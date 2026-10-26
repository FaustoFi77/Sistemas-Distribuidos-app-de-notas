import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { NotasController } from './notas.controller.js';
import { NotasRepository } from './notas.repository.js';
import { NotasService } from './notas.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotasController],
  providers: [NotasService, NotasRepository],
  exports: [NotasService],
})
export class NotasModule {}
