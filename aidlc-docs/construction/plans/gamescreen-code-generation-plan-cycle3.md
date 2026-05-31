# Code Generation Plan — GameScreen (Cycle 3)

## Unit Context

- **Unit**: GameScreen (single unit)
- **File**: `src/app/screens/game/GameScreen.ts`
- **Change**: Replace sin-wave force oscillation with random-interval force changes + smooth lerp
- **Risk**: Low — isolated to `stepFilling()` and surrounding constants/variables

## Steps

- [x] **Step 1**: Remove `FORCE_FREQ` constant (line ~37)
- [x] **Step 2**: Remove `driftTime` instance variable (line ~48) and its initialization in `initGame()` (line ~180)
- [x] **Step 3**: Add three new constants after `BEER_GRAVITY`:
  - `FORCE_CHANGE_MIN_INTERVAL = 0.5` — minimum seconds between force changes
  - `FORCE_CHANGE_MAX_INTERVAL = 2.0` — maximum seconds between force changes
  - `FORCE_LERP_SPEED = 200` — px/sec per second, lerp rate toward target force
- [x] **Step 4**: Add two new instance variables after `currentForce`:
  - `private targetForce = BEER_FORCE_MIN`
  - `private forceChangeTimer = 0`
- [x] **Step 5**: Update `initGame()` — initialize `targetForce = BEER_FORCE_MIN` and `forceChangeTimer = 0`
- [x] **Step 6**: Rewrite `stepFilling()` force update block:
  - Decrement `forceChangeTimer` by `dt`
  - When `forceChangeTimer <= 0`: pick random `targetForce` in [BEER_FORCE_MIN, BEER_FORCE_MAX], pick random new interval in [FORCE_CHANGE_MIN_INTERVAL, FORCE_CHANGE_MAX_INTERVAL]
  - Lerp `currentForce` toward `targetForce` at `FORCE_LERP_SPEED * dt` px/sec per frame (clamped to not overshoot)
  - Remove the old `driftTime` accumulation and `Math.sin()` formula

## New stepFilling() Force Logic (reference)

```typescript
// Countdown timer; when expired pick new random target and interval
this.forceChangeTimer -= dt;
if (this.forceChangeTimer <= 0) {
  this.targetForce =
    BEER_FORCE_MIN + Math.random() * (BEER_FORCE_MAX - BEER_FORCE_MIN);
  this.forceChangeTimer =
    FORCE_CHANGE_MIN_INTERVAL +
    Math.random() * (FORCE_CHANGE_MAX_INTERVAL - FORCE_CHANGE_MIN_INTERVAL);
}

// Smooth lerp toward target (no overshoot)
const diff = this.targetForce - this.currentForce;
const maxStep = FORCE_LERP_SPEED * dt;
this.currentForce +=
  Math.abs(diff) <= maxStep ? diff : Math.sign(diff) * maxStep;
```

## No New Files

Only `src/app/screens/game/GameScreen.ts` is modified. No new files created.
