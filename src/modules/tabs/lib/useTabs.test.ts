import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTabs } from "./useTabs";

describe("useTabs", () => {
  it("opens markdown preview tabs separately from web previews", () => {
    const { result } = renderHook(() => useTabs());

    let id: number | null = null;
    act(() => {
      id = result.current.newMarkdownPreviewTab("/tmp/project/notes.md");
    });

    expect(id).toBeTruthy();
    expect(result.current.tabs).toHaveLength(2);

    const tab = result.current.tabs.find((t) => t.id === id);
    expect(tab).toMatchObject({
      kind: "markdown-preview",
      title: "notes.md",
      path: "/tmp/project/notes.md",
    });
  });
});
