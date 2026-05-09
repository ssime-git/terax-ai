import { describe, expect, it } from "vitest";
import {
  detectMentionTrigger,
  serializeMentions,
  type WorkspaceMention,
} from "./mentions";

describe("workspace mentions", () => {
  it("detects @-mentions from the caret position", () => {
    expect(detectMentionTrigger("Ask @fi", 7)).toEqual({
      start: 4,
      end: 7,
      query: "fi",
    });
    expect(detectMentionTrigger("Ask @", 5)).toEqual({
      start: 4,
      end: 5,
      query: "",
    });
  });

  it("serializes file and folder mentions", () => {
    const mentions: WorkspaceMention[] = [
      {
        id: "m1",
        kind: "file",
        name: "notes.md",
        path: "/repo/docs/notes.md",
        rel: "docs/notes.md",
        isDir: false,
      },
      {
        id: "m2",
        kind: "dir",
        name: "src",
        path: "/repo/src",
        rel: "src",
        isDir: true,
      },
    ];

    expect(serializeMentions(mentions, "/repo")).toContain(
      '<mention kind="file" root="/repo" path="/repo/docs/notes.md" rel="docs/notes.md" name="notes.md" />',
    );
    expect(serializeMentions(mentions, "/repo")).toContain(
      '<mention kind="dir" root="/repo" path="/repo/src" rel="src" name="src" />',
    );
  });
});
