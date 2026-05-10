import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { IdentityStatus, IdentityType } from "@prisma/client";
import { IdentityRepository } from "./identity.repository";
import { CreateGamadIdDto } from "./dto/create-gamad-id.dto";
import { LoginDto } from "./dto/login.dto";
import { SuspendMemberDto } from "./dto/suspend-member.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class IdentityService {
  constructor(private readonly identityRepository: IdentityRepository) {}

  async createGamadId(actorId: string | undefined, dto: CreateGamadIdDto) {
    await this.assertPermission(actorId, "identity.create");
    this.assertEmail(dto.email);

    const password = dto.password ?? randomBytes(18).toString("base64url");
    const identityType = this.toIdentityType(dto.identityType);
    const publicCode = await this.identityRepository.nextPublicCode();
    const identity = await this.identityRepository.createIdentity({
      publicCode,
      identityType,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      passwordHash: this.hashPassword(password),
      displayName: dto.displayName ?? dto.email
    });

    await this.identityRepository.writeAudit({
      actorId,
      action: "GAMAD_ID_CREATED",
      targetType: "GAMAD_ID",
      targetId: identity.id,
      newValue: { publicCode: identity.publicCode, identityType: identity.identityType, status: identity.status }
    });
    await this.identityRepository.writeAudit({
      actorId,
      action: "ACCOUNT_CREATED",
      targetType: "ACCOUNT",
      targetId: identity.accounts[0]?.id,
      newValue: { email: dto.email.toLowerCase(), gamadId: identity.id }
    });

    return {
      gamadId: identity.id,
      publicCode: identity.publicCode,
      status: identity.status.toLowerCase()
    };
  }

  async readIdentity(actorId: string | undefined, id: string) {
    await this.assertPermission(actorId, "identity.read");
    const identity = await this.identityRepository.findIdentity(id);
    if (!identity) {
      throw new NotFoundException("Identity not found");
    }

    return {
      id: identity.id,
      publicCode: identity.publicCode,
      identityType: identity.identityType.toLowerCase(),
      status: identity.status.toLowerCase(),
      profile: identity.profile,
      accounts: identity.accounts,
      roles: identity.memberRoles,
      memberships: identity.memberships
    };
  }

  async validateMember(actorId: string | undefined, id: string, decisionNote: string) {
    await this.assertPermission(actorId, "identity.validate");
    if (!decisionNote?.trim()) {
      throw new BadRequestException("decisionNote is required");
    }

    const before = await this.identityRepository.findIdentity(id);
    if (!before) {
      throw new NotFoundException("Identity not found");
    }

    const updated = await this.identityRepository.updateIdentityStatus(id, IdentityStatus.ACTIVE);
    await this.identityRepository.writeAudit({
      actorId,
      action: "MEMBER_VALIDATED",
      targetType: "GAMAD_ID",
      targetId: id,
      oldValue: { status: before.status },
      newValue: { status: updated.status, decisionNote }
    });

    return {
      gamadId: updated.id,
      status: updated.status.toLowerCase()
    };
  }

  async suspendMember(actorId: string | undefined, id: string, dto: SuspendMemberDto) {
    await this.assertPermission(actorId, "identity.suspend");
    if (!dto.reason?.trim()) {
      throw new BadRequestException("reason is required");
    }

    const before = await this.identityRepository.findIdentity(id);
    if (!before) {
      throw new NotFoundException("Identity not found");
    }

    const updated = await this.identityRepository.updateIdentityStatus(id, IdentityStatus.SUSPENDED);
    await this.identityRepository.writeAudit({
      actorId,
      action: "MEMBER_SUSPENDED",
      targetType: "GAMAD_ID",
      targetId: id,
      oldValue: { status: before.status },
      newValue: { status: updated.status, reason: dto.reason, durationDays: dto.durationDays }
    });

    return {
      gamadId: updated.id,
      status: updated.status.toLowerCase()
    };
  }

  async login(dto: LoginDto) {
    this.assertEmail(dto.email);
    if (!dto.password) {
      throw new BadRequestException("password is required");
    }

    const account = await this.identityRepository.findAccountByEmail(dto.email.toLowerCase());
    if (!account || !this.verifyPassword(dto.password, account.passwordHash)) {
      await this.identityRepository.writeAudit({
        action: "LOGIN_FAILED",
        targetType: "ACCOUNT",
        newValue: { email: dto.email.toLowerCase() }
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (account.status !== "ACTIVE" || account.gamadIdentity.status !== "ACTIVE") {
      throw new ForbiddenException("Account is not active");
    }

    await this.identityRepository.updateLastLogin(account.id);
    await this.identityRepository.writeAudit({
      actorId: account.gamadId,
      action: "LOGIN_SUCCESS",
      targetType: "ACCOUNT",
      targetId: account.id
    });

    return {
      token: this.signToken({ gamadId: account.gamadId, accountId: account.id }),
      gamadId: account.gamadId,
      publicCode: account.gamadIdentity.publicCode,
      profile: account.gamadIdentity.profile
    };
  }

  async updateProfile(actorId: string | undefined, gamadId: string, dto: UpdateProfileDto) {
    if (!actorId) {
      throw new UnauthorizedException("Authentication required");
    }
    if (actorId !== gamadId) {
      throw new ForbiddenException("Only self profile updates are allowed in Identity Core phase");
    }

    const updated = await this.identityRepository.updateProfile(gamadId, {
      displayName: dto.displayName,
      bio: dto.bio,
      city: dto.city,
      country: dto.country
    });

    await this.identityRepository.writeAudit({
      actorId,
      action: "PROFILE_UPDATED",
      targetType: "PROFILE",
      targetId: updated.id,
      newValue: { displayName: updated.displayName, city: updated.city, country: updated.country }
    });

    return updated;
  }

  async readProfile(actorId: string | undefined, gamadId: string) {
    if (actorId !== gamadId) {
      await this.assertPermission(actorId, "profile.read");
    }

    const profile = await this.identityRepository.findProfile(gamadId);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  private async assertPermission(actorId: string | undefined, permissionCode: string) {
    if (!actorId) {
      throw new UnauthorizedException("Authentication required");
    }
    const allowed = await this.identityRepository.hasPermission(actorId, permissionCode);
    if (!allowed) {
      throw new ForbiddenException(`Missing permission: ${permissionCode}`);
    }
  }

  private assertEmail(email: string) {
    if (!email || !email.includes("@")) {
      throw new BadRequestException("valid email is required");
    }
  }

  private toIdentityType(value: string): IdentityType {
    const normalized = value?.toUpperCase();
    if (!["PERSON", "ORGANIZATION", "SYSTEM"].includes(normalized)) {
      throw new BadRequestException("identityType must be person, organization or system");
    }
    return normalized as IdentityType;
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [scheme, salt, hash] = storedHash.split(":");
    if (scheme !== "scrypt" || !salt || !hash) {
      return false;
    }
    const computed = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === computed.length && timingSafeEqual(expected, computed);
  }

  private signToken(payload: Record<string, string>) {
    const secret = process.env.JWT_SECRET ?? "change_me";
    const encodedPayload = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
    const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
    return `${encodedPayload}.${signature}`;
  }
}
