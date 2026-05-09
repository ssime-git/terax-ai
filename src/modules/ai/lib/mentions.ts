import { invoke } from "@tauri-apps/api/core";

export type WorkspaceMention = {
  id: string;
  kind: "file" | "dir";
  name: string;
  path: string;
  rel: string;
  isDir: boolean;
};

export type MentionTrigger = {
  start: number;
  end: number;
  query: string;
};

export type MentionSearchHit = {
  path: string;
  rel: string;
  name: string;
  is_dir: boolean;
};

export function detectMentionTrigger(
  value: string,
  caret: number,
): MentionTrigger | null {
  for (let i = caret - 1; i >= 0; i--) {
    const ch = value[i];
    if (ch === "@") {
      const prev = i === 0 ? " " : value[i - 1];
      if (!/\s/.test(prev)) return null;
      const slice = value.slice(i + 1, caret);
      if (!/^[^\s@]*$/.test(slice)) return null;
      return { start: i, end: caret, query: slice.toLowerCase() };
    }
    if (/\s/.test(ch)) return null;
  }
  return null;
}

export async function searchWorkspaceMentions(
  root: string,
  query: string,
  limit = 50,
): Promise<WorkspaceMention[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const hits = await invoke<MentionSearchHit[]>("fs_search", {
    root,
    query: trimmed,
    limit,
  });
  return hits.map((hit) => ({
    id: hit.path,
    kind: hit.is_dir ? "dir" : "file",
    name: hit.name,
    path: hit.path,
    rel: hit.rel,
    isDir: hit.is_dir,
  }));
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function serializeMentions(
  mentions: readonly WorkspaceMention[],
  workspaceRoot: string,
): string {
  if (mentions.length === 0) return "";
  const blocks = mentions.map(
    (m) =>
      `<mention kind="${esc(m.kind)}" root="${esc(workspaceRoot)}" path="${esc(m.path)}" rel="${esc(m.rel)}" name="${esc(m.name)}" />`,
  );
  return blocks.join("\n\n");
}
