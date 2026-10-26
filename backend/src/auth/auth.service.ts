import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UsersRepository } from './users.repository.js';

export const SESSION_COOKIE = 'session';

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  token?: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET ?? 'clase4-secreto-de-desarrollo';
    return new TextEncoder().encode(secret);
  }

  async signSession(userId: string, email: string): Promise<string> {
    return new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.getJwtSecret());
  }

  async verifyToken(
    token: string,
  ): Promise<{ userId: string; email: string } | null> {
    try {
      const { payload } = await jwtVerify(token, this.getJwtSecret());
      if (typeof payload.sub !== 'string') return null;
      return {
        userId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : '',
      };
    } catch {
      return null;
    }
  }

  async register(dto: RegisterDto): Promise<AuthUserResponse & { token: string }> {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersRepository.create({
      id: randomUUID(),
      name: dto.name.trim(),
      email,
      passwordHash,
    });

    if (!user) {
      throw new ConflictException('Ese email ya está registrado.');
    }

    const token = await this.signSession(user.id, user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthUserResponse & { token: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);
    const valid = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const token = await this.signSession(user.id, user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async getMe(userId: string): Promise<AuthUserResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('No autorizado');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
