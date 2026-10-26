import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type UserGuardado = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type NotaGuardada = {
  id: string;
  userId?: string;
  title: string;
  text: string;
  color?: string;
  minutes: number;
  createdAt: number;
  notified: boolean;
};

export type DatabaseFile = {
  users: UserGuardado[];
  notes: NotaGuardada[];
};

function emptyDatabase(): DatabaseFile {
  return { users: [], notes: [] };
}

@Injectable()
export class JsonDb {
  private queue: Promise<unknown> = Promise.resolve();

  filePath(): string {
    return process.env.DATA_FILE ?? join(process.cwd(), 'data', 'db.json');
  }

  async read(): Promise<DatabaseFile> {
    try {
      const raw = await readFile(this.filePath(), 'utf8');
      const parsed = JSON.parse(raw) as Partial<DatabaseFile>;
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return emptyDatabase();
      }
      throw error;
    }
  }

  update<T>(change: (db: DatabaseFile) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const db = await this.read();
      const result = change(db);
      await this.write(db);
      return result;
    });
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async write(db: DatabaseFile): Promise<void> {
    const path = this.filePath();
    await mkdir(dirname(path), { recursive: true });
    const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(db, null, 2)}\n`);
    await rename(temporary, path);
  }
}
