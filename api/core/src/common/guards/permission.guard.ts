import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.slice(7);
    let payload: { gamadId: string; email: string };

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET ?? 'fallback_secret') as any;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    const gamadId = await this.prisma.gamadId.findUnique({
      where: { id: payload.gamadId },
      select: { id: true, status: true },
    });

    if (!gamadId) {
      throw new UnauthorizedException('Identité introuvable');
    }

    if (gamadId.status === 'SUSPENDED' || gamadId.status === 'BANNED') {
      throw new ForbiddenException(`Accès refusé — statut : ${gamadId.status}`);
    }

    request['actorId'] = payload.gamadId;
    return true;
  }
}
