# Execution Plan: "Pour Beer!" PoC

## Analysis Summary

- **Transformation Type**: Single component (new GameScreen) + minor main.ts update
- **Risk Level**: Low — isolated new screen, no changes to engine or infrastructure
- **Rollback**: Easy — revert main.ts to show MainScreen
- **Testing**: Manual browser play-through

## Workflow Visualization

```
INCEPTION PHASE
  [x] Workspace Detection    COMPLETED
  [-] Reverse Engineering    SKIPPED (CLAUDE.md covers architecture)
  [x] Requirements Analysis  COMPLETED
  [-] User Stories           SKIPPED (single user, clear interactions)
  [x] Workflow Planning      COMPLETED (this document)
  [-] Application Design     SKIPPED (structure clear from spec)
  [-] Units Generation       SKIPPED (single unit: GameScreen)

CONSTRUCTION PHASE
  [-] Functional Design      SKIPPED (spec.md is comprehensive)
  [-] NFR Requirements       SKIPPED (PoC)
  [-] NFR Design             SKIPPED (PoC)
  [-] Infrastructure Design  SKIPPED (no infra changes)
  [ ] Code Generation        EXECUTE
  [ ] Build and Test         EXECUTE

OPERATIONS PHASE
  [ ] Operations             PLACEHOLDER
```

## Phases to Execute

### 🔵 INCEPTION PHASE
- [x] Workspace Detection — COMPLETED
- [x] Reverse Engineering — SKIPPED (CLAUDE.md documents architecture sufficiently)
- [x] Requirements Analysis — COMPLETED
- [x] User Stories — SKIPPED (single user type, interactions are clear)
- [x] Workflow Planning — IN PROGRESS
- [x] Application Design — SKIPPED (spec defines all components; no new service layers)
- [x] Units Generation — SKIPPED (single implementation unit)

### 🟢 CONSTRUCTION PHASE
- [ ] Functional Design — SKIPPED (spec.md covers all business logic)
- [ ] NFR Requirements — SKIPPED (PoC: no production NFRs needed)
- [ ] NFR Design — SKIPPED
- [ ] Infrastructure Design — SKIPPED (no cloud/infra changes)
- [ ] **Code Generation — EXECUTE**
- [ ] **Build and Test — EXECUTE**

### 🟡 OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

## Code Generation Plan

### Files to Create
| File | Description |
|------|-------------|
| `src/app/screens/game/GameScreen.ts` | Main game screen with full state machine and PixiJS Graphics rendering |

### Files to Modify
| File | Change |
|------|--------|
| `src/main.ts` | Import GameScreen; change `showScreen(MainScreen)` → `showScreen(GameScreen)` |

### Game State Machine
```
ARRIVING → WAIT_HOSE → FILLING → FULL → WAIT_CROWN → CROWN_PLACED → CAPPING → LEAVING → ARRIVING (loop)
```

### Key Game Logic
1. **Beer drift**: `drift = sin(t×1.6)×50 + sin(t×3.7)×12 + noise(6)`
2. **Hit detection**: `|hoseX + drift - bottleX| < neckHalfWidth`
3. **Fill rate**: 0.15 per second when hitting
4. **Capper animation**: 0.9s total (down 40%, hold 25%, up 35%)
5. **Bottle travel**: 400px/s arriving, 500px/s leaving

## Estimated Effort
- Code Generation: 1 session (single file + 2-line main.ts change)
- Build and Test: Manual play-through in browser

## Success Criteria
1. Bottle arrives, player can grab hose, beer flows
2. Beer drift makes aiming challenging
3. Bottle fills when aim is correct
4. "満杯！" shows when full
5. Crown → cap → bottle exits → count increments → cycle repeats
