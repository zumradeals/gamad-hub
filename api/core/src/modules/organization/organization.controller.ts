import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { ArchiveUnitDto } from "./dto/archive-unit.dto";
import { AssignMemberDto } from "./dto/assign-member.dto";
import { AssignResponsibleDto } from "./dto/assign-responsible.dto";
import { CreateOrganizationUnitDto } from "./dto/create-organization-unit.dto";
import { CreateZumaraDto } from "./dto/create-zumara.dto";
import { OrganizationService } from "./organization.service";

@Controller("organization")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post("units")
  async createUnit(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateOrganizationUnitDto) {
    return ok(await this.organizationService.createUnit(actorId, dto), {
      events: ["ORGANIZATION_UNIT_CREATED"]
    });
  }

  @Get("units/:id")
  async readUnit(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.organizationService.readUnit(actorId, id));
  }

  @Post("zumara")
  async createZumara(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateZumaraDto) {
    return ok(await this.organizationService.createZumara(actorId, dto), {
      events: ["ZUMARA_CREATED"]
    });
  }

  @Post("units/:unitId/members")
  async assignMember(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("unitId") unitId: string,
    @Body() dto: AssignMemberDto
  ) {
    return ok(await this.organizationService.assignMember(actorId, unitId, dto), {
      events: ["MEMBER_ATTACHED_TO_UNIT"]
    });
  }

  @Post("units/:unitId/members/:gamadId/remove")
  async removeMember(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("unitId") unitId: string,
    @Param("gamadId") gamadId: string
  ) {
    return ok(await this.organizationService.removeMember(actorId, unitId, gamadId), {
      events: ["MEMBER_REMOVED_FROM_UNIT"]
    });
  }

  @Post("units/:unitId/responsibles")
  async assignResponsible(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("unitId") unitId: string,
    @Body() dto: AssignResponsibleDto
  ) {
    return ok(await this.organizationService.assignResponsible(actorId, unitId, dto), {
      events: ["RESPONSIBLE_ASSIGNED"]
    });
  }

  @Post("units/:unitId/archive")
  async archiveUnit(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("unitId") unitId: string,
    @Body() dto: ArchiveUnitDto
  ) {
    return ok(await this.organizationService.archiveUnit(actorId, unitId, dto), {
      events: ["ORGANIZATION_UNIT_ARCHIVED"]
    });
  }
}
