import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
import { isExpired, Nota } from './entities/nota.entity.js';
import { NotasRepository } from './notas.repository.js';

@Injectable()
export class NotasService {
  constructor(private readonly notasRepository: NotasRepository) {}

  create(createNotaDto: CreateNotaDto, userId?: string): Promise<Nota> {
    return this.notasRepository.create({
      id: randomUUID(),
      userId,
      title: createNotaDto.title.trim(),
      text: (createNotaDto.text ?? '').trim(),
      color: createNotaDto.color ?? '#ffff88',
      minutes: createNotaDto.minutes,
      createdAt: Date.now(),
      notified: false,
    });
  }

  findAll(userId?: string): Promise<Nota[]> {
    return this.notasRepository.findAll(userId);
  }

  async findOne(id: string, userId?: string): Promise<Nota> {
    const nota = await this.notasRepository.findById(id, userId);
    if (!nota) {
      throw new NotFoundException('Nota no encontrada');
    }
    return nota;
  }

  async update(
    id: string,
    updateNotaDto: UpdateNotaDto,
    userId?: string,
  ): Promise<Nota> {
    const hasContentChanges =
      updateNotaDto.title !== undefined ||
      updateNotaDto.text !== undefined ||
      updateNotaDto.minutes !== undefined;

    if (updateNotaDto.notified === true && !hasContentChanges) {
      return this.markNotified(id, userId);
    }

    const updated = await this.notasRepository.update(
      id,
      {
        title: updateNotaDto.title?.trim(),
        text: updateNotaDto.text?.trim(),
        minutes: updateNotaDto.minutes,
      },
      userId,
    );

    if (!updated) {
      throw new NotFoundException('Nota no encontrada');
    }
    return updated;
  }

  async markNotified(id: string, userId?: string): Promise<Nota> {
    const updated = await this.notasRepository.markNotified(id, userId);
    if (!updated) {
      throw new NotFoundException('Nota no encontrada');
    }
    return updated;
  }

  async remove(
    id: string,
    userId?: string,
  ): Promise<{ mensaje: string; id: string; ok: true }> {
    const deleted = await this.notasRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundException('Nota no encontrada');
    }
    return { mensaje: 'Nota eliminada', id, ok: true };
  }

  isExpired(nota: Nota, now: number = Date.now()): boolean {
    return isExpired(nota, now);
  }
}
