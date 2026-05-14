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
import { PortalFeedModule } from './modules/portal-feed/portal-feed.module';
import { ZahabModule } from './modules/zahab/zahab.module';

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
    PortalFeedModule,
    ZahabModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
