import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class VeteranGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const level: string = req.portalUser?.trustLevel ?? '';
    if (!['VETERAN', 'GUARDIAN'].includes(level)) {
      throw new ForbiddenException('Accès réservé aux modérateurs (niveau Vétéran minimum)');
    }
    return true;
  }
}

@Injectable()
export class GuardianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.portalUser?.trustLevel !== 'GUARDIAN') {
      throw new ForbiddenException('Accès réservé aux Gardiens');
    }
    return true;
  }
}
