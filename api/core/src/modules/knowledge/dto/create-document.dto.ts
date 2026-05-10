export type CreateDocumentDto = {
  title: string;
  documentType: "statute" | "report" | "manual" | "procedure" | "media" | "archive" | "training";
  classification: "public" | "internal" | "confidential" | "strategic";
  organizationUnitId?: string;
};
