# Execution Plan: "Pour Beer!" — Change Request Cycle 3

## Analysis Summary

- **Transformation Type**: Single component modification (GameScreen.ts only)
- **Risk Level**: Low — isolated change within one file, no architecture changes
- **Rollback**: Easy — git revert single file
- **Testing**: Manual browser play-through

## Change Impact Assessment

| Area | Impact | Description |
|------|--------|-------------|
| User-facing | Yes | Beer arc movement becomes unpredictable (design goal) |
| Structural | No | No new components, no architecture change |
| Data model | No | State variables changed, not added to external API |
| API | No | No interface changes |
| NFR | No | Same performance profile |

## Workflow Visualization

```
flowchart TD
    Start([User Request])

    subgraph INCEPTION [INCEPTION PHASE]
        WD[Workspace Detection - COMPLETED]
        RA[Requirements Analysis - COMPLETED]
        WP[Workflow Planning - IN PROGRESS]
        US[User Stories - SKIP]
        AD[Application Design - SKIP]
        UG[Units Generation - SKIP]
    end

    subgraph CONSTRUCTION [CONSTRUCTION PHASE]
        FD[Functional Design - SKIP]
        NFRA[NFR Requirements - SKIP]
        CG[Code Generation - EXECUTE]
        BT[Build and Test - EXECUTE]
    end

    Start --> WD --> RA --> WP --> CG --> BT --> End([Complete])
```

## Phases to Execute

### INCEPTION PHASE
- [x] Workspace Detection — COMPLETED (existing project, Cycle 2 done)
- [x] Reverse Engineering — SKIPPED (CLAUDE.md covers architecture)
- [x] Requirements Analysis — COMPLETED (1 question answered, lerp approach confirmed)
- [ ] User Stories — SKIP (single mechanic change, single user type)
- [x] Workflow Planning — IN PROGRESS
- [ ] Application Design — SKIP (no new components)
- [ ] Units Generation — SKIP (single unit: GameScreen)

### CONSTRUCTION PHASE
- [ ] Functional Design — SKIP (simple logic swap, no complex business rules)
- [ ] NFR Requirements — SKIP (PoC, existing NFR profile unchanged)
- [ ] NFR Design — SKIP
- [ ] Infrastructure Design — SKIP (no infra changes)
- [ ] Code Generation — **EXECUTE** (modify GameScreen.ts stepFilling + constants)
- [ ] Build and Test — **EXECUTE** (npm run build + browser verification)

### OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

## Code Changes Summary

**File**: `src/app/screens/game/GameScreen.ts`

| Change | Detail |
|--------|--------|
| Remove | `FORCE_FREQ` constant |
| Remove | `driftTime` instance variable |
| Add constants | `FORCE_CHANGE_MIN_INTERVAL`, `FORCE_CHANGE_MAX_INTERVAL`, `FORCE_LERP_SPEED` |
| Add variables | `targetForce`, `forceChangeTimer` |
| Update | `initGame()` — initialize new variables |
| Rewrite | `stepFilling()` — random timer + lerp instead of sin wave |

## Success Criteria

- Beer force changes at random intervals (0.5–2.0 s)
- Transition is smooth (lerp at `FORCE_LERP_SPEED` px/sec per second)
- All three parameters are tunable static constants
- `npm run build` passes (lint + tsc + vite)
- Browser: arc visibly shifts at irregular intervals, unpredictable to the player
