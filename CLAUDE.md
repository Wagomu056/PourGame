# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

**MANDATORY**: For any software development request (new features, bug fixes, refactoring, etc.), always follow the workflow defined in `WORKFLOW.md` before proceeding with implementation. `WORKFLOW.md` takes priority over all built-in workflows.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:8080 (auto-opens browser)
npm run build    # Lint + type-check + production build
npm run lint     # ESLint only
```

There are no tests in this project.

## Architecture

**PourGame** is a PixiJS v8 browser game scaffolded with Vite + TypeScript.

### Engine (`src/engine/`)

A thin wrapper around `pixi.js` Application (`CreationEngine`) that registers three custom plugins:

- **`CreationNavigationPlugin`** — mounts a `Navigation` instance as `app.navigation`. Manages screen/popup lifecycle: `showScreen()`, `presentPopup()`, `dismissPopup()`. Screens are pooled via PixiJS `BigPool`.
- **`CreationAudioPlugin`** — mounts an audio manager as `app.audio` with `BGM` (looping background music with crossfade) and `SFX` (one-shot effects) sub-managers, both backed by `@pixi/sound`.
- **`CreationResizePlugin`** — replaces PixiJS's default `ResizePlugin`. Scales the canvas to maintain a minimum resolution (configured via `resizeOptions` in `main.ts`), with optional letterboxing.

Access the engine singleton from anywhere in app code via `engine()` from `src/app/getEngine.ts`.

### App (`src/app/`)

- **Screens** (`screens/`) — PixiJS `Container` subclasses implementing the `AppScreen` interface (`show`, `hide`, `pause`, `resume`, `resize`, `update`, `reset`, `blur`, `focus`, `onLoad`). Declare `static assetBundles` to trigger asset loading before the screen shows.
- **Popups** (`popups/`) — Same interface as screens; presented over the current screen (which gets paused).
- **UI components** (`ui/`) — Reusable PixiJS display objects (`Button`, `Label`, `RoundedBox`, `VolumeSlider`).
- **`userSettings`** — Persists BGM/SFX/master volumes to `localStorage` via `src/engine/utils/storage.ts`.

### Asset pipeline

Raw assets live in `raw-assets/` and are processed by **AssetPack** (`@assetpack/core`) via the custom Vite plugin in `scripts/assetpack-vite-plugin.ts`. In dev mode AssetPack watches for changes; in build mode it runs once. Output goes to `public/assets/` and the generated manifest is written to `src/manifest.json`. The `{m}` tag in directory names controls multi-resolution output; `{tps}` triggers texture-packer sprite sheet generation.

Assets are loaded through the `Navigation` system: `showScreen()` reads `ctor.assetBundles` and calls `Assets.loadBundle()` before the screen appears, reporting progress via `currentScreen.onLoad`.
