export type CreateGamadIdDto = {
  identityType: "person" | "organization" | "system";
  email: string;
  phone?: string;
  password?: string;
  displayName?: string;
};
