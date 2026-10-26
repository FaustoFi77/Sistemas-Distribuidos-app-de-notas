import { Injectable } from '@nestjs/common';
import { JsonDb, UserGuardado } from '../database/json-db.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: JsonDb) {}

  async findByEmail(email: string): Promise<UserGuardado | null> {
    const data = await this.db.read();
    const normalized = email.trim().toLowerCase();
    return data.users.find((user) => user.email === normalized) ?? null;
  }

  async findById(id: string): Promise<UserGuardado | null> {
    const data = await this.db.read();
    return data.users.find((user) => user.id === id) ?? null;
  }

  create(user: UserGuardado): Promise<UserGuardado | null> {
    return this.db.update((data) => {
      if (data.users.some((item) => item.email === user.email)) {
        return null;
      }
      data.users.push(user);
      return user;
    });
  }
}
