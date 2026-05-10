import { isNonEmptyString } from "./index";

export function isPublicCode(value: unknown): value is string {
  return isNonEmptyString(value);
}
