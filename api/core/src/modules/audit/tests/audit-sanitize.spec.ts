function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        key.toLowerCase().includes("password") || key.toLowerCase().includes("token") || key.toLowerCase().includes("secret")
          ? "[REDACTED]"
          : sanitize(nestedValue)
      ])
    );
  }
  return value;
}

describe("audit payload sanitization", () => {
  it("redacts secrets from audit payloads", () => {
    expect(sanitize({ password: "x", nested: { token: "y", value: "ok" } })).toEqual({
      password: "[REDACTED]",
      nested: { token: "[REDACTED]", value: "ok" }
    });
  });
});
