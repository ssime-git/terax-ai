SHELL := /bin/sh

.PHONY: help dev tauri-dev build preview test test-run typecheck

help:
	@printf '%s\n' \
		'Available targets:' \
		'  make dev         - Start Vite dev server' \
		'  make tauri-dev    - Start the desktop app in Tauri dev mode' \
		'  make build        - Typecheck and build the frontend' \
		'  make preview      - Preview the Vite build' \
		'  make test         - Run Vitest in watch mode' \
		'  make test-run     - Run Vitest once' \
		'  make typecheck    - Run TypeScript typecheck'

dev:
	pnpm dev

tauri-dev:
	pnpm tauri dev

build:
	pnpm build

preview:
	pnpm preview

test:
	pnpm test

test-run:
	pnpm test:run

typecheck:
	pnpm exec tsc --noEmit
