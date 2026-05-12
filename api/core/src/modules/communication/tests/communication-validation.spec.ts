const validScopes = ["PUBLIC", "INTERNAL", "UNIT", "ROLE"] as const;

function toAudienceScope(value: string) {
  const normalized = value.toUpperCase();
  if (!validScopes.includes(normalized as typeof validScopes[number])) {
    throw new Error("invalid audience scope");
  }
  return normalized;
}

function assertText(value: string | undefined, field: string) {
  if (!value?.trim()) {
    throw new Error(`${field} is required`);
  }
}

describe("communication validation", () => {
  it("rejects invalid audience scope", () => {
    expect(() => toAudienceScope("everyone")).toThrow("invalid audience scope");
  });

  it("accepts valid audience scopes", () => {
    expect(toAudienceScope("public")).toBe("PUBLIC");
    expect(toAudienceScope("internal")).toBe("INTERNAL");
    expect(toAudienceScope("unit")).toBe("UNIT");
    expect(toAudienceScope("role")).toBe("ROLE");
  });

  it("rejects empty text fields", () => {
    expect(() => assertText(undefined, "title")).toThrow("title is required");
    expect(() => assertText("", "content")).toThrow("content is required");
    expect(() => assertText("   ", "field")).toThrow("field is required");
  });

  it("accepts non-empty text fields", () => {
    expect(() => assertText("Hello", "title")).not.toThrow();
  });
});
