import type { LlmProvider } from "@/ports";
import { createTestLlmProvider } from "./test-provider";

/**
 * OpenAI-compatible chat completions. Falls back to test provider when
 * LLM_MODE=test or API key missing.
 */
export function createHttpLlmProvider(): LlmProvider {
  const mode = (process.env.LLM_MODE || "test").toLowerCase();
  const key = process.env.LLM_API_KEY || "";
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (mode === "test" || !key) {
    return createTestLlmProvider();
  }

  const testFallback = createTestLlmProvider();

  return {
    async generateReport(input) {
      try {
        const system =
          "你是命理文化解说员，不是预言家。只能基于给定 JSON 结构解读。禁止绝对化措辞；输出简体中文 Markdown，含免责声明。";
        const user = JSON.stringify({
          kind: input.kind,
          title: input.title,
          focus: input.focus,
          note: input.note,
          structure: input.structure,
        });
        const res = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.7,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        });
        if (!res.ok) {
          throw new Error(`LLM HTTP ${res.status}`);
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const markdown = data.choices?.[0]?.message?.content?.trim();
        if (!markdown) throw new Error("empty llm content");
        return {
          markdown,
          model,
          tokensIn: data.usage?.prompt_tokens,
          tokensOut: data.usage?.completion_tokens,
        };
      } catch {
        // graceful degradation for local demos
        return testFallback.generateReport(input);
      }
    },
    async analyzePalm(params) {
      // Vision path optional; fall back to stub
      return testFallback.analyzePalm!(params);
    },
  };
}
