import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IdentityRepository } from './identity.repository';

interface JwtPayload {
  gamadId: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface CitizenContext {
  gamadId: string;
  publicCode: string;
  displayName: string;
  level: number;
  memberships: { unitId: string; unitName: string; type: string }[];
  roles: string[];
}

function computeLevel(roles: string[]): number {
  if (roles.some((r) => r === 'RESPONSABLE_HCG' || r === 'SUPER_ADMINISTRATOR')) return 4;
  if (roles.some((r) => r.startsWith('RESPONSABLE_'))) return 3;
  if (roles.includes('CITOYEN_ACTIVE')) return 2;
  return 1;
}

function buildCitizenContext(gamadId: any, account: any): CitizenContext {
  const roleNames = (gamadId.memberRoles ?? []).map((mr: any) => mr.role.name as string);
  const level = gamadId.status === 'ACTIVE' ? computeLevel(roleNames) : 1;

  return {
    gamadId: gamadId.id,
    publicCode: gamadId.publicCode,
    displayName: gamadId.profile?.displayName ?? '',
    level,
    memberships: (gamadId.memberships ?? []).map((m: any) => ({
      unitId: m.organizationUnitId,
      unitName: m.organizationUnit?.name ?? '',
      type: m.membershipType,
    })),
    roles: roleNames,
  };
}

@Injectable()
export class AuthService {
  private get jwtSecret(): string {
    return process.env.JWT_SECRET ?? 'fallback_secret';
  }

  private get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN ?? '24h';
  }

  constructor(private readonly repo: IdentityRepository) {}

  async login(email: string, password: string) {
    const account = await this.repo.findAccountByEmail(email);
    if (!account) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const gamadId = account.gamad;

    if (gamadId.status === 'PENDING') {
      throw new ForbiddenException(
        'Votre compte est en attente de validation. Accès au CORE non autorisé.',
      );
    }
    if (gamadId.status === 'SUSPENDED' || gamadId.status === 'BANNED') {
      throw new ForbiddenException(`Accès refusé — statut : ${gamadId.status}`);
    }

    const payload: JwtPayload = { gamadId: gamadId.id, email: account.email };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn } as any);
    const decoded = jwt.decode(token) as JwtPayload;

    await this.repo.updateLastLogin(gamadId.id);

    return {
      token,
      expiresAt: new Date((decoded.exp ?? 0) * 1000).toISOString(),
      citizen: buildCitizenContext(gamadId, account),
    };
  }

  async refresh(gamadId: string, email: string) {
    const payload: JwtPayload = { gamadId, email };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn } as any);
    const decoded = jwt.decode(token) as JwtPayload;
    return {
      token,
      expiresAt: new Date((decoded.exp ?? 0) * 1000).toISOString(),
    };
  }

  async me(actorId: string) {
    const gamadId = await this.repo.findById(actorId);
    if (!gamadId) throw new UnauthorizedException('Identité introuvable');
    const account = await this.repo.findAccountByEmail(
      (gamadId as any).account?.email ?? '',
    );
    return buildCitizenContext(gamadId, account);
  }
}
