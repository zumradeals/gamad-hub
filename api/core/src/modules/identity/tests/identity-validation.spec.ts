function assertEmail(email: string) {
  if (!email || !email.includes("@")) {
    throw new Error("valid email is required");
  }
}

function assertPublicCode(code: string) {
  if (!code || !/^GMD-\d{6}$/.test(code)) {
    throw new Error("invalid public code format");
  }
}

describe("identity validation", () => {
  it("rejects empty email", () => {
    expect(() => assertEmail("")).toThrow("valid email is required");
  });

  it("rejects email without @", () => {
    expect(() => assertEmail("notanemail")).toThrow("valid email is required");
  });

  it("accepts valid email", () => {
    expect(() => assertEmail("user@example.com")).not.toThrow();
  });

  it("rejects malformed public code", () => {
    expect(() => assertPublicCode("GMD-00001")).toThrow("invalid public code format");
    expect(() => assertPublicCode("XXX-000001")).toThrow("invalid public code format");
  });

  it("accepts valid public code", () => {
    expect(() => assertPublicCode("GMD-000001")).not.toThrow();
    expect(() => assertPublicCode("GMD-999999")).not.toThrow();
  });
});
