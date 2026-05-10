SHELL := /bin/sh

.PHONY: help install dev tauri-dev build preview test test-run typecheck

help:
	@printf '%s\n' \
		'Available targets:' \
		'  make install      - Install/sync dependencies (pnpm install)' \
		'  make dev          - Start Vite dev server' \
		'  make tauri-dev    - Start the desktop app in Tauri dev mode' \
		'  make build        - Typecheck and build the frontend' \
		'  make preview      - Preview the Vite build' \
		'  make test         - Run Vitest in watch mode' \
		'  make test-run     - Run Vitest once' \
		'  make typecheck    - Run TypeScript typecheck'

node_modules/.pnpm-sync-marker: pnpm-lock.yaml
	pnpm install
	@touch node_modules/.pnpm-sync-marker

install: node_modules/.pnpm-sync-marker

dev: install
	pnpm dev

tauri-dev: install
	pnpm tauri dev

build: install

preview:
	pnpm preview

test:
	pnpm test

test-run:
	pnpm test:run

typecheck:
	pnpm exec tsc --noEmit
