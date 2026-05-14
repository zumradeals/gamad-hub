import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PortalAuthRepository } from './portal-auth.repository';
import { PortalRegisterDto } from './dto/portal-register.dto';
import { PortalLoginDto } from './dto/portal-login.dto';
import { PortalApplyDto } from './dto/portal-apply.dto';
import { ZahabService } from '../zahab/zahab.service';

interface PortalJwtPayload {
  gamadId: string;
  email: string;
  portalUser: true;
  iat?: number;
  exp?: number;
}

@Injectable()
export class PortalAuthService {
  private get jwtSecret(): string {
    return process.env.JWT_SECRET ?? 'fallback_secret';
  }

  constructor(
    private readonly repo: PortalAuthRepository,
    private readonly zahab: ZahabService,
  ) {}

  async register(dto: PortalRegisterDto) {
    const existing = await this.repo.findAccountByEmail(dto.email);
    if (existing) throw new ConflictException('Un compte existe déjà avec cet email');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const gamadId = await this.repo.createPortalUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      country: dto.country,
      city: dto.city,
    });

    // Initialiser wallet Zahab + bonus de bienvenue (fire-and-forget)
    this.zahab.onRegistration(gamadId.id).catch(() => {});

    return {
      message: 'Compte créé avec succès',
      profile: {
        displayName: gamadId.profile?.displayName,
        country: gamadId.profile?.country,
      },
    };
  }

  async login(dto: PortalLoginDto) {
    const account = await this.repo.findAccountByEmail(dto.email);
    if (!account) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const status = account.gamad.status;
    if (status === 'SUSPENDED' || status === 'BANNED') {
      throw new ForbiddenException('Accès refusé');
    }

    const payload: PortalJwtPayload = {
      gamadId: account.gamadId,
      email: account.email,
      portalUser: true,
    };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' } as any);
    const decoded = jwt.decode(token) as PortalJwtPayload;

    await this.repo.updateLastLogin(account.gamadId);

    return {
      token,
      expiresAt: new Date((decoded.exp ?? 0) * 1000).toISOString(),
      user: {
        displayName: account.gamad.profile?.displayName,
        country: account.gamad.profile?.country,
        city: account.gamad.profile?.city,
      },
    };
  }

  async me(gamadId: string) {
    const identity = await this.repo.findById(gamadId);
    if (!identity) throw new UnauthorizedException('Identité introuvable');

    const application = await this.repo.findApplicationByGamadId(gamadId);

    return {
      displayName: identity.profile?.displayName,
      firstName: identity.profile?.firstName,
      lastName: identity.profile?.lastName,
      country: identity.profile?.country,
      city: identity.profile?.city,
      email: (identity as any).account?.email,
      memberSince: (identity as any).account?.createdAt,
      applicationStatus: application?.status ?? null,
    };
  }

  async apply(gamadId: string, dto: PortalApplyDto) {
    const identity = await this.repo.findById(gamadId);
    if (!identity) throw new UnauthorizedException('Identité introuvable');

    const existing = await this.repo.findApplicationByGamadId(gamadId);
    if (existing && ['SUBMITTED', 'UNDER_REVIEW'].includes(existing.status)) {
      throw new ConflictException('Une candidature est déjà en cours de traitement');
    }

    const email = (identity as any).account?.email ?? '';
    const application = await this.repo.createApplication({
      gamadId,
      email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      country: dto.country,
      city: dto.city,
      message: dto.message,
    });

    return {
      message: 'Votre demande a bien été reçue. Nous reviendrons vers vous prochainement.',
      applicationId: application.id,
    };
  }
}
