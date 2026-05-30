# Code Generation Plan: GameScreen Unit

## Unit Context
- **Unit Name**: GameScreen
- **Dependencies**: PixiJS v8 (already installed), existing engine/navigation infrastructure
- **Interfaces**: AppScreen interface (show, hide, reset, resize, update)
- **Stories Covered**: FR-01 through FR-09 (all game mechanics)

---

## Generation Steps

### Step 1: Create game screen directory
- [ ] Create `src/app/screens/game/` directory

### Step 2: Create `src/app/screens/game/GameScreen.ts`
Full state machine + rendering for the complete game loop.

**State Machine**:
```
ARRIVING → WAIT_HOSE → FILLING → FULL → WAIT_CROWN → CROWN_PLACED → CAPPING → LEAVING → (loop)
```

**PixiJS objects** (all Graphics API, no textures):
- `bg: Graphics` — static background (wood planks, fill zone, conveyor belt); redrawn on resize
- `world: Graphics` — dynamic game elements (bottle, hose, beer stream, capper); cleared+redrawn each frame
- `hitSurface: Graphics` — transparent full-screen input capture (eventMode='static')
- Text objects: `msgText` ("満杯！"), `countText` ("BOTTLES: N"), `instrText` (step instructions), `fillZoneLabel`

**Layout** (proportional to sw/sh, recomputed on resize):
| Constant | Formula | @ 768×1024 |
|----------|---------|------------|
| BOTTLE_TARGET_X | sw × 0.36 | 277 |
| BOTTLE_BOTTOM_Y | sh × 0.75 | 768 |
| HOSE_HOLDER_X | sw × 0.77 | 591 |
| HOSE_Y | sh × 0.33 | 338 |
| HOSE_MIN_X / MAX_X | sw × 0.08 / 0.84 | 61 / 645 |

**Bottle geometry** (fixed px):
- Body: 85w × 165h
- Shoulder: trapezoid 30h
- Neck: 32w × 52h
- Mouth ring: 38w × 15h
- Total height: 262px → mouth at BOTTLE_BOTTOM_Y - 262

**Beer drift formula**: `sin(t × 1.6) × 50 + sin(t × 3.7) × 12 + random(-3, 3)`  
**Hit detection**: `|hoseX + drift - bottleX| < 16` (half neck width)  
**Fill rate**: 0.15 per second when hitting  
**Capper animation**: 0.9s (down 40%, hold 25%, up 35%)  
**Bottle travel**: 400px/s arriving, 500px/s leaving

**Rendering methods**:
- `drawBackground()` — wood-plank bg, fill zone, conveyor belt (called from resize)
- `drawWorld()` — calls all dynamic drawing methods each frame
- `drawHoseHolder(g)` — wall bracket + return-zone indicator ring
- `drawBeerStream(g)` — quadratic curved stream with droplets + splash
- `drawBottle(g)` — glass body/shoulder/neck/mouth, beer fill, foam, fill gauge bar
- `drawCrown(g, x, y)` — zigzag crown shape
- `drawCapper(g)` — guide rails, top bar, moving press head
- `drawHose(g)` — hose tube + nozzle grip + tip
- `updateMessage()` — manages msgText visibility per state

- [ ] Step 2 complete

### Step 3: Update `src/main.ts`
- [ ] Add `import { GameScreen } from "./app/screens/game/GameScreen";`
- [ ] Remove `import { MainScreen } from "./app/screens/main/MainScreen";`
- [ ] Change `showScreen(MainScreen)` → `showScreen(GameScreen)`
- [ ] Step 3 complete

### Step 4: Manual verification
- [ ] Run `npm run dev`
- [ ] Verify: bottle slides in → hose grabbable → beer flows with drift → bottle fills → "満杯！" → W crown → Space cap → count increments → cycle repeats

---

## File Summary
| File | Action | Description |
|------|--------|-------------|
| `src/app/screens/game/GameScreen.ts` | CREATE | ~350 lines, complete game implementation |
| `src/main.ts` | MODIFY | 2 lines changed |
