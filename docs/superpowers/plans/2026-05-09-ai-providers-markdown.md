# AI Providers + Markdown Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ollama and generic OpenAI-compatible provider support for chat/autocomplete, plus a native read-only Markdown preview for `.md` / `.markdown` files.

**Architecture:** Extend the existing AI provider registry so local and OpenAI-compatible endpoints share one transport path with provider-specific settings. Add a dedicated Markdown renderer and wire it into the editor/tab flow without changing the raw editor as the canonical edit surface.

**Tech Stack:** React 19, TypeScript, Tauri 2, Vercel AI SDK v6, CodeMirror 6, Zustand, Tailwind v4, shadcn/ui, `react-markdown` or equivalent Markdown renderer, math/mermaid plugins as needed.

---

### Task 1: Add test infrastructure

**Files:**
- Modify: `package.json`
- Add: `vitest.config.ts`
- Add: `src/test/setup.ts`
- Add: `src/modules/ai/config.test.ts`
- Add: `src/modules/editor/lib/languageResolver.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { providerNeedsKey, getProvider } from "@/modules/ai/config";

describe("provider support", () => {
  it("treats Ollama and OpenAI-compatible providers as keyless when configured that way", () => {
    expect(providerNeedsKey("ollama")).toBe(false);
    expect(providerNeedsKey("openai-compatible")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/ai/config.test.ts -v`
Expected: fail because `ollama` / `openai-compatible` are not in the provider registry yet.

- [ ] **Step 3: Write minimal implementation**

Add Vitest dependencies and a minimal config so the test runner works in the browser-oriented codebase.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/ai/config.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts src/modules/ai/config.test.ts src/modules/editor/lib/languageResolver.test.ts
git commit -m "test: add vitest baseline"
```

### Task 2: Expand AI provider registry and settings

**Files:**
- Modify: `src/modules/ai/config.ts`
- Modify: `src/modules/ai/lib/keyring.ts`
- Modify: `src/modules/settings/store.ts`
- Modify: `src/modules/settings/preferences.ts`
- Modify: `src/settings/sections/ModelsSection.tsx`
- Modify: `src/settings/components/ProviderIcon.tsx`
- Modify: `src/modules/ai/components/AiStatusBarControls.tsx`
- Modify: `src/modules/editor/lib/autocomplete/provider.ts`
- Modify: `src/modules/ai/lib/agent.ts`
- Modify: `src/modules/ai/store/chatStore.ts`
- Modify: `src/modules/ai/lib/transport.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getProvider, providerNeedsKey } from "@/modules/ai/config";

