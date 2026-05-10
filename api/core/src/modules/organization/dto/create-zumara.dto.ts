export type CreateZumaraDto = {
  name: string;
  parentId?: string;
  description?: string;
  activityDomain: string;
  mission?: string;
  visibility?: "PUBLIC" | "INTERNAL" | "PRIVATE" | "RESTRICTED";
};
