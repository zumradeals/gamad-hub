import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalPortalJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth: string | undefined = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return true;
    try {
      const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET ?? 'fallback_secret') as any;
      if (payload.portalUser) req.portalUserId = payload.gamadId;
    } catch {
      // invalid token — treat as anonymous
    }
    return true;
  }
}
