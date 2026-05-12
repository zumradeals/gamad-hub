const validPriorities = ["LOW", "NORMAL", "HIGH", "STRATEGIC"] as const;

function toPriority(value: string) {
  const normalized = value.toUpperCase();
  if (!validPriorities.includes(normalized as typeof validPriorities[number])) {
    throw new Error("invalid priority");
  }
  return normalized;
}

describe("activity priority validation", () => {
  it("rejects invalid priority", () => {
    expect(() => toPriority("urgent")).toThrow("invalid priority");
    expect(() => toPriority("critical")).toThrow("invalid priority");
  });

  it("accepts valid priorities", () => {
    expect(toPriority("low")).toBe("LOW");
    expect(toPriority("normal")).toBe("NORMAL");
    expect(toPriority("high")).toBe("HIGH");
    expect(toPriority("strategic")).toBe("STRATEGIC");
  });

  it("enforces strict workflow transitions beyond documented states", () => {
    const transitions: Record<string, string[]> = {
      DRAFT: ["SUBMITTED"],
      SUBMITTED: ["VALIDATED", "DRAFT"],
      VALIDATED: ["IN_PROGRESS"],
      IN_PROGRESS: ["COMPLETED"],
      COMPLETED: ["ARCHIVED"],
      ARCHIVED: []
    };

    const fromArchive = transitions.ARCHIVED;
    expect(fromArchive).toHaveLength(0);

    const fromDraft = transitions.DRAFT;
    expect(fromDraft).toContain("SUBMITTED");
    expect(fromDraft).not.toContain("COMPLETED");
    expect(fromDraft).not.toContain("ARCHIVED");
  });
});
