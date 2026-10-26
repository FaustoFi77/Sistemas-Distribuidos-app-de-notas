import { Injectable } from '@nestjs/common';
import { JsonDb, NotaGuardada } from '../database/json-db.js';
import { Nota } from './entities/nota.entity.js';

@Injectable()
export class NotasRepository {
  constructor(private readonly db: JsonDb) {}

  private toPublic(note: NotaGuardada): Nota {
    return {
      id: note.id,
      title: note.title,
      text: note.text,
      color: note.color ?? '#ffff88',
      minutes: note.minutes,
      createdAt: note.createdAt,
      notified: note.notified,
    };
  }

  private matchesUser(note: NotaGuardada, userId?: string): boolean {
    if (!userId) return true;
    return note.userId === userId;
  }

  async findAll(userId?: string): Promise<Nota[]> {
    const data = await this.db.read();
    return data.notes
      .filter((note) => this.matchesUser(note, userId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((note) => this.toPublic(note));
  }

  async findById(id: string, userId?: string): Promise<Nota | null> {
    const data = await this.db.read();
    const note = data.notes.find(
      (item) => item.id === id && this.matchesUser(item, userId),
    );
    return note ? this.toPublic(note) : null;
  }

  create(note: NotaGuardada): Promise<Nota> {
    return this.db.update((data) => {
      data.notes.unshift(note);
      return this.toPublic(note);
    });
  }

  update(
    id: string,
    values: { title?: string; text?: string; color?: string; minutes?: number },
    userId?: string,
  ): Promise<Nota | null> {
    return this.db.update((data) => {
      const note = data.notes.find(
        (item) => item.id === id && this.matchesUser(item, userId),
      );
      if (!note) return null;

      if (values.title !== undefined) note.title = values.title;
      if (values.text !== undefined) note.text = values.text;
      if (values.color !== undefined) note.color = values.color;
      if (values.minutes !== undefined) note.minutes = values.minutes;
      note.createdAt = Date.now();
      note.notified = false;

      return this.toPublic(note);
    });
  }

  markNotified(id: string, userId?: string): Promise<Nota | null> {
    return this.db.update((data) => {
      const note = data.notes.find(
        (item) => item.id === id && this.matchesUser(item, userId),
      );
      if (!note) return null;
      note.notified = true;
      return this.toPublic(note);
    });
  }

  delete(id: string, userId?: string): Promise<boolean> {
    return this.db.update((data) => {
      const index = data.notes.findIndex(
        (item) => item.id === id && this.matchesUser(item, userId),
      );
      if (index === -1) return false;
      data.notes.splice(index, 1);
      return true;
    });
  }
}
