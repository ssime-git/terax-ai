# Terax AI Providers + Markdown Rendering Test Plan

## Provider configuration

### Ollama

- provider is listed in settings
- provider is available in chat model picker
- provider is available in autocomplete provider picker
- provider does not require a token
- default Ollama URL is populated
- custom Ollama model id is accepted

### OpenAI-compatible

- provider is listed in settings
- base URL can be configured
- token can be provided
- token is optional if the provider is configured as keyless
- custom model id is accepted
- model cache key changes when URL/token/model changes

### Backward compatibility

- existing OpenAI / Anthropic / Google / xAI / Cerebras / Groq / LM Studio flows still resolve
- existing stored preferences migrate without breaking
- default model remains valid

## Agent transport

- agent construction selects the correct provider backend
- missing required keys fail with a clear error
- keyless providers do not fail key validation
- send/reconnect paths behave the same for new providers

## Autocomplete

- autocomplete can target Ollama
- autocomplete can target OpenAI-compatible
- no-key configuration works
- configured model id is passed through

## Markdown preview

- `.md` and `.markdown` files open in raw editor by default
- preview action opens rendered view
- preview is read-only
- tables render correctly
- task lists render correctly
- math renders correctly
- fenced code blocks render with syntax highlighting
- Mermaid renders when enabled/supported
- invalid Mermaid fails gracefully
- preview does not mutate file contents

## Suggested test types

- unit tests for provider config helpers
- unit tests for transport selection / cache keys
- component tests for settings UI visibility rules
- component tests for Markdown preview rendering
- integration tests for opening Markdown preview from the editor

