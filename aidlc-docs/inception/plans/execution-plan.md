# Execution Plan: "Pour Beer!" — Change Request Cycle 2

## Analysis Summary

- **Transformation Type**: Single component modification (GameScreen.ts only)
- **Risk Level**: Low — isolated changes within one file, no architecture changes
- **Rollback**: Easy — git revert single file
- **Testing**: Manual browser play-through

## Change Impact Assessment

| Area | Impact | Description |
|------|--------|-------------|
| User-facing changes | Yes | Beer stream visual + hose return behavior |
| Structural changes | No | Same architecture, same state machine |
| Data model changes | No | No new data structures |
| API changes | No | No interface changes |
| NFR impact | No | Performance unchanged |

## Workflow Visualization

```
INCEPTION PHASE
  [x] Workspace Detection    COMPLETED
  [-] Reverse Engineering    SKIPPED (existing artifacts current)
  [x] Requirements Analysis  COMPLETED
  [-] User Stories           SKIPPED (single user, simple modification)
  [x] Workflow Planning      COMPLETED (this document)
  [-] Application Design     SKIPPED (no new components)
  [-] Units Generation       SKIPPED (single unit: GameScreen)

CONSTRUCTION PHASE
  [-] Functional Design      SKIPPED (changes clear from requirements)
  [-] NFR Requirements       SKIPPED (PoC)
  [-] NFR Design             SKIPPED (PoC)
  [-] Infrastructure Design  SKIPPED (no infra changes)
  [ ] Code Generation        EXECUTE
  [ ] Build and Test         EXECUTE

OPERATIONS PHASE
  [ ] Operations             PLACEHOLDER
```

## Phases to Execute

### INCEPTION PHASE
- [x] Workspace Detection — COMPLETED
- [x] Reverse Engineering — SKIPPED (existing artifacts current; CLAUDE.md covers architecture)
- [x] Requirements Analysis — COMPLETED
- [x] User Stories — SKIPPED (single user type, modifications only)
- [x] Workflow Planning — COMPLETED
- [x] Application Design — SKIPPED (no new components needed)
- [x] Units Generation — SKIPPED (single unit: GameScreen.ts)

### CONSTRUCTION PHASE
- [x] Functional Design — SKIPPED (requirements clearly define all changes)
- [x] NFR Requirements — SKIPPED (PoC)
- [x] NFR Design — SKIPPED (PoC)
- [x] Infrastructure Design — SKIPPED (no infra changes)
- [ ] **Code Generation — EXECUTE**
- [ ] **Build and Test — EXECUTE**

### OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

## Code Generation Plan

### Files to Modify
| File | Changes |
|------|---------|
| `src/app/screens/game/GameScreen.ts` | Two mechanics changes (see below) |

### Change 1: Beer Fan-Spray with Force Parameters

**New static parameters to add:**
```typescript
const BEER_FORCE_MIN = 80;   // px/sec — minimum horizontal left velocity
const BEER_FORCE_MAX = 280;  // px/sec — maximum horizontal left velocity
const BEER_FALL_SPEED = 450; // px/sec — virtual vertical speed for offset calculation
const FORCE_FREQ = 1.4;      // oscillation frequency (replaces DRIFT_FREQ_A)
```

**Parameters to remove:**
- `DRIFT_FREQ_A`, `DRIFT_FREQ_B`, `DRIFT_AMP_A`, `DRIFT_AMP_B`

**State changes:**
- Remove: `this.drift`
- Rename/repurpose: `this.driftTime` → `this.forceTime`
- Add: `this.currentForce` (oscillates between BEER_FORCE_MIN and BEER_FORCE_MAX)

**Force oscillation (in `stepFilling`):**
```
forceTime += dt
currentForce = BEER_FORCE_MIN + (BEER_FORCE_MAX - BEER_FORCE_MIN) × (sin(forceTime × FORCE_FREQ) + 1) / 2
```

**Stream trajectory at parameter p (0..1):**
```
landingOffset = -(currentForce × fallHeight) / BEER_FALL_SPEED   // always negative (left)
x_p = nozzleX + landingOffset × p²                               // parabolic curve
y_p = nozzleY + fallHeight × p
```

**Fan spray rendering:**
- 5 rays from nozzle exit, forces: MIN, 25%, 50%, 75%, MAX of range
- Center ray (50%) is most opaque/wide, outer rays are thinner/more transparent
- Current force highlighted for hit detection reference

**Hit detection:**
```
landingX = hoseX + landingOffset
hit = |landingX - bottleX| < NECK_W / 2
```

### Change 2: Auto-Return Hose When Full

**`onPointerUp` logic change:**
```
Before:
  if FULL && nearHolder: → WAIT_CROWN
  if FILLING: → WAIT_HOSE (snap back)
  if FULL && NOT nearHolder: do nothing

After:
  if FULL: → WAIT_CROWN (auto, regardless of position)
  if FILLING: → WAIT_HOSE (snap back, unchanged)
```

**Visual effects to remove:**
- Yellow pulsing return zone ring (in `drawHoseHolder`)
- Green snap-ready glow (in `drawHose`)

**Instruction text update:**
- FULL state instrText → `""` (empty)

**Flow indicator update:**
- Normalize using currentForce instead of drift

## Success Criteria
1. Beer streams out as a fan spray, visibly angled to the left
2. BEER_FORCE_MIN and BEER_FORCE_MAX are clearly defined as static constants
3. Filling still works (hit zone detectable when hose positioned correctly)
4. When bottle is full and player releases pointer anywhere → state advances to crown step
5. No yellow ring / green glow in FULL state
6. "満杯！" message displays; no "Return hose" instruction text
7. `npm run build` passes lint and type-check
