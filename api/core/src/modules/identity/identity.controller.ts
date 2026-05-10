import { Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { CreateGamadIdDto } from "./dto/create-gamad-id.dto";
import { LoginDto } from "./dto/login.dto";
import { SuspendMemberDto } from "./dto/suspend-member.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ValidateMemberDto } from "./dto/validate-member.dto";
import { IdentityService } from "./identity.service";

@Controller("identity")
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post("gamad-ids")
  async createGamadId(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateGamadIdDto) {
    return ok(await this.identityService.createGamadId(actorId, dto), {
      events: ["GAMAD_ID_CREATED", "ACCOUNT_CREATED"]
    });
  }

  @Get("gamad-ids/:id")
  async readIdentity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.identityService.readIdentity(actorId, id));
  }

  @Post("gamad-ids/:id/validate")
  async validateMember(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("id") id: string,
    @Body() dto: ValidateMemberDto
  ) {
    return ok(await this.identityService.validateMember(actorId, id, dto.decisionNote), {
      events: ["MEMBER_VALIDATED"]
    });
  }

  @Post("gamad-ids/:id/suspend")
  async suspendMember(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("id") id: string,
    @Body() dto: SuspendMemberDto
  ) {
    return ok(await this.identityService.suspendMember(actorId, id, dto), {
      events: ["MEMBER_SUSPENDED"]
    });
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly identityService: IdentityService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return ok(await this.identityService.login(dto), {
      events: ["LOGIN_SUCCESS", "LOGIN_FAILED"]
    });
  }
}

@Controller("profiles")
export class ProfileController {
  constructor(private readonly identityService: IdentityService) {}

  @Get(":gamadId")
  async readProfile(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("gamadId") gamadId: string) {
    return ok(await this.identityService.readProfile(actorId, gamadId));
  }

  @Patch(":gamadId")
  async updateProfile(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("gamadId") gamadId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return ok(await this.identityService.updateProfile(actorId, gamadId, dto), {
      events: ["PROFILE_UPDATED"]
    });
  }
}
