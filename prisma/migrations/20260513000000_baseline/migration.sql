-- Baseline migration: creates the full core schema
-- Applied before all incremental migrations (000001–000004)

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE "IdentityType" AS ENUM ('PERSON', 'ORGANIZATION', 'SYSTEM');
CREATE TYPE "IdentityStatus" AS ENUM ('PENDING', 'ACTIVE', 'LIMITED', 'SUSPENDED', 'ARCHIVED', 'BANNED');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LOCKED', 'DISABLED');
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'PRIVATE');
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'UNIT', 'MODULE');
CREATE TYPE "PermissionAction" AS ENUM (
  'READ', 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE',
  'MANAGE', 'EXPORT', 'MODERATE', 'ARCHIVE', 'ASSIGN', 'REVOKE', 'AUDIT'
);
CREATE TYPE "OrganizationUnitType" AS ENUM ('HCG', 'DEPARTMENT', 'COORDINATION', 'SECTION', 'ZUMARA');
CREATE TYPE "OrganizationUnitStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "MembershipType" AS ENUM ('MEMBER', 'RESPONSIBLE', 'ASSISTANT', 'OBSERVER');
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "ZumaraVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'PRIVATE');
CREATE TYPE "FormationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ThreadVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'UNIT', 'PRIVATE');
CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'ARCHIVED');
CREATE TYPE "AnnouncementAudience" AS ENUM ('PUBLIC', 'INTERNAL', 'UNIT', 'ROLE');
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VALIDATED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'STRATEGIC');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');
CREATE TYPE "DocumentType" AS ENUM ('STATUTE', 'REPORT', 'MANUAL', 'PROCEDURE', 'MEDIA', 'ARCHIVE', 'TRAINING');
CREATE TYPE "DocumentClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'STRATEGIC');
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VALIDATED', 'ARCHIVED');
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "VideoStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ─── IDENTITY ─────────────────────────────────────────────────────────────────

