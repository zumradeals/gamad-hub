export const blockedIdentityStatuses = ["PENDING", "LIMITED", "SUSPENDED", "ARCHIVED", "BANNED"] as const;

export const classificationRank = {
  PUBLIC: 0,
  INTERNAL: 1,
  CONFIDENTIAL: 2,
  STRATEGIC: 3,
  RESTRICTED: 4
} as const;
