export type CreateOrganizationUnitDto = {
  name: string;
  type: "hcg" | "department" | "coordination" | "section" | "zumara";
  parentId?: string;
  description?: string;
};