describe("provider registry", () => {
  it("exposes Ollama", () => {
    expect(getProvider("ollama").label).toBe("Ollama");
    expect(providerNeedsKey("ollama")).toBe(false);
  });

  it("exposes OpenAI-compatible", () => {
    expect(getProvider("openai-compatible").label).toBe("OpenAI-compatible");
    expect(providerNeedsKey("openai-compatible")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/ai/config.test.ts -v`
Expected: fail on missing providers.

- [ ] **Step 3: Write minimal implementation**

Add provider metadata, keyless-provider handling, persisted endpoint settings, and model helpers that can point at configurable base URLs.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/ai/config.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/ai/config.ts src/modules/ai/lib/keyring.ts src/modules/settings/store.ts src/modules/settings/preferences.ts src/settings/sections/ModelsSection.tsx src/settings/components/ProviderIcon.tsx src/modules/ai/components/AiStatusBarControls.tsx src/modules/editor/lib/autocomplete/provider.ts src/modules/ai/lib/agent.ts src/modules/ai/store/chatStore.ts src/modules/ai/lib/transport.ts
git commit -m "feat: add ollama and openai-compatible providers"
```

### Task 3: Add Markdown preview rendering

**Files:**
- Add: `src/modules/editor/MarkdownPreviewPane.tsx`
- Modify: `src/modules/editor/index.ts`
- Modify: `src/modules/editor/EditorStack.tsx`
- Modify: `src/modules/editor/EditorPane.tsx`
- Modify: `src/modules/tabs/lib/useTabs.ts`
- Modify: `src/modules/tabs/TabBar.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/modules/explorer/FileExplorer.tsx`
- Modify: `src/modules/explorer/lib/constants.ts`
- Modify: `src/modules/explorer/lib/fileIcons.ts`
- Modify: `src/modules/editor/lib/languageResolver.ts`
- Modify: `src/modules/preview/PreviewPane.tsx` only if the rendering is reused there

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { resolveLanguage } from "@/modules/editor/lib/languageResolver";

describe("markdown language support", () => {
  it("resolves markdown files", async () => {
    await expect(resolveLanguage("notes.md")).resolves.not.toBeNull();
    await expect(resolveLanguage("notes.markdown")).resolves.not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/editor/lib/languageResolver.test.ts -v`
Expected: PASS for language resolution, but the new Markdown preview test will still fail until the preview component exists.

- [ ] **Step 3: Write minimal implementation**

Add a read-only Markdown preview surface that can render tables, task lists, math, code fences, and Mermaid gracefully.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/editor/lib/languageResolver.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/editor/MarkdownPreviewPane.tsx src/modules/editor/index.ts src/modules/editor/EditorStack.tsx src/modules/editor/EditorPane.tsx src/modules/tabs/lib/useTabs.ts src/modules/tabs/TabBar.tsx src/app/App.tsx src/modules/explorer/FileExplorer.tsx src/modules/explorer/lib/constants.ts src/modules/explorer/lib/fileIcons.ts src/modules/editor/lib/languageResolver.ts src/modules/preview/PreviewPane.tsx
git commit -m "feat: add native markdown preview"
```

### Task 4: Wire Markdown preview actions and polish

**Files:**
- Modify: `src/modules/header/Header.tsx`
- Modify: `src/modules/shortcuts/shortcuts.ts`
- Modify: `src/modules/shortcuts/lib/useGlobalShortcuts.ts`
- Modify: `src/modules/statusbar/StatusBar.tsx`
- Modify: `src/modules/tabs/TabBar.tsx`
- Modify: `src/modules/editor/EditorPane.tsx`
- Modify: `src/modules/editor/EditorStack.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { titleFromUrl } from "@/modules/tabs/lib/useTabs";

describe("tab titles", () => {
  it("keeps preview titles stable", () => {
    expect(titleFromUrl("http://localhost:3000")).toBe("localhost:3000");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/tabs/lib/useTabs.test.ts -v`
Expected: fail until the new preview/open behavior is wired and exported for reuse.

- [ ] **Step 3: Write minimal implementation**

Add a visible Markdown preview button and any shortcut integration needed to open the rendered view from a Markdown editor tab.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/tabs/lib/useTabs.test.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/header/Header.tsx src/modules/shortcuts/shortcuts.ts src/modules/shortcuts/lib/useGlobalShortcuts.ts src/modules/statusbar/StatusBar.tsx src/modules/tabs/TabBar.tsx src/modules/editor/EditorPane.tsx src/modules/editor/EditorStack.tsx
git commit -m "feat: add markdown preview affordances"
```

### Task 5: Verify and document

**Files:**
- Modify: `docs/specs/ai-providers-markdown/spec.md` if the implementation revealed a necessary spec correction
- Modify: `docs/specs/ai-providers-markdown/tests.md`
- Add: `docs/specs/ai-providers-markdown/implementation.md`

- [ ] **Step 1: Run the focused test suite**

Run: `pnpm vitest`
Expected: all new tests pass.

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: clean typecheck.

- [ ] **Step 3: Run the app**

Run: `pnpm tauri dev`
Expected: app launches, settings loads, Markdown preview opens, AI provider settings persist.

- [ ] **Step 4: Commit**

```bash
git add docs/specs/ai-providers-markdown/* src/*
git commit -m "feat: add ai providers and markdown preview"
```

## Coverage check

- Ollama provider support: Task 2
- Generic OpenAI-compatible support: Task 2
- No-key providers: Task 2
- Markdown raw editor + preview: Task 3
- Markdown tables/tasks/math/code/Mermaid: Task 3
- UI affordance to open preview: Task 4
- Tests and validation: Tasks 1, 5

