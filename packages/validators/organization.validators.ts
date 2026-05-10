import { isNonEmptyString } from "./index";

export function isOrganizationUnitName(value: unknown): value is string {
  return isNonEmptyString(value);
}
