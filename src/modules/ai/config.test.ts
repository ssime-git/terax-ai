import { describe, expect, it } from "vitest";
import { getProvider, providerNeedsKey } from "./config";

describe("AI provider registry", () => {
  it("exposes keyless Ollama and OpenAI-compatible providers", () => {
    expect(getProvider("ollama").label).toBe("Ollama");
    expect(providerNeedsKey("ollama")).toBe(false);

    expect(getProvider("openai-compatible").label).toBe(
      "OpenAI-compatible",
    );
    expect(providerNeedsKey("openai-compatible")).toBe(false);
  });
});

