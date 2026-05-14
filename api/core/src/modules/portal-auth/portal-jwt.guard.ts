import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PortalJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth: string | undefined = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Token manquant');
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'fallback_secret') as any;
      if (!payload.portalUser) throw new UnauthorizedException('Token non-portail');
      req.portalUserId = payload.gamadId;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
