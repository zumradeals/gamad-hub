import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { PermissionsService } from "../../modules/permissions/permissions.service";
import { REQUIRED_PERMISSION_KEY } from "../decorators/require-permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"] as string | undefined;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === "change_me") {
      throw new UnauthorizedException("Server misconfiguration");
    }

    let decoded: Record<string, string>;
    try {
      decoded = jwt.verify(token, secret) as Record<string, string>;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request["actorId"] = decoded["gamadId"];

    if (!requiredPermission) {
      return true;
    }

    await this.permissionsService.assertPermission({
      actorId: decoded["gamadId"],
      permissionCode: requiredPermission
    });

    return true;
  }
}
