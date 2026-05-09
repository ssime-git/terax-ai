# Tests

## Model Catalog

### Unit
- Editing a catalog entry persists the new label and model reference.
- Resetting an entry restores the shipped defaults.
- The selected model picker label reflects the overridden label.
- Request building uses the stored model reference, not the default preset.
- Invalid or empty overrides fall back to the default entry.
- Only Cerebras, Groq, and LM Studio expose editable catalog rows.

### Integration
- Switching to an edited Groq/Cerebras/local entry keeps the selected provider stable.
- Autocomplete and chat both use the same resolved catalog values.

## `@file` Mentions

### Unit
- Typing `@` with a partial query opens the mention picker.
- The mention picker filters to files under the active workspace root.
- Selecting an item inserts the expected token into composer text.
- Submitting text with a mention serializes a structured file reference block.
- Plain `#snippet` and slash-command flows remain unchanged.
- Mention chips render as composer objects, not raw markdown.
- Folder mentions are selectable and serialize as folder references.

### Integration
- A mention selected from the picker can reference a file in the current workspace and no other folder.
- After renaming or deleting a file, stale mentions fall back gracefully or are cleared.
