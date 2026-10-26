import { describe, expect, it } from "vitest";
import { gradeFor } from "./scoring";

describe("report-card grades", () => {
  it("matches the agreed ladder", () => {
    expect(gradeFor(350)).toBe("B-");
    expect(gradeFor(400)).toBe("B");
    expect(gradeFor(450)).toBe("B+");
    expect(gradeFor(500)).toBe("A-");
    expect(gradeFor(600)).toBe("A");
    expect(gradeFor(650)).toBe("A+");
    expect(gradeFor(700)).toBe("A+");
  });
  it("grades just below each cut-off one step down", () => {
    expect(gradeFor(349)).toBe("C+");
    expect(gradeFor(399)).toBe("C+");
    expect(gradeFor(449)).toBe("B-");
    expect(gradeFor(499)).toBe("B+");
    expect(gradeFor(599)).toBe("A-");
    expect(gradeFor(649)).toBe("A");
  });
  it("keeps low scores kind and only a blank sheet an F", () => {
    expect(gradeFor(10)).toBe("D-");
    expect(gradeFor(100)).toBe("D");
    expect(gradeFor(200)).toBe("C-");
    expect(gradeFor(300)).toBe("C+");
    expect(gradeFor(0)).toBe("F");
  });
});
