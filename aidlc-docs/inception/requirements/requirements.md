# Requirements: "Pour Beer!" PoC

## Intent Analysis
- **User Request**: spec.md + game-design.png を参考にゲームの PoC を実装
- **Request Type**: New Feature (new GameScreen replacing existing scaffold MainScreen)
- **Scope**: Single Component (GameScreen) + main.ts update
- **Complexity**: Moderate (state machine, physics-lite beer drift, input handling)

---

## Functional Requirements

### FR-01: Bottle Conveyor
- On game start, an empty bottle slides in from left to center position
- After a bottle is completed, it exits to the right and the next bottle arrives from the left automatically

### FR-02: Hose Grab
- A hose is docked at a fixed holder position (right-center area of screen)
- Player grabs the hose by clicking (pointer down) near the holder
- Beer begins flowing immediately upon grab

### FR-03: Beer Flow & Force (Updated — Cycle 2)
- Beer flows from the nozzle tip as a fan-shaped spray to the LEFT
- Two static parameters control the force range:
  - `BEER_FORCE_MIN` (px/sec): minimum horizontal left velocity
  - `BEER_FORCE_MAX` (px/sec): maximum horizontal left velocity
- A third constant `BEER_FALL_SPEED` (px/sec) represents virtual vertical fall speed for offset calculation
- The current force oscillates smoothly between BEER_FORCE_MIN and BEER_FORCE_MAX using a sin wave
- The fan spray is rendered as multiple rays fanning from nozzle exit across the full force range
- Beer fills bottle only when the current-force landing position falls within the bottle mouth (±neck-half-width)
- The sin-wave drift system (DRIFT_FREQ_A/B, DRIFT_AMP_A/B) is REMOVED; wobble is expressed solely through force oscillation

### FR-04: Full State
- Fill gauge reaches 100% → show "満杯！" effect
- Beer flow stops (fill stays capped at 100%)
- Instruction text is EMPTY in FULL state (no "Return hose" prompt)

### FR-05: Hose Return (Updated — Cycle 2)
- When bottle is FULL and player releases pointer (anywhere on screen):
  - Hose returns to holder automatically
  - State transitions to WAIT_CROWN
- If player releases pointer during FILLING (before full): hose snaps to holder automatically, state resets to WAIT_HOSE
- Yellow pulsing ring and green snap glow effects are REMOVED

### FR-06: Crown Placement
- After hose is docked (state = WAIT_CROWN): player presses [W] key
- Crown graphic appears above bottle mouth

### FR-07: Capping
- After crown placed (state = CROWN_PLACED): player presses [Space]
- Capper arm animation: moves down → presses crown → moves back up (~1s total)

### FR-08: Bottle Complete
- After capping: bottle count +1 (displayed bottom right as "BOTTLES: N")
- Bottle slides out to right, next bottle arrives from left

### FR-09: Visual Style (PoC)
- All graphics: PixiJS v8 Graphics API only (no texture assets, assetBundles = [])
- Primitive shapes: rect, circle, ellipse, poly
- Color palette: dark brown background, amber beer, translucent green bottle glass

---

## Non-Functional Requirements

| NFR | Requirement | Priority |
|-----|-------------|----------|
| Performance | 60fps on desktop browser | Medium |
| Input | Mouse pointer events + W / Space keyboard | High |
| Platform | Desktop browser only (no mobile touch needed for PoC) | Low |
| Security | SKIP (PoC) | N/A |
| Testing | SKIP (PoC) | N/A |

---

## Implementation Decisions (from Q&A)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Screen integration | Replace MainScreen | Cleanest for PoC |
| Hose release during fill | Snap back to holder, reset | Simplest UX |
| Security extension | Disabled | PoC |
| PBT extension | Disabled | PoC |
| Beer stream visual | Fan-shaped spray (Cycle 2) | More dramatic visual |
| Force parameters | Initial velocity min/max (px/sec) (Cycle 2) | Parabolic physics feel |
| Wobble expression | Force oscillation only — no sin drift (Cycle 2) | User explicit request |
| Return zone effects | Removed (Cycle 2) | No longer needed |
| FULL instruction text | Empty string (Cycle 2) | "満杯！" is sufficient |
