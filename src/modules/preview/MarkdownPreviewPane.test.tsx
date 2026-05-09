import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownPreviewPane } from "./MarkdownPreviewPane";

vi.mock("@/modules/editor/lib/useDocument", () => ({
  useDocument: () => ({
    doc: {
      status: "ready",
      content: `# Notes

- [x] Done
- [ ] Todo

| Name | Value |
| --- | --- |
| One | 1 |

\`\`\`ts
const answer = 42;
\`\`\`

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
`,
      size: 128,
    },
    dirty: false,
    onChange: vi.fn(),
    save: vi.fn(),
    reload: vi.fn(),
  }),
}));

describe("MarkdownPreviewPane", () => {
  it("renders markdown content in read-only mode", () => {
    render(
      <MarkdownPreviewPane
        path="/tmp/project/notes.md"
        visible
        onPathChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("const answer = 42;")).toBeInTheDocument();
    expect(screen.getByText("graph TD")).toBeInTheDocument();
  });
});
