import { describe, expect, it } from "vitest";
import {
  AUTOCOMPLETE_PROVIDERS,
  DEFAULT_AUTOCOMPLETE_MODEL,
  getProvider,
  providerNeedsKey,
} from "./config";

describe("AI provider registry", () => {
  it("exposes keyless Ollama and OpenAI-compatible providers", () => {
    expect(getProvider("ollama").label).toBe("Ollama");
    expect(providerNeedsKey("ollama")).toBe(false);

    expect(getProvider("openai-compatible").label).toBe(
      "OpenAI-compatible",
    );
    expect(providerNeedsKey("openai-compatible")).toBe(false);
  });

  it("includes Google in autocomplete with a Gemini default", () => {
    expect(AUTOCOMPLETE_PROVIDERS).toContain("google");
    expect(DEFAULT_AUTOCOMPLETE_MODEL.google).toBe(
      "gemini-3-flash-preview",
    );
  });
});
