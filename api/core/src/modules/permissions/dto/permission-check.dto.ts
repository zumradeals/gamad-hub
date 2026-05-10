export type PermissionCheckDto = {
  actorId: string;
  permissionCode: string;
  organizationUnitId?: string;
  resourceClassification?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "STRATEGIC" | "RESTRICTED";
};
