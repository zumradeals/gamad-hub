import { isNonEmptyString } from "./index";

export function isActivityTitle(value: unknown): value is string {
  return isNonEmptyString(value);
}
