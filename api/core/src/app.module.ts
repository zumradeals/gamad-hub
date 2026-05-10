import { Module } from "@nestjs/common";
import { IdentityModule } from "./modules/identity/identity.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { KnowledgeModule } from "./modules/knowledge/knowledge.module";
import { CommunicationModule } from "./modules/communication/communication.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SystemModule } from "./modules/system/system.module";

@Module({
  imports: [
    IdentityModule,
    OrganizationModule,
    PermissionsModule,
    ActivityModule,
    KnowledgeModule,
    CommunicationModule,
    AuditModule,
    SystemModule
  ]
})
export class AppModule {}
