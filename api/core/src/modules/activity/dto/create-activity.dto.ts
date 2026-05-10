export type CreateActivityDto = {
  title: string;
  description?: string;
  organizationUnitId: string;
  priority?: "low" | "normal" | "high" | "strategic";
  startDate?: string;
  endDate?: string;
};
