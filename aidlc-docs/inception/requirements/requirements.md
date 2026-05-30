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

### FR-03: Beer Flow & Drift
- Beer flows downward from hose tip while hose is not docked
- Beer has periodic + random horizontal drift that changes over time
  - Formula: `sin(t × 1.6) × 50 + sin(t × 3.7) × 12 + random noise`
- Beer fills bottle only when stream lands within bottle mouth (±neck-half-width)
- Beer is wasted (no fill) when stream misses bottle mouth

### FR-04: Full State
- Fill gauge reaches 100% → show "満杯！" effect
- Beer flow stops (fill stays capped at 100%)
- Player must return hose to holder

### FR-05: Hose Return
- Player moves mouse over holder and releases pointer → hose docks, beer stops
- If player releases pointer outside holder zone **during filling** (before full): hose snaps to holder automatically, state resets to "grab hose"
- While bottle is full and hose is held: release outside holder zone has no effect (player must bring hose to holder)

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
