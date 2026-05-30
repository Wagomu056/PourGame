# Requirements Verification Questions

The game specification (spec.md) and visual design (game-design.png) are complete and clear.
The following questions cover extension opt-ins and one implementation decision needed for the PoC.

---

## Question 1: Security Extension
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or PoCs)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3: Screen Integration
How should the PoC GameScreen be integrated into the existing project?

A) Replace MainScreen — `main.ts` navigates to GameScreen after LoadScreen (cleanest for PoC)
B) Add alongside MainScreen — keep existing MainScreen, add GameScreen as a separate route (preserves existing code)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: Beer Return Behavior
Per spec Step 5, when the bottle is full the player must return the hose to the holder. What happens if the player releases the mouse button outside the holder zone during filling (before bottle is full)?

A) Hose snaps back to holder automatically, beer stops, state resets to "grab hose" (simplest)
B) Hose stays at current position (beer stops but player must physically drag it back)
X) Other (please describe after [Answer]: tag below)

[Answer]: A
