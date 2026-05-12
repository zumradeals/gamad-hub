const validTypes = ["STATUTE", "REPORT", "MANUAL", "PROCEDURE", "MEDIA", "ARCHIVE", "TRAINING"] as const;
const validClassifications = ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "STRATEGIC"] as const;

function toDocumentType(value: string) {
  const normalized = value.toUpperCase();
  if (!validTypes.includes(normalized as typeof validTypes[number])) {
    throw new Error("invalid document type");
  }
  return normalized;
}

function toClassification(value: string) {
  const normalized = value.toUpperCase();
  if (!validClassifications.includes(normalized as typeof validClassifications[number])) {
    throw new Error("invalid document classification");
  }
  return normalized;
}

describe("knowledge validation", () => {
  it("rejects invalid document type", () => {
    expect(() => toDocumentType("invalid")).toThrow("invalid document type");
    expect(() => toDocumentType("book")).toThrow("invalid document type");
  });

  it("accepts valid document types", () => {
    expect(toDocumentType("statute")).toBe("STATUTE");
    expect(toDocumentType("report")).toBe("REPORT");
    expect(toDocumentType("manual")).toBe("MANUAL");
    expect(toDocumentType("training")).toBe("TRAINING");
  });

  it("rejects invalid classification", () => {
    expect(() => toClassification("top_secret")).toThrow("invalid document classification");
  });

  it("accepts valid classifications", () => {
    expect(toClassification("public")).toBe("PUBLIC");
    expect(toClassification("confidential")).toBe("CONFIDENTIAL");
    expect(toClassification("strategic")).toBe("STRATEGIC");
  });
});
