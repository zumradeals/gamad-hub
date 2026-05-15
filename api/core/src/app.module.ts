import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { FormationModule } from './modules/formation/formation.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { ActivityModule } from './modules/activity/activity.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { CotisationModule } from './modules/cotisation/cotisation.module';
import { PublicModule } from './modules/public/public.module';
import { AuditModule } from './modules/audit/audit.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SystemModule } from './modules/system/system.module';
import { PortalAuthModule } from './modules/portal-auth/portal-auth.module';
import { ZumaraModule } from './modules/zumara/zumara.module';
import { PortalZumaraModule } from './modules/portal-zumara/portal-zumara.module';
import { RevelationModule } from './modules/revelation/revelation.module';

@Module({
  imports: [
    IdentityModule,
    OrganizationModule,
    FormationModule,
    CommunicationModule,
    ActivityModule,
    KnowledgeModule,
    CotisationModule,
    PublicModule,
    AuditModule,
    PermissionsModule,
    SystemModule,
    PortalAuthModule,
    ZumaraModule,
    PortalZumaraModule,
    RevelationModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
