import {
  Container,
  FederatedPointerEvent,
  Graphics,
  Text,
  TextStyle,
  type Ticker,
} from "pixi.js";

// ── Game state ──────────────────────────────────────────────────────────────
const enum State {
  ARRIVING,
  WAIT_HOSE,
  FILLING,
  FULL,
  WAIT_CROWN,
  CROWN_PLACED,
  CAPPING,
  LEAVING,
}

// ── Bottle fixed geometry (px) ──────────────────────────────────────────────
const BODY_W = 85;
const BODY_H = 165;
const SHOULDER_H = 30;
const NECK_W = 32;
const NECK_H = 52;
const MOUTH_W = 38;
const MOUTH_H = 15;
const BOTTLE_H = BODY_H + SHOULDER_H + NECK_H + MOUTH_H; // 262

// ── Beer physics ────────────────────────────────────────────────────────────
const FILL_RATE = 0.15; // fill fraction per second when stream hits mouth
const DRIFT_FREQ_A = 1.6;
const DRIFT_FREQ_B = 3.7;
const DRIFT_AMP_A = 50; // px — primary oscillation
const DRIFT_AMP_B = 12; // px — secondary oscillation

export class GameScreen extends Container {
  public static assetBundles: string[] = [];

  // ── Mutable state ───────────────────────────────────────────────────────
  private state = State.ARRIVING;
  private bottleCount = 0;
  private fillAmount = 0; // 0..1
  private hoseHeld = false;
  private hoseX = 0;
  private drift = 0;
  private driftTime = 0;
  private cappingTimer = 0;
  private capperOffset = 0; // px arm has moved down
  private bottleX = -120;
  private hasCrown = false;
  private fullTimer = 0;

  // ── Layout — recomputed in resize() ────────────────────────────────────
  private sw = 768;
  private sh = 1024;
  private BOTTLE_TARGET_X = 277;
  private BOTTLE_BOTTOM_Y = 768;
  private HOSE_HOLDER_X = 591;
  private HOSE_Y = 338;
  private HOSE_MIN_X = 61;
  private HOSE_MAX_X = 645;

  // ── PixiJS display objects ──────────────────────────────────────────────
  private bg = new Graphics(); // static background, redrawn on resize
  private world = new Graphics(); // dynamic elements, cleared each frame
  private hitSurface = new Graphics(); // invisible full-screen input catcher
  private msgText: Text;
  private countText: Text;
  private instrText: Text;
  private fillZoneLabel: Text;
  private flowRateLabel: Text;

  private _onKey: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.addChild(this.bg);
    this.addChild(this.world);

