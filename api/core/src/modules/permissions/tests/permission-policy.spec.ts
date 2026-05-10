import { blockedIdentityStatuses, classificationRank } from "../policies/permission.policy";

describe("permission policy", () => {
  it("blocks inactive identity statuses", () => {
    expect(blockedIdentityStatuses).toEqual(["PENDING", "LIMITED", "SUSPENDED", "ARCHIVED", "BANNED"]);
  });

  it("orders classifications by sensitivity", () => {
    expect(classificationRank.PUBLIC).toBeLessThan(classificationRank.INTERNAL);
    expect(classificationRank.INTERNAL).toBeLessThan(classificationRank.CONFIDENTIAL);
    expect(classificationRank.CONFIDENTIAL).toBeLessThan(classificationRank.STRATEGIC);
  });
});
