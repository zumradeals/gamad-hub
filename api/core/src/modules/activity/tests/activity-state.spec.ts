const transitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["VALIDATED", "DRAFT"],
  VALIDATED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: []
} as const;

describe("activity state transitions", () => {
  it("prevents archived activities from changing state", () => {
    expect(transitions.ARCHIVED).toHaveLength(0);
  });

  it("keeps the MVP workflow explicit", () => {
    expect(transitions.DRAFT).toContain("SUBMITTED");
    expect(transitions.SUBMITTED).toContain("VALIDATED");
    expect(transitions.VALIDATED).toContain("IN_PROGRESS");
    expect(transitions.IN_PROGRESS).toContain("COMPLETED");
    expect(transitions.COMPLETED).toContain("ARCHIVED");
  });
});
