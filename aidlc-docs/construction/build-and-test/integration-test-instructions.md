# Integration Test Instructions — PourGame (Cycle 2)

No automated tests (PoC). Manual browser verification covers all scenarios.

## Test Environment
```bash
npm run dev   # http://localhost:8080/
```

## Change 1: Beer Parabolic Arc

### TC-1.1 Low force → nearly straight down
1. Grab the hose
2. Watch the beer stream oscillate
3. **Verify**: When force is at minimum (flow indicator needle far left), stream falls nearly vertically

### TC-1.2 High force → pronounced left arc
1. Watch flow indicator needle move right
2. **Verify**: When force is at maximum (needle far right), stream curves significantly to the left in a visible parabolic arc

### TC-1.3 Force parameters affect landing position
1. Position hose to the RIGHT of the bottle (~150–200 px right)
2. **Verify**: Oscillating force brings the beer through the bottle mouth periodically → fill bar increases

### TC-1.4 Build constant verification
- Open `src/app/screens/game/GameScreen.ts` lines 34–37
- **Verify**: `BEER_FORCE_MIN`, `BEER_FORCE_MAX`, `BEER_GRAVITY`, `FORCE_FREQ` are defined as static constants

## Change 2: Hose Auto-Return on Full

### TC-2.1 Game flow preserved
1. Fill bottle to 100%
2. Release mouse anywhere
3. **Verify**: Transitions to WAIT_CROWN state (W key prompt appears)

### TC-2.2 Hose snaps to holder position
1. Fill bottle to 100% with hose far from holder (e.g., center of screen)
2. Release mouse
3. **Verify**: Hose graphic snaps back to right-side holder position (same as mid-fill release)

### TC-2.3 Identical to mid-fill release
1. Mid-fill: release mouse → verify hose snaps to holder ✓
2. Full: release mouse → verify hose snaps to holder ✓ (same visual result)

### TC-2.4 Visual effects removed
- **Verify**: No yellow pulsing ring around holder in FULL state
- **Verify**: No green glow around hose in FULL state
- **Verify**: No "Return hose to holder" instruction text in FULL state

## Full Game Loop Regression

| Step | Action | Expected |
|------|--------|---------|
| 1 | Game starts | Bottle slides in from left |
| 2 | Click near hose holder | Hose grabbed, beer stream starts |
| 3 | Move mouse left/right | Stream position follows hose; force oscillates |
| 4 | Position hose to right of bottle | Beer hits mouth periodically, fill bar rises |
| 5 | Fill reaches 100% | "満杯！" message shows |
| 6 | Release mouse | Hose snaps to holder, W key prompt appears |
| 7 | Press W | Crown placed on bottle |
| 8 | Press Space | Capper animation plays |
| 9 | Capping complete | BOTTLES counter increments, bottle exits right |
| 10 | Loop | Next bottle arrives from left |
