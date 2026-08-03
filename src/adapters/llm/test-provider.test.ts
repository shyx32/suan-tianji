import { describe, expect, it } from "vitest";
import { createTestLlmProvider } from "./test-provider";
import { buildBaziChart } from "@/domain/bazi/engine";

describe("createTestLlmProvider", () => {
  it("bazi report is Chinese-only without residual English concurrent", async () => {
    const llm = createTestLlmProvider();
    const chart = buildBaziChart({
      gender: "male",
      year: 1988,
      month: 3,
      day: 8,
      hour: 9,
      minute: 0,
      birthplace: "杭州",
      focus: ["事业"],
    });
    const out = await llm.generateReport({
      kind: "bazi",
      title: "test",
      structure: chart,
      focus: ["事业"],
    });
    expect(out.markdown).not.toMatch(/concurrent/i);
    expect(out.markdown).toContain("年柱关乎六亲");
  });
});
