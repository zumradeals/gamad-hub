import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class VeteranGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const gamadId: string = req.portalUserId;
    if (!gamadId) throw new ForbiddenException('Non authentifié');

    const rep = await this.prisma.reputationScore.findUnique({ where: { gamadId } });
    const level = rep?.trustLevel ?? 'NEWCOMER';

    if (!['VETERAN', 'GUARDIAN'].includes(level)) {
      throw new ForbiddenException('Accès réservé aux modérateurs (niveau Vétéran minimum)');
    }
    req.portalUserTrustLevel = level;
    return true;
  }
}

@Injectable()
export class GuardianGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const gamadId: string = req.portalUserId;
    if (!gamadId) throw new ForbiddenException('Non authentifié');

    const rep = await this.prisma.reputationScore.findUnique({ where: { gamadId } });
    const level = rep?.trustLevel ?? 'NEWCOMER';

    if (level !== 'GUARDIAN') {
      throw new ForbiddenException('Accès réservé aux Gardiens');
    }
    req.portalUserTrustLevel = level;
    return true;
  }
}