CREATE TABLE "GamadId" (
    "id"           TEXT NOT NULL,
    "publicCode"   TEXT NOT NULL,
    "identityType" "IdentityType"   NOT NULL DEFAULT 'PERSON',
    "status"       "IdentityStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GamadId_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GamadId_publicCode_key" ON "GamadId"("publicCode");

CREATE TABLE "Account" (
    "id"           TEXT NOT NULL,
    "gamadId"      TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "phone"        TEXT,
    "passwordHash" TEXT NOT NULL,
    "mfaEnabled"   BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt"  TIMESTAMP(3),
    "status"       "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Account_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Account_gamadId_key" ON "Account"("gamadId");
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

CREATE TABLE "Profile" (
    "id"          TEXT NOT NULL,
    "gamadId"     TEXT NOT NULL,
    "firstName"   TEXT,
    "lastName"    TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl"   TEXT,
    "bio"         TEXT,
    "birthDate"   TIMESTAMP(3),
    "country"     TEXT,
    "city"        TEXT,
    "visibility"  "ProfileVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Profile_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Profile_gamadId_key" ON "Profile"("gamadId");

CREATE TABLE "Role" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "scope"        "RoleScope" NOT NULL DEFAULT 'GLOBAL',
    "description"  TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

CREATE TABLE "Permission" (
    "id"          TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "module"      TEXT NOT NULL,
    "action"      "PermissionAction" NOT NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

CREATE TABLE "RolePermission" (
    "id"           TEXT NOT NULL,
    "roleId"       TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RolePermission_roleId_fkey"       FOREIGN KEY ("roleId")       REFERENCES "Role"("id")       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- ─── ORGANIZATION ─────────────────────────────────────────────────────────────

CREATE TABLE "OrganizationUnit" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "type"        "OrganizationUnitType"   NOT NULL,
    "parentId"    TEXT,
    "status"      "OrganizationUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationUnit_pkey"      PRIMARY KEY ("id"),
    CONSTRAINT "OrganizationUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "MemberRole" (
    "id"                 TEXT NOT NULL,
    "gamadId"            TEXT NOT NULL,
    "roleId"             TEXT NOT NULL,
    "organizationUnitId" TEXT,
    "grantedBy"          TEXT,
    "grantedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt"          TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberRole_pkey"                 PRIMARY KEY ("id"),
    CONSTRAINT "MemberRole_gamadId_fkey"            FOREIGN KEY ("gamadId")            REFERENCES "GamadId"("id")          ON DELETE RESTRICT  ON UPDATE CASCADE,
    CONSTRAINT "MemberRole_roleId_fkey"             FOREIGN KEY ("roleId")             REFERENCES "Role"("id")             ON DELETE RESTRICT  ON UPDATE CASCADE,
    CONSTRAINT "MemberRole_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL  ON UPDATE CASCADE,
    CONSTRAINT "MemberRole_grantedBy_fkey"          FOREIGN KEY ("grantedBy")          REFERENCES "GamadId"("id")          ON DELETE SET NULL  ON UPDATE CASCADE
);

CREATE TABLE "Membership" (
    "id"                 TEXT NOT NULL,
    "gamadId"            TEXT NOT NULL,
    "organizationUnitId" TEXT NOT NULL,
    "membershipType"     "MembershipType"   NOT NULL DEFAULT 'MEMBER',
    "status"             "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt"             TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_pkey"                 PRIMARY KEY ("id"),
    CONSTRAINT "Membership_gamadId_fkey"            FOREIGN KEY ("gamadId")            REFERENCES "GamadId"("id")          ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Membership_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Zumara" (
    "id"                 TEXT NOT NULL,
    "organizationUnitId" TEXT NOT NULL,
    "activityDomain"     TEXT,
    "mission"            TEXT,
    "visibility"         "ZumaraVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Zumara_pkey"                 PRIMARY KEY ("id"),
    CONSTRAINT "Zumara_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Zumara_organizationUnitId_key" ON "Zumara"("organizationUnitId");

-- ─── FORMATION ────────────────────────────────────────────────────────────────

CREATE TABLE "Formation" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "slug"        TEXT NOT NULL,
    "imageUrl"    TEXT,
    "isPublic"    BOOLEAN NOT NULL DEFAULT false,
    "status"      "FormationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Formation_slug_key" ON "Formation"("slug");

CREATE TABLE "FormationModule" (
    "id"          TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "order"       INTEGER NOT NULL DEFAULT 0,
    "durationMin" INTEGER,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormationModule_pkey"         PRIMARY KEY ("id"),
    CONSTRAINT "FormationModule_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "FormationEnrollment" (
    "id"          TEXT NOT NULL,
    "gamadId"     TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "status"      "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormationEnrollment_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "FormationEnrollment_gamadId_fkey"    FOREIGN KEY ("gamadId")     REFERENCES "GamadId"("id")   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormationEnrollment_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FormationEnrollment_gamadId_formationId_key" ON "FormationEnrollment"("gamadId", "formationId");

CREATE TABLE "ModuleCompletion" (
    "id"          TEXT NOT NULL,
    "gamadId"     TEXT NOT NULL,
    "moduleId"    TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModuleCompletion_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "ModuleCompletion_gamadId_fkey"  FOREIGN KEY ("gamadId")  REFERENCES "GamadId"("id")         ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "FormationModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ModuleCompletion_gamadId_moduleId_key" ON "ModuleCompletion"("gamadId", "moduleId");

-- ─── COMMUNICATION ────────────────────────────────────────────────────────────

CREATE TABLE "Thread" (
    "id"                 TEXT NOT NULL,
    "title"              TEXT NOT NULL,
    "organizationUnitId" TEXT,
    "visibility"         "ThreadVisibility" NOT NULL DEFAULT 'INTERNAL',
    "isPinned"           BOOLEAN NOT NULL DEFAULT false,
    "isLocked"           BOOLEAN NOT NULL DEFAULT false,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Thread_pkey"                     PRIMARY KEY ("id"),
    CONSTRAINT "Thread_organizationUnitId_fkey"  FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Post" (
    "id"        TEXT NOT NULL,
    "threadId"  TEXT NOT NULL,
    "authorId"  TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "status"    "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "Post_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id")   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "PostReaction" (
    "id"        TEXT NOT NULL,
    "postId"    TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "emoji"     TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostReaction_pkey"      PRIMARY KEY ("id"),
    CONSTRAINT "PostReaction_postId_fkey"  FOREIGN KEY ("postId")  REFERENCES "Post"("id")    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PostReaction_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PostReaction_postId_gamadId_emoji_key" ON "PostReaction"("postId", "gamadId", "emoji");

CREATE TABLE "Announcement" (
    "id"                 TEXT NOT NULL,
    "title"              TEXT NOT NULL,
    "content"            TEXT NOT NULL,
    "organizationUnitId" TEXT,
    "audienceScope"      "AnnouncementAudience" NOT NULL DEFAULT 'INTERNAL',
    "publishedBy"        TEXT NOT NULL,
    "publishedAt"        TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_pkey"                     PRIMARY KEY ("id"),
    CONSTRAINT "Announcement_organizationUnitId_fkey"  FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL  ON UPDATE CASCADE,
    CONSTRAINT "Announcement_publishedBy_fkey"          FOREIGN KEY ("publishedBy")         REFERENCES "GamadId"("id")          ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Message" (
    "id"                 TEXT NOT NULL,
    "senderId"           TEXT NOT NULL,
    "recipientId"        TEXT NOT NULL,
    "organizationUnitId" TEXT,
    "content"            TEXT NOT NULL,
    "status"             "MessageStatus" NOT NULL DEFAULT 'SENT',
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey"                    PRIMARY KEY ("id"),
    CONSTRAINT "Message_senderId_fkey"           FOREIGN KEY ("senderId")           REFERENCES "GamadId"("id")          ON DELETE RESTRICT  ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientId_fkey"        FOREIGN KEY ("recipientId")        REFERENCES "GamadId"("id")          ON DELETE RESTRICT  ON UPDATE CASCADE,
    CONSTRAINT "Message_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL  ON UPDATE CASCADE
);

CREATE TABLE "Notification" (
    "id"        TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "Notification_gamadId_fkey" FOREIGN KEY ("gamadId") REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─── ACTIVITY ─────────────────────────────────────────────────────────────────

CREATE TABLE "Activity" (
    "id"                 TEXT NOT NULL,
    "title"              TEXT NOT NULL,
    "description"        TEXT,
    "organizationUnitId" TEXT,
    "ownerId"            TEXT NOT NULL,
    "status"             "ActivityStatus"  NOT NULL DEFAULT 'DRAFT',
    "priority"           "ActivityPriority" NOT NULL DEFAULT 'NORMAL',
    "startDate"          TIMESTAMP(3),
    "endDate"            TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey"                     PRIMARY KEY ("id"),
    CONSTRAINT "Activity_organizationUnitId_fkey"  FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL  ON UPDATE CASCADE,
    CONSTRAINT "Activity_ownerId_fkey"             FOREIGN KEY ("ownerId")            REFERENCES "GamadId"("id")          ON DELETE RESTRICT  ON UPDATE CASCADE
);

CREATE TABLE "Task" (
    "id"          TEXT NOT NULL,
    "activityId"  TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "assignedTo"  TEXT,
    "status"      "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate"     TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "Task_activityId_fkey"  FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT  ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedTo_fkey"  FOREIGN KEY ("assignedTo") REFERENCES "GamadId"("id")  ON DELETE SET NULL  ON UPDATE CASCADE
);

CREATE TABLE "ActivityReport" (
    "id"         TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityReport_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "ActivityReport_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityReport_authorId_fkey"   FOREIGN KEY ("authorId")   REFERENCES "GamadId"("id")  ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─── KNOWLEDGE ────────────────────────────────────────────────────────────────

CREATE TABLE "Document" (
    "id"                 TEXT NOT NULL,
    "title"              TEXT NOT NULL,
    "documentType"       "DocumentType"           NOT NULL DEFAULT 'MANUAL',
    "classification"     "DocumentClassification" NOT NULL DEFAULT 'INTERNAL',
    "organizationUnitId" TEXT,
    "ownerId"            TEXT NOT NULL,
    "status"             "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey"                     PRIMARY KEY ("id"),
    CONSTRAINT "Document_organizationUnitId_fkey"  FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL  ON UPDATE CASCADE,
    CONSTRAINT "Document_ownerId_fkey"             FOREIGN KEY ("ownerId")            REFERENCES "GamadId"("id")          ON DELETE RESTRICT  ON UPDATE CASCADE
);

CREATE TABLE "DocumentVersion" (
    "id"            TEXT NOT NULL,
    "documentId"    TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "fileUrl"       TEXT NOT NULL,
    "checksum"      TEXT,
    "createdBy"     TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentVersion_createdBy_fkey"  FOREIGN KEY ("createdBy")  REFERENCES "GamadId"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─── COTISATION ───────────────────────────────────────────────────────────────

CREATE TABLE "CotisationPeriod" (
    "id"        TEXT NOT NULL,
    "label"     TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate"   TIMESTAMP(3) NOT NULL,
    "amount"    DOUBLE PRECISION NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CotisationPeriod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CotisationPayment" (
    "id"        TEXT NOT NULL,
    "gamadId"   TEXT NOT NULL,
    "periodId"  TEXT NOT NULL,
    "amount"    DOUBLE PRECISION NOT NULL,
    "currency"  TEXT NOT NULL DEFAULT 'XOF',
    "reference" TEXT,
    "paidAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CotisationPayment_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "CotisationPayment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "CotisationPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─── AUDIT (APPEND-ONLY) ──────────────────────────────────────────────────────

CREATE TABLE "AuditEvent" (
    "id"                 TEXT NOT NULL,
    "actorId"            TEXT,
    "action"             TEXT NOT NULL,
    "targetType"         TEXT NOT NULL,
    "targetId"           TEXT,
    "organizationUnitId" TEXT,
    "oldValue"           JSONB,
    "newValue"           JSONB,
    "ipAddress"          TEXT,
    "userAgent"          TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_pkey"                    PRIMARY KEY ("id"),
    CONSTRAINT "AuditEvent_actorId_fkey"            FOREIGN KEY ("actorId")            REFERENCES "GamadId"("id")          ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditEvent_organizationUnitId_fkey" FOREIGN KEY ("organizationUnitId") REFERENCES "OrganizationUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ─── PORTAIL PUBLIC ───────────────────────────────────────────────────────────

CREATE TABLE "ArticleCategory" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "slug"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArticleCategory_name_key" ON "ArticleCategory"("name");
CREATE UNIQUE INDEX "ArticleCategory_slug_key" ON "ArticleCategory"("slug");

CREATE TABLE "Article" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "excerpt"     TEXT,
    "content"     TEXT NOT NULL,
    "imageUrl"    TEXT,
    "categoryId"  TEXT,
    "status"      "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

CREATE TABLE "VideoCategory" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "slug"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VideoCategory_name_key" ON "VideoCategory"("name");
CREATE UNIQUE INDEX "VideoCategory_slug_key" ON "VideoCategory"("slug");

CREATE TABLE "Video" (
    "id"           TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "slug"         TEXT NOT NULL,
    "description"  TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl"     TEXT,
    "duration"     INTEGER,
    "categoryId"   TEXT,
    "status"       "VideoStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Video_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "Video_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VideoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");
