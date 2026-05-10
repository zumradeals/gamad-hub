export type CreateAnnouncementDto = {
  title: string;
  content: string;
  organizationUnitId?: string;
  audienceScope: "public" | "internal" | "unit" | "role";
};
