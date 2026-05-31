# Build Instructions — PourGame (Cycle 2)

## Prerequisites
- **Node.js**: 18+
- **Package Manager**: npm
- **Build Tool**: Vite 6 + TypeScript + ESLint + Prettier

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Production Build (lint + type-check + bundle)
```bash
npm run build
```

### 3. Verify Build Success
- **Expected Output**: `✓ built in ~1.7s`
- **Build Artifacts**: `dist/` directory
  - `dist/index.html`
  - `dist/assets/index-*.js` (~404 kB)
  - `dist/assets/` (chunked PixiJS modules)

### 4. Dev Server (for manual verification)
```bash
npm run dev
# → http://localhost:8080/  (or 8081 if 8080 is busy)
```

## Key Parameters (tunable in GameScreen.ts)
```typescript
const BEER_FORCE_MIN = 60;   // px/sec — min exit velocity (nearly straight down)
const BEER_FORCE_MAX = 380;  // px/sec — max exit velocity (wide left arc)
const BEER_GRAVITY = 700;    // px/sec² — gravitational acceleration
const FORCE_FREQ = 1.4;      // oscillation frequency (rad/sec)
```
