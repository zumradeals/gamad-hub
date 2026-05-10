import { isNonEmptyString } from "./index";

export function isDocumentTitle(value: unknown): value is string {
  return isNonEmptyString(value);
}
