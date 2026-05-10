# Model Catalog and File Mentions

## Goal
Make model selection configurable with real provider model references instead of fixed presets, and add `@file` mentions in chat with a dynamic picker limited to the current workspace.

## Scope
This spec covers two independent features:

1. Editable model catalog entries for provider-backed models, starting with Groq, Cerebras, and local LLM providers.
2. `@...` file mentions in the AI chat composer, with workspace-local file search and insertion.

## Feature 1: Editable Model Catalog

### User intent
The user should be able to replace the shipped preset model names and references with their own actual model IDs and labels.

### Requirements
- Model entries must expose editable `label` and `modelRef` fields.
- The app must use the saved `modelRef` when building requests.
- The user must be able to rename the visible label without changing the underlying ref.
- The saved catalog must survive app restarts.
- Only these entries are editable for now:
  - Cerebras
  - Groq
  - LM Studio
- The change must apply to:
  - the AI status bar model picker,
  - the settings model picker,
  - autocomplete defaults when they point at the same catalog entry.

### Initial target entries
- Groq preset entries.
- Cerebras preset entries.
- The local LLM entry used by the app for model selection.

### UX
- Settings should show each editable entry as a row with:
  - provider,
  - display label,
  - model reference,
  - optional reset action to restore the shipped default.
- The model picker should show the edited label while still using the saved reference.

### Data model
- Add persisted per-entry overrides for:
  - `label`
  - `modelRef`
- Keep shipped defaults as fallback values.
- Do not remove support for explicit provider presets already in the app.

### Behavioral rules
- Empty label falls back to the default label.
- Empty model ref falls back to the shipped model reference.
- If the current selection points to a deleted or invalid entry, fall back to the default model for that provider.

## Feature 2: `@file` Mentions

### User intent
Typing `@` in the chat composer should let the user pick a file from the current workspace and insert a file reference.

### Requirements
- The feature must exist in the AI chat composer.
- The picker must only search inside the open workspace root.
- The picker must support incremental filtering while typing after `@`.
- The mention must resolve to a stable file path relative to the workspace root.
- The selected file should become part of the submitted chat payload as a structured file reference, not only plain text.
- The inserted mention must appear as a chip/object in the composer UI.

### UX
- Typing `@` opens a dynamic picker.
- Typing more characters narrows the file list.
- Arrow keys move through results.
- Enter inserts the highlighted file.
- Escape closes the picker.
- The picker must include both files and folders from the current workspace root.
- When a folder is selected, the mention should reference that folder path directly.

### Scope of search
- Only files under the current open folder/workspace root.
- Exclude paths outside the workspace even if they are reachable via symlink or history.
- Start with files that are already indexed by the explorer tree or discoverable from filesystem search.

### Serialization
- Keep the visible `@path` token in the composer text so the user can inspect what they inserted.
- On submit, convert the mention into a structured file reference in the message payload.
- The model should receive enough path information to resolve the reference without guessing.
- The structured payload must distinguish between file and folder mentions.

### Interaction with existing composer features
- `#snippet` and slash command behavior must keep working.
- `@file` mentions must coexist with file attachments and selections.
- Mention tokens should survive text editing and re-open correctly after the composer loses focus.

## Non-goals
- No Markdown mention syntax outside the chat composer.
- No global file search outside the workspace.
- No AI-side file resolver tool yet.
- No redesign of the terminal or editor panes.
