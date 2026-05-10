import { describe, expect, it, vi, beforeEach } from "vitest";
import { requestCompletion } from "./provider";
import type { CompletionRequest } from "./prompt";

const mocks = vi.hoisted(() => ({
  buildLanguageModel: vi.fn(),
  generateText: vi.fn(),
  getState: vi.fn(),
}));

vi.mock("@/modules/ai/lib/agent", () => ({
  buildLanguageModel: mocks.buildLanguageModel,
}));

vi.mock("ai", () => ({
  generateText: mocks.generateText,
}));

vi.mock("@/modules/settings/preferences", () => ({
  usePreferencesStore: {
    getState: mocks.getState,
  },
}));

describe("autocomplete provider", () => {
  beforeEach(() => {
    mocks.buildLanguageModel.mockReset();
    mocks.generateText.mockReset();
    mocks.getState.mockReset();
    mocks.getState.mockReturnValue({
      ollamaBaseURL: "",
      openaiCompatibleBaseURL: "",
    });
    mocks.buildLanguageModel.mockResolvedValue({} as never);
    mocks.generateText.mockResolvedValue({ text: "ok" });
  });

  it("uses the Google default model when autocomplete provider is google", async () => {
    const req: CompletionRequest = {
      prefix: "const answer = ",
      suffix: "",
      language: "typescript",
      filename: "src/example.ts",
    };

    await expect(
      requestCompletion(
        req,
        {
          provider: "google",
          modelId: "",
          apiKey: "google-key",
          lmstudioBaseURL: "http://lm.test/v1",
          ollamaBaseURL: "http://ollama.test/v1",
          openaiCompatibleBaseURL: "",
        },
        new AbortController().signal,
      ),
    ).resolves.toBe("ok");

    expect(mocks.buildLanguageModel).toHaveBeenCalledWith(
      "google",
      expect.objectContaining({ google: "google-key" }),
      "gemini-3-flash",
      expect.objectContaining({
        lmstudioBaseURL: "http://lm.test/v1",
        ollamaBaseURL: "http://ollama.test/v1",
        openaiCompatibleBaseURL: "",
        openaiCompatibleToken: null,
      }),
    );
  });
});
