import { Global, Module } from "@nestjs/common";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { PermissionsService } from "./permissions.service";

@Global()
@Module({
  providers: [PermissionGuard, PermissionsService],
  exports: [PermissionGuard, PermissionsService]
})
export class PermissionsModule {}
