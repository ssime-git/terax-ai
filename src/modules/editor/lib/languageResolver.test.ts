import { describe, expect, it } from "vitest";
import { resolveLanguage } from "./languageResolver";

describe("resolveLanguage", () => {
  it("resolves markdown file extensions", async () => {
    await expect(resolveLanguage("notes.md")).resolves.not.toBeNull();
    await expect(resolveLanguage("notes.markdown")).resolves.not.toBeNull();
  });
});

