import { describe, expect, it } from "vitest";
import {
  resolveEditableModel,
  type EditableModelOverrides,
} from "./modelCatalog";

describe("model catalog", () => {
  it("uses editable overrides for Cerebras, Groq, and LM Studio", () => {
    const overrides: EditableModelOverrides = {
      cerebras: { label: "Cerebras - M1", modelRef: "cerebras/m1-80b" },
      groq: { label: "Groq - Llama 3.3", modelRef: "llama-3.3-70b-versatile" },
      lmstudio: { label: "Local - Qwen", modelRef: "qwen2.5-coder-14b" },
    };

    expect(resolveEditableModel("gpt-oss-120b", overrides)).toMatchObject({
      provider: "cerebras",
      label: "Cerebras - M1",
      modelRef: "cerebras/m1-80b",
    });
    expect(resolveEditableModel("openai/gpt-oss-20b", overrides)).toMatchObject({
      provider: "groq",
      label: "Groq - Llama 3.3",
      modelRef: "llama-3.3-70b-versatile",
    });
    expect(resolveEditableModel("lmstudio-local", overrides)).toMatchObject({
      provider: "lmstudio",
      label: "Local - Qwen",
      modelRef: "qwen2.5-coder-14b",
    });
  });

  it("falls back to shipped values when overrides are blank", () => {
    const resolved = resolveEditableModel("gpt-oss-120b", {
      cerebras: { label: "", modelRef: "" },
    });

    expect(resolved.label).toBe("GPT-OSS 120B");
    expect(resolved.modelRef).toBe("gpt-oss-120b");
  });
});
