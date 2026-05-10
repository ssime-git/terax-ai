# Implementation Plan

## Phase 1: Model Catalog
1. Add persistent overrides in settings storage for Cerebras, Groq, and LM Studio model labels and model references.
2. Update the model registry to resolve displayed label and actual model ref separately for those providers only.
3. Update the model picker and autocomplete settings to use the resolved values.
4. Add reset actions for overridden model entries.
5. Add tests for persistence and resolution.

## Phase 2: `@file` Mentions
1. Add mention detection in the chat composer textarea.
2. Add a workspace-local chip-based picker component with incremental filtering.
3. Include files and folders from the active workspace root.
4. Store the selected mention as structured composer state.
5. Serialize mentions into the chat payload on submit.
6. Ensure mention handling coexists with `#snippet`, slash commands, selections, and attachments.
7. Add tests for picker behavior, chip rendering, serialization, and workspace scoping.

## Verification
- `pnpm exec tsc --noEmit`
- `pnpm test:run`
- Manual smoke test in `pnpm tauri dev`:
  - edit a model label and ref
  - choose a custom model in chat
  - type `@` in chat and insert a file from the open workspace
