import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSION_KEY } from "../decorators/require-permission.decorator";
import { PermissionsService } from "../../modules/permissions/permissions.service";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext) {
    const permissionCode = this.reflector.getAllAndOverride<string>(REQUIRED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!permissionCode) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const actorId = request.headers["x-gamad-actor-id"];
    const organizationUnitId = request.headers["x-organization-unit-id"];

    if (!actorId) {
      throw new UnauthorizedException("Authentication required");
    }

    const allowed = await this.permissionsService.hasPermission({
      actorId,
      permissionCode,
      organizationUnitId
    });

    if (!allowed) {
      await this.permissionsService.auditPermissionDenied(actorId, permissionCode, organizationUnitId);
      throw new ForbiddenException(`Missing permission: ${permissionCode}`);
    }

    return true;
  }
}
