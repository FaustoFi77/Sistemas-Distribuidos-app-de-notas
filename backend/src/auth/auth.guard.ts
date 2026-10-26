import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, SESSION_COOKIE } from './auth.service.js';

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
  };
};

function extractToken(request: Request): string | null {
  const authHeader = request.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const cookieHeader = request.headers.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';').map((part) => part.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE}=`)) {
        const value = decodeURIComponent(
          cookie.slice(`${SESSION_COOKIE}=`.length),
        );
        if (value) return value;
      }
    }
  }

  return null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No autorizado');
    }

    const session = await this.authService.verifyToken(token);
    if (!session) {
      throw new UnauthorizedException('No autorizado');
    }

    request.user = session;
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);
    if (token) {
      const session = await this.authService.verifyToken(token);
      if (session) {
        request.user = session;
      }
    }
    return true;
  }
}
