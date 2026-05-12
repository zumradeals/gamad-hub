const validUnitTypes = ["HCG", "DEPARTMENT", "COORDINATION", "SECTION", "ZUMARA"] as const;

function assertUnitName(name: string) {
  if (!name?.trim()) {
    throw new Error("name is required");
  }
}

function toUnitType(value: string) {
  const normalized = value.toUpperCase();
  if (!validUnitTypes.includes(normalized as typeof validUnitTypes[number])) {
    throw new Error("invalid organization unit type");
  }
  return normalized;
}

describe("organization validation", () => {
  it("rejects empty unit name", () => {
    expect(() => assertUnitName("")).toThrow("name is required");
    expect(() => assertUnitName("   ")).toThrow("name is required");
  });

  it("accepts valid unit name", () => {
    expect(() => assertUnitName("HCG Centrale")).not.toThrow();
  });

  it("rejects invalid unit type", () => {
    expect(() => toUnitType("invalid")).toThrow("invalid organization unit type");
    expect(() => toUnitType("tribe")).toThrow("invalid organization unit type");
  });

  it("accepts valid unit types", () => {
    expect(toUnitType("hcg")).toBe("HCG");
    expect(toUnitType("department")).toBe("DEPARTMENT");
    expect(toUnitType("coordination")).toBe("COORDINATION");
    expect(toUnitType("section")).toBe("SECTION");
    expect(toUnitType("zumara")).toBe("ZUMARA");
  });
});