    this.msgText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial Black, Arial",
        fontSize: 52,
        fontWeight: "900",
        fill: "#FFD700",
        stroke: { color: "#7B3A00", width: 4 },
      }),
    });
    this.msgText.anchor.set(0.5);
    this.addChild(this.msgText);

    this.countText = new Text({
      text: "BOTTLES: 0",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 26,
        fontWeight: "bold",
        fill: "#FFFFFF",
        stroke: { color: "#000000", width: 3 },
      }),
    });
    this.countText.anchor.set(1, 0.5);
    this.addChild(this.countText);

    this.instrText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 20,
        fill: "#FFFF99",
        stroke: { color: "#333333", width: 2 },
      }),
    });
    this.instrText.anchor.set(0.5, 0);
    this.addChild(this.instrText);

    this.fillZoneLabel = new Text({
      text: "FILL ZONE",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 15,
        fontWeight: "bold",
        fill: "#C8A870",
      }),
    });
    this.addChild(this.fillZoneLabel);

    this.flowRateLabel = new Text({
      text: "FLOW RATE",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 13,
        fill: "#AAAAAA",
      }),
    });
    this.flowRateLabel.anchor.set(0.5, 1);
    this.addChild(this.flowRateLabel);

    this.hitSurface.eventMode = "static";
    this.hitSurface.cursor = "crosshair";
    this.addChild(this.hitSurface);

    this.hitSurface.on("pointermove", (e: FederatedPointerEvent) =>
      this.onPointerMove(e),
    );
    this.hitSurface.on("pointerdown", (e: FederatedPointerEvent) =>
      this.onPointerDown(e),
    );
    this.hitSurface.on("pointerup", (e: FederatedPointerEvent) =>
      this.onPointerUp(e),
    );
    this.hitSurface.on("pointerupoutside", (e: FederatedPointerEvent) =>
      this.onPointerUp(e),
    );

    this._onKey = (e: KeyboardEvent) => this.onKeyDown(e);
    window.addEventListener("keydown", this._onKey);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.initGame();
  }

  public async hide(): Promise<void> {
    window.removeEventListener("keydown", this._onKey);
  }

  public reset(): void {
    this.initGame();
  }

  private initGame(): void {
    this.state = State.ARRIVING;
    this.bottleCount = 0;
    this.fillAmount = 0;
    this.hoseHeld = false;
    this.drift = 0;
    this.driftTime = 0;
    this.cappingTimer = 0;
    this.capperOffset = 0;
    this.bottleX = -120;
    this.hasCrown = false;
    this.fullTimer = 0;
    this.hoseX = this.HOSE_HOLDER_X;
    this.countText.text = "BOTTLES: 0";
    this.instrText.text = "";
    this.msgText.text = "";
  }

  public resize(width: number, height: number): void {
    this.sw = width;
    this.sh = height;
    this.BOTTLE_TARGET_X = width * 0.36;
    this.BOTTLE_BOTTOM_Y = height * 0.75;
    this.HOSE_HOLDER_X = width * 0.77;
    this.HOSE_Y = height * 0.33;
    this.HOSE_MIN_X = width * 0.08;
    this.HOSE_MAX_X = width * 0.84;

    if (!this.hoseHeld) this.hoseX = this.HOSE_HOLDER_X;

    this.hitSurface.clear();
    this.hitSurface
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: 0 });

    this.countText.x = width - 18;
    this.countText.y = height - 32;
    this.msgText.x = width * 0.38;
    this.msgText.y = height * 0.41;
    this.instrText.x = width * 0.38;
    this.instrText.y = 12;
    this.fillZoneLabel.x = 20;
    this.fillZoneLabel.y = height * 0.17 + 8;
    this.flowRateLabel.x = width * 0.38;
    this.flowRateLabel.y = 50;

    this.drawBackground();
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaMS / 1000;
    switch (this.state) {
      case State.ARRIVING:
        this.stepArriving(dt);
        break;
      case State.FILLING:
        this.stepFilling(dt);
        break;
      case State.FULL:
        this.stepFull(dt);
        break;
      case State.CAPPING:
        this.stepCapping(dt);
        break;
      case State.LEAVING:
        this.stepLeaving(dt);
        break;
    }
    this.drawWorld();
  }

  // ── State steps ─────────────────────────────────────────────────────────

  private stepArriving(dt: number): void {
    this.bottleX += 400 * dt;
    if (this.bottleX >= this.BOTTLE_TARGET_X) {
      this.bottleX = this.BOTTLE_TARGET_X;
      this.enterState(State.WAIT_HOSE);
    }
  }

  private stepFilling(dt: number): void {
    this.driftTime += dt;
    this.drift =
      Math.sin(this.driftTime * DRIFT_FREQ_A) * DRIFT_AMP_A +
      Math.sin(this.driftTime * DRIFT_FREQ_B) * DRIFT_AMP_B +
      (Math.random() - 0.5) * 6;

    if (Math.abs(this.hoseX + this.drift - this.bottleX) < NECK_W / 2) {
      this.fillAmount = Math.min(1, this.fillAmount + FILL_RATE * dt);
    }
    if (this.fillAmount >= 1) {
      this.fillAmount = 1;
      this.enterState(State.FULL);
    }
  }

  private stepFull(dt: number): void {
    this.fullTimer += dt;
  }

  private stepCapping(dt: number): void {
    this.cappingTimer += dt;
    const D = 0.9;
    if (this.cappingTimer < D * 0.4) {
      this.capperOffset = (this.cappingTimer / (D * 0.4)) * 55;
    } else if (this.cappingTimer < D * 0.65) {
      this.capperOffset = 55;
    } else if (this.cappingTimer < D) {
      this.capperOffset =
        55 * (1 - (this.cappingTimer - D * 0.65) / (D * 0.35));
    } else {
      this.capperOffset = 0;
      this.bottleCount++;
      this.countText.text = `BOTTLES: ${this.bottleCount}`;
      this.enterState(State.LEAVING);
    }
  }

  private stepLeaving(dt: number): void {
    this.bottleX += 500 * dt;
    if (this.bottleX > this.sw + 120) {
      this.bottleX = -120;
      this.fillAmount = 0;
      this.hasCrown = false;
      this.hoseX = this.HOSE_HOLDER_X;
      this.hoseHeld = false;
      this.enterState(State.ARRIVING);
    }
  }

  // ── State machine ────────────────────────────────────────────────────────

  private enterState(s: State): void {
    this.state = s;
    this.fullTimer = 0;
    this.cappingTimer = 0;
    this.capperOffset = 0;
    this.msgText.text = "";

    const instrMap: Partial<Record<State, string>> = {
      [State.ARRIVING]: "Get ready...",
      [State.WAIT_HOSE]: "Click the hose holder to grab it  →",
      [State.FILLING]: "Move mouse left/right to fill the bottle!",
      [State.FULL]: "Bottle full!  Return hose to holder  →",
      [State.WAIT_CROWN]: "Press  [W]  to place the crown",
      [State.CROWN_PLACED]: "Press  [SPACE]  to cap the bottle!",
    };
    this.instrText.text = instrMap[s] ?? "";

    if (s === State.WAIT_HOSE) {
      this.hoseX = this.HOSE_HOLDER_X;
      this.hoseHeld = false;
    }
  }

  // ── Input ────────────────────────────────────────────────────────────────

  private onPointerMove(e: FederatedPointerEvent): void {
    if (!this.hoseHeld) return;
    this.hoseX = Math.max(
      this.HOSE_MIN_X,
      Math.min(this.HOSE_MAX_X, e.global.x),
    );
  }

  private onPointerDown(e: FederatedPointerEvent): void {
    if (this.state !== State.WAIT_HOSE) return;
    if (
      Math.hypot(e.global.x - this.HOSE_HOLDER_X, e.global.y - this.HOSE_Y) < 70
    ) {
      this.hoseHeld = true;
      this.enterState(State.FILLING);
    }
  }

  private onPointerUp(e: FederatedPointerEvent): void {
    if (!this.hoseHeld) return;
    const nearHolder =
      Math.hypot(e.global.x - this.HOSE_HOLDER_X, e.global.y - this.HOSE_Y) <
      80;

    if (this.state === State.FULL && nearHolder) {
      // Bottle full → player returned hose → proceed to crown step
      this.hoseHeld = false;
      this.drift = 0;
      this.enterState(State.WAIT_CROWN);
    } else if (this.state === State.FILLING) {
      // Released mid-fill → snap hose back, restart
      this.hoseHeld = false;
      this.hoseX = this.HOSE_HOLDER_X;
      this.drift = 0;
      this.enterState(State.WAIT_HOSE);
    }
    // If FULL and NOT near holder: keep hoseHeld=true, player must drag back
  }

  private onKeyDown(e: KeyboardEvent): void {
    if ((e.key === "w" || e.key === "W") && this.state === State.WAIT_CROWN) {
      this.hasCrown = true;
      this.enterState(State.CROWN_PLACED);
    }
    if (e.code === "Space" && this.state === State.CROWN_PLACED) {
      e.preventDefault();
      this.enterState(State.CAPPING);
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  private drawBackground(): void {
    const g = this.bg;
    const { sw, sh } = this;
    g.clear();

    // Base wood color
    g.rect(0, 0, sw, sh).fill({ color: 0x3d2b1f });

    // Grain lines
    for (let y = 40; y < sh; y += 58) {
      g.rect(0, y, sw, 3).fill({ color: 0x2a1e15, alpha: 0.45 });
    }

    // Fill zone panel (left ~58%)
    g.rect(0, sh * 0.14, sw * 0.58, sh * 0.86).fill({
      color: 0x2e1c10,
      alpha: 0.4,
    });

    // Right wall (slightly darker)
    g.rect(sw * 0.58, 0, sw * 0.42, sh).fill({ color: 0x1e1008, alpha: 0.35 });

    // Fill zone sign background
    g.rect(14, sh * 0.16, 108, 30).fill({ color: 0x4a3018 });
    g.rect(14, sh * 0.16, 108, 30).stroke({ color: 0x9b7a40, width: 2 });

    // Conveyor belt
    const cy = this.BOTTLE_BOTTOM_Y + 10;
    g.rect(0, cy, sw * 0.6, 26).fill({ color: 0x444444 });
    for (let x = 0; x < sw * 0.6; x += 42) {
      g.rect(x + 1, cy, 19, 26).fill({ color: 0x3a3a3a });
    }
    g.rect(0, cy, sw * 0.6, 3).fill({ color: 0x666666 });
    g.rect(0, cy + 23, sw * 0.6, 3).fill({ color: 0x222222 });

    // Floor
    g.rect(0, cy + 26, sw, sh - cy - 26).fill({ color: 0x18100a });

    // Flow-rate gauge trough (static shell, needle drawn each frame in world)
    const gx = sw * 0.38;
    g.rect(gx - 72, 54, 144, 15).fill({ color: 0x1a1a1a, alpha: 0.65 });
    g.rect(gx - 72, 54, 144, 15).stroke({ color: 0x444444, width: 1 });
  }

  private drawWorld(): void {
    const g = this.world;
    g.clear();

    this.drawHoseHolder(g);
    if (this.hoseHeld) this.drawBeerStream(g);
    this.drawBottle(g);
    this.drawHose(g);

    if (this.state === State.CROWN_PLACED || this.state === State.CAPPING) {
      this.drawCapper(g);
    }

    if (this.state === State.FILLING || this.state === State.FULL) {
      this.drawFlowIndicator(g);
    }

    this.updateMessage();
  }

  private drawHoseHolder(g: Graphics): void {
    const hx = this.HOSE_HOLDER_X;
    const hy = this.HOSE_Y;

    // Wall mount plate
    g.rect(hx - 5, hy - 52, 14, 104).fill({ color: 0x999999 });
    g.rect(hx - 5, hy - 52, 14, 104).stroke({ color: 0x555555, width: 2 });

    // Cradle hook
    g.rect(hx - 2, hy - 16, 10, 32).fill({ color: 0x777777 });

    // Pulsing return-zone ring when bottle is full and hose is held
    if (this.state === State.FULL && this.hoseHeld) {
      const pulse = 0.4 + 0.35 * Math.sin(Date.now() / 220);
      g.circle(hx + 5, hy, 52).fill({ color: 0xffff00, alpha: pulse * 0.18 });
      g.circle(hx + 5, hy, 52).stroke({
        color: 0xffff00,
        width: 2,
        alpha: pulse,
      });
    }
  }

  private drawBeerStream(g: Graphics): void {
    const sx = this.hoseX;
    const sy = this.HOSE_Y + 22;
    const ey = this.BOTTLE_BOTTOM_Y - BOTTLE_H; // bottle mouth top Y
    if (sy >= ey) return;

    // Segmented stream with quadratic drift offset
    for (let i = 0; i < 14; i++) {
      const t0 = i / 14;
      const t1 = (i + 1) / 14;
      const x0 = sx + this.drift * t0 * t0;
      const y0 = sy + (ey - sy) * t0;
      const x1 = sx + this.drift * t1 * t1;
      const y1 = sy + (ey - sy) * t1;
      g.moveTo(x0, y0)
        .lineTo(x1, y1)
        .stroke({ color: 0xffcc33, width: 9 - 4 * t0, alpha: 0.88 });
    }

    // Animated droplets travelling down the stream
    const t = Date.now() / 1000;
    for (let i = 0; i < 3; i++) {
      const bt = (t * 1.6 + i * 0.33) % 1;
      const bx = sx + this.drift * bt * bt;
      const by = sy + (ey - sy) * bt;
      g.circle(bx, by, 3 + bt * 3).fill({ color: 0xffee66, alpha: 0.7 });
    }

    // Landing splash when stream hits bottle mouth
    const landX = sx + this.drift;
    if (Math.abs(landX - this.bottleX) < NECK_W / 2) {
      const ph = Date.now() / 80;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + ph;
        const r = 8 + Math.sin(ph + i) * 4;
        g.circle(landX + Math.cos(a) * r, ey + Math.sin(a) * r * 0.3, 2).fill({
          color: 0xffdd55,
          alpha: 0.6,
        });
      }
    }
  }

  private drawBottle(g: Graphics): void {
    const x = this.bottleX;
    const bot = this.BOTTLE_BOTTOM_Y;

    // Beer fill (drawn first so glass appears on top)
    if (this.fillAmount > 0) {
      const fh = Math.floor(BODY_H * this.fillAmount);
      g.rect(x - BODY_W / 2 + 4, bot - fh, BODY_W - 8, fh).fill({
        color: 0xffbb22,
        alpha: 0.9,
      });
      // Foam on top of beer
      if (fh > 10) {
        g.ellipse(x, bot - fh - 6, BODY_W / 2 - 5, 9).fill({
          color: 0xfff8dc,
          alpha: 0.92,
        });
      }
    }

    // Glass — body
    g.rect(x - BODY_W / 2, bot - BODY_H, BODY_W, BODY_H)
      .fill({ color: 0x88ccaa, alpha: 0.32 })
      .stroke({ color: 0x55aa77, width: 3 });

    // Glass — shoulder (trapezoid)
    g.poly([
      x - BODY_W / 2,
      bot - BODY_H,
      x + BODY_W / 2,
      bot - BODY_H,
      x + NECK_W / 2,
      bot - BODY_H - SHOULDER_H,
      x - NECK_W / 2,
      bot - BODY_H - SHOULDER_H,
    ])
      .fill({ color: 0x88ccaa, alpha: 0.32 })
      .stroke({ color: 0x55aa77, width: 3 });

    // Glass — neck
    g.rect(x - NECK_W / 2, bot - BODY_H - SHOULDER_H - NECK_H, NECK_W, NECK_H)
      .fill({ color: 0x88ccaa, alpha: 0.32 })
      .stroke({ color: 0x55aa77, width: 3 });

    // Mouth ring
    const mouthY = bot - BOTTLE_H;
    g.rect(x - MOUTH_W / 2, mouthY, MOUTH_W, MOUTH_H)
      .fill({ color: 0x55aa77, alpha: 0.5 })
      .stroke({ color: 0x55aa77, width: 2 });

    if (this.hasCrown) this.drawCrown(g, x, mouthY);

    // Fill-level gauge bar (right side of bottle)
    const gx = x + BODY_W / 2 + 10;
    const gh = BODY_H + SHOULDER_H;
    g.rect(gx, bot - gh, 9, gh).fill({ color: 0x1a1a1a });
    if (this.fillAmount > 0) {
      g.rect(gx, bot - gh * this.fillAmount, 9, gh * this.fillAmount).fill({
        color: 0xffcc22,
      });
    }
    g.rect(gx, bot - gh, 9, gh).stroke({ color: 0x888888, width: 1 });
  }

  private drawCrown(g: Graphics, x: number, mouthY: number): void {
    const cw = 38;
    const ch = 16;
    const baseY = mouthY - ch; // crown base top (sits on bottle mouth)
    const pts = 5;
    const pw = cw / pts;
    const ph = 13; // point height above base

    // Base
    g.rect(x - cw / 2, baseY, cw, ch)
      .fill({ color: 0xcccccc })
      .stroke({ color: 0x888888, width: 2 });

    // Zigzag points
    for (let i = 0; i < pts; i++) {
      const px = x - cw / 2 + i * pw;
      g.poly([px, baseY, px + pw / 2, baseY - ph, px + pw, baseY]).fill({
        color: 0xdddddd,
      });
    }
  }

  private drawCapper(g: Graphics): void {
    const x = this.bottleX;
    const mouthY = this.BOTTLE_BOTTOM_Y - BOTTLE_H;
    const baseY = mouthY - 80;

    // Guide rails
    g.rect(x - 62, baseY - 42, 16, 52)
      .fill({ color: 0x777777 })
      .stroke({ color: 0x444444, width: 2 });
    g.rect(x + 46, baseY - 42, 16, 52)
      .fill({ color: 0x777777 })
      .stroke({ color: 0x444444, width: 2 });

    // Top crossbar
    g.rect(x - 62, baseY - 48, 124, 16)
      .fill({ color: 0x888888 })
      .stroke({ color: 0x555555, width: 2 });

    // Moving press head
    const headY = baseY + this.capperOffset;
    g.moveTo(x, baseY - 5)
      .lineTo(x, headY - 8)
      .stroke({ color: 0xaaaaaa, width: 5 });
    g.rect(x - 20, headY - 8, 40, 26)
      .fill({ color: 0x666666 })
      .stroke({ color: 0x333333, width: 2 });
  }

  private drawHose(g: Graphics): void {
    const hx = this.hoseX;
    const hy = this.HOSE_Y;

    // Hose tube from right wall to nozzle
    const tubeEndX = this.hoseHeld ? hx + 55 : this.HOSE_HOLDER_X + 10;
    g.moveTo(this.sw + 10, hy)
      .lineTo(tubeEndX, hy)
      .stroke({ color: 0x4a3520, width: 14 });

    // Grip body
    g.ellipse(hx + 22, hy, 38, 20)
      .fill({ color: 0x8b6914 })
      .stroke({ color: 0x5a3d00, width: 2 });

    // Nozzle tip (pointing left-down)
    g.poly([
      hx - 8,
      hy + 5,
      hx + 12,
      hy - 10,
      hx + 12,
      hy + 10,
      hx - 8,
      hy + 22,
    ]).fill({ color: 0x999999 });

    // Beer exit hole
    g.circle(hx - 4, hy + 13, 5).fill({ color: 0x222222 });

    // Green snap-ready glow when near holder while bottle is full
    if (
      this.state === State.FULL &&
      this.hoseHeld &&
      Math.abs(hx - this.HOSE_HOLDER_X) < 70
    ) {
      g.circle(hx + 22, hy, 44).stroke({
        color: 0x00ff44,
        width: 3,
        alpha: 0.85,
      });
    }
  }

  private drawFlowIndicator(g: Graphics): void {
    const gx = this.sw * 0.38;
    // Normalize drift to 0..1 range for needle position
    const norm = Math.max(0, Math.min(1, (this.drift / DRIFT_AMP_A + 1) / 2));
    const nx = gx - 72 + norm * 144;
    g.rect(nx - 3, 52, 6, 19).fill({ color: 0xff6644 });
    // Center reference tick
    g.moveTo(gx, 50)
      .lineTo(gx, 72)
      .stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
  }

  private updateMessage(): void {
    switch (this.state) {
      case State.FULL:
        this.msgText.text = "満杯！";
        this.msgText.alpha =
          this.fullTimer < 1.8
            ? 1
            : Math.max(0, 1 - (this.fullTimer - 1.8) * 0.8);
        break;
      case State.CAPPING:
        this.msgText.text = this.capperOffset > 40 ? "PRESS!" : "";
        this.msgText.alpha = 1;
        break;
      case State.LEAVING:
        this.msgText.text = "✓ Complete!";
        this.msgText.alpha = Math.max(
          0,
          1 - (this.bottleX - this.BOTTLE_TARGET_X) / (this.sw * 0.4),
        );
        break;
      default:
        this.msgText.text = "";
        break;
    }
  }
}
