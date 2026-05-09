# Terax AI Providers + Markdown Rendering Spec

Date: 2026-05-09
Status: Draft
Owner: Codex + user review

## Context

Terax already supports:
- multiple hosted AI providers through `src/modules/ai/lib/agent.ts`
- a local OpenAI-compatible backend for LM Studio
- editor syntax highlighting for Markdown files
- a separate preview tab for URLs

This spec adds:
1. Ollama support for chat and editor autocomplete
2. Generic OpenAI-compatible provider support with custom URL, token, and model
3. Native Markdown rendering for `.md` / `.markdown` files in read-only mode

## Goals

- Use local Ollama models already installed on the machine.
- Support any OpenAI-compatible endpoint that exposes a chat completions API.
- Allow an endpoint configuration that works with or without a token.
- Open Markdown files in the editor as raw text, with a preview action that renders the file natively.
- Render Markdown with tables, task lists, math, code fences, and optional Mermaid.

## Non-goals

- No collaborative editing.
- No Markdown WYSIWYG editor.
- No live split-pane editor/preview unless explicitly added later.
- No write support from the Markdown rendered view.
- No automatic provider discovery daemon.

## Product decisions already fixed

- Ollama is treated as a dedicated provider in the UI.
- The generic OpenAI-compatible provider is configurable through URL + token + model.
- Providers may be keyless.
- Markdown preview is read-only for the first iteration.
- Markdown opens in the raw editor by default, with a preview button.

## Existing code paths to reuse

- AI provider selection and model persistence:
  - `src/modules/ai/config.ts`
  - `src/modules/settings/sections/ModelsSection.tsx`
  - `src/modules/ai/lib/agent.ts`
  - `src/modules/editor/lib/autocomplete/provider.ts`
- File opening and tab management:
  - `src/modules/tabs/lib/useTabs.ts`
  - `src/app/App.tsx`
  - `src/modules/editor/EditorStack.tsx`
- Markdown language support:
  - `src/modules/editor/lib/languageResolver.ts`
  - `src/modules/explorer/lib/constants.ts`
- Preview infrastructure:
  - `src/modules/preview/*`

## Proposed architecture

### 1. Provider model

Introduce an explicit distinction between:
- hosted providers requiring a key
- local / open endpoints that may not require a key
- generic OpenAI-compatible endpoints

The current LM Studio path is a special case of OpenAI-compatible transport. This feature should generalize that pattern rather than duplicating transport logic.

### 2. New provider entries

Add providers and models in the AI config layer:

- `ollama`
  - label: `Ollama`
  - keyless by default
  - default base URL: `http://localhost:11434/v1`
  - model id is user-configurable

- `openai-compatible`
  - label: `OpenAI-compatible`
  - optional token
  - base URL configurable by user
  - model id user-configurable

The config layer must support per-provider metadata:
- whether a token is required
- whether the provider uses an editable base URL
- whether the provider needs a custom model list
- default model suggestions

### 3. Settings UX

In `Settings → Models`:

- show Ollama as a selectable provider
- show OpenAI-compatible as a selectable provider
- keep the current LM Studio configuration path if it remains supported
- allow the user to enter:
  - base URL
  - token
  - model

If the selected provider does not require a token, the token field should be hidden or shown as optional and clearly marked.

If the selected provider supports model discovery, provide a refresh/test action:
- `GET {baseURL}/models`

For Ollama, the provider should work out of the box with the default local endpoint.

### 4. Model picker behavior

The default model selector should:
- show provider grouping
- show only models compatible with the current provider
- permit custom model ids for OpenAI-compatible endpoints
- permit custom model ids for Ollama

### 5. Chat transport behavior

The agent builder should support:
- standard hosted providers
- Ollama through an OpenAI-compatible transport
- arbitrary OpenAI-compatible endpoints with custom base URL and optional token

The transport must:
- memoize model clients by provider + key + model + baseURL
- fail with a useful error if a required token is missing
- allow empty token when the provider is marked keyless

### 6. Editor autocomplete

Inline autocomplete should support:
- Ollama
- generic OpenAI-compatible endpoints

The autocomplete provider settings should:
- reuse the same endpoint and model configuration where possible
- permit no-token endpoints
- keep latency expectations explicit in the UI

### 7. Markdown rendering

Open Markdown files in the existing editor as raw text.

Add a preview action for Markdown tabs:
- button in the editor tab header or toolbar
- keyboard shortcut if consistent with the current shortcut system
- preview should open a dedicated tab or replace a dedicated Markdown preview surface

The rendered Markdown view must be:
- read-only
- styled for readability
- able to render tables
- able to render task lists
- able to render math
- able to render code fences with syntax highlighting
- able to render Mermaid when available

The preview should not mutate the source file.

### 8. Markdown rendering pipeline

Use a renderer component that can be mounted in a dedicated preview surface.

The pipeline should:
- read file contents from the editor or filesystem
- transform Markdown into rendered React content
- preserve code block languages
- apply safe defaults for raw HTML
- avoid executing arbitrary embedded scripts

If Mermaid support is included, it must be isolated and opt-in per fenced block. If Mermaid fails to parse, the renderer should degrade gracefully to a code block.

## UX details

- Markdown preview should be accessible from the editor tab chrome.
- If preview is open, reopening it should reuse the existing tab where possible.
- If the file changes on disk, the preview should refresh when the active editor reloads or when the preview is explicitly refreshed.
- The raw editor remains the canonical editing surface.

## Data and persistence

Add any new settings to the existing preferences store.

Likely persisted values:
- provider id
- base URL
- token handle or token value in the keyring, depending on provider
- model id
- optional feature flags for Mermaid / math rendering if user-configurable

Do not store secrets in plain-text preferences.

## Implementation order

1. Expand provider config and settings for Ollama + generic OpenAI-compatible endpoints.
2. Generalize transport/model construction.
3. Extend autocomplete to use the same provider abstraction.
4. Add Markdown preview rendering.
5. Wire the editor UI to open Markdown preview.
6. Add tests and fixture coverage.

## Acceptance criteria

- User can configure Ollama and use it for chat and autocomplete.
- User can configure a custom OpenAI-compatible endpoint with URL, optional token, and model.
- `providerNeedsKey` logic does not block keyless providers.
- Markdown files still open in the raw editor by default.
- Markdown preview renders tables, tasks, math, and highlighted code fences.
- Mermaid blocks render or fail gracefully without breaking the preview.
- Existing providers continue to work unchanged.

## Open questions

None blocking at the moment. The current assumption is:
- Ollama is a first-class provider
- generic OpenAI-compatible endpoints are separate configuration from hosted providers

