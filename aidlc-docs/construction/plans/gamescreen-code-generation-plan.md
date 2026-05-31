# Code Generation Plan: GameScreen Unit (Cycle 2 — Change Request)

## Unit Context
- **Unit Name**: GameScreen (Cycle 2 modifications)
- **Target File**: `src/app/screens/game/GameScreen.ts` (MODIFY in-place)
- **Dependencies**: PixiJS v8 (already installed), existing engine infrastructure
- **Stories Covered**: FR-03 (Beer Flow updated), FR-04 (Full State updated), FR-05 (Hose Return updated)

---

## Generation Steps

### Step 1: Update beer physics constants
- [x] Remove constants: `DRIFT_FREQ_A`, `DRIFT_FREQ_B`, `DRIFT_AMP_A`, `DRIFT_AMP_B`
- [x] Add constants: `BEER_FORCE_MIN=80`, `BEER_FORCE_MAX=280`, `BEER_FALL_SPEED=450`, `FORCE_FREQ=1.4`

### Step 2: Update class state variables
- [x] Remove field: `private drift = 0`
- [x] Add field: `private currentForce = BEER_FORCE_MIN`

### Step 3: Update `initGame()` reset
- [x] `this.currentForce = BEER_FORCE_MIN` and `this.driftTime = 0`

### Step 4: Update `stepFilling()` — force oscillation replaces drift
- [x] Force oscillation: `forceNorm = (sin(driftTime × FORCE_FREQ) + 1) / 2`
- [x] Hit detection: `landingOffset = -(currentForce × fallHeight) / BEER_FALL_SPEED`

### Step 5: Update `onPointerUp()` — auto-return in FULL state
- [x] FULL state: auto-return on any pointer release, removed `nearHolder` check
- [x] Method signature changed to `onPointerUp()` (no parameter — not used)

### Step 6: Update `enterState()` — remove FULL instruction text
- [x] `[State.FULL]: ""`

### Step 7: Update `drawHoseHolder()` — remove yellow pulsing ring
- [x] Entire pulsing ring block deleted

### Step 8: Update `drawHose()` — remove green snap glow
- [x] Green glow block deleted

### Step 9: Update `drawBeerStream()` — fan-spray rendering
- [x] 5-ray fan with parabolic trajectory, center ray opaque, outer rays semi-transparent
- [x] Droplets along current-force ray
- [x] Splash at current-force landing position

### Step 10: Update `drawFlowIndicator()` — normalize by force instead of drift
- [x] `norm = (currentForce - BEER_FORCE_MIN) / (BEER_FORCE_MAX - BEER_FORCE_MIN)`

### Step 11: Verify no references to `drift` remain
- [x] Only `driftTime` remains (timer variable, correct)

### Step 12: Run lint + type-check
- [x] `npm run build` — passed (lint ✓, tsc ✓, vite build ✓)

### Step 13: Browser verification
- [ ] Run `npm run dev` — server started at http://localhost:8081/
- [ ] Verify: fan-spray renders leftward and oscillates between min and max angle
- [ ] Verify: filling works when hose positioned correctly
- [ ] Verify: releasing pointer in FULL state → advances to crown step
- [ ] Verify: no yellow ring or green glow in FULL state
- [ ] Verify: no "Return hose" instruction text in FULL state

---

## File Summary
| File | Action |
|------|--------|
| `src/app/screens/game/GameScreen.ts` | MODIFY in-place |
