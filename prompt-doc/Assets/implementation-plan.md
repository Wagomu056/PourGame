# Asset Implementation Plan

## 基本方針：Hybrid アプローチ

| 種別 | 手段 | 理由 |
|---|---|---|
| 位置固定の絵 | `Sprite` | 毎フレーム再描画不要 |
| 繰り返しテクスチャ | `TilingSprite` | コンベア・木目など |
| ビール弧（物理計算） | `Graphics`（現状維持） | 放物線をコードで毎フレーム計算するため |
| ビール液面マスク | `Graphics`（マスク専用） | fillAmount に応じて高さを毎フレーム更新 |
| フローゲージ針 | `Sprite`（x 座標のみ更新） | 形状は固定 |

---

## Container 階層の再設計

現在は `bg: Graphics` + `world: Graphics` の 2 枚だけだが、以下に分解する。

```
GameScreen
├── bgWood: TilingSprite          ← 木目（現: bg内 rect）
├── bgPanels: Graphics            ← 暗い左右パネル（薄い単色、Graphicsのまま）
├── conveyor: TilingSprite        ← コンベア
├── gaugeTrough: Sprite           ← ゲージ枠（静的）
│
├── bottleContainer: Container    ← bottleX で一括移動
│   ├── bottleBack: Sprite
│   ├── beerFillSprite: Sprite    ← mask で液面クリップ
│   ├── beerFillMask: Graphics    ← 毎フレーム高さ更新
│   ├── beerFoam: Sprite
│   ├── bottleFront: Sprite       ← 半透明ガラス
│   ├── bottleLabel: Sprite
│   └── crownCap: Sprite          ← visible toggle
│
├── beerArc: Graphics             ← 物理弧（現状維持）
│
├── hoseHolder: Sprite            ← 固定位置
├── hoseTube: TilingSprite        ← 右壁〜ノズル間を stretch
├── hoseGrip: Sprite              ← hoseX で移動
│
├── capperContainer: Container    ← visible toggle（state 別）
│   ├── capperBase: Sprite
│   └── capperHead: Sprite        ← capperOffset で y 更新
│
├── gaugeNeedle: Sprite           ← currentForce で x 更新
├── hitSurface: Graphics          ← 変更なし
└── Text × 4                     ← 変更なし
```

---

## ビール液面のマスク実装

`fillAmount` に応じて毎フレームマスク形状を更新する。

```typescript
// 初期化時
this.beerFillMask = new Graphics();
this.beerFillSprite.mask = this.beerFillMask;
this.bottleContainer.addChild(this.beerFillMask);

// drawBottle() 内（毎フレーム）
const fh = BODY_H * this.fillAmount;
this.beerFillMask.clear()
  .rect(-BODY_W / 2 + 4, -fh, BODY_W - 8, fh)
  .fill(0xffffff);
```

---

## アセットバンドル設定

`raw-assets/game{m}/` ディレクトリを作成し全画像を格納する。

```typescript
// GameScreen.ts
public static assetBundles: string[] = ['game'];  // [] → ['game']
```

AssetPack が `src/manifest.json` に `game` バンドルを自動追記するため、他の設定変更は不要。

---

## 段階的移行ステップ

1. `raw-assets/game{m}/` を作成しダミー画像を 1 枚配置 → バンドル動作確認
2. ボトル系スプライト化（最も視覚インパクト大）
3. 背景・コンベア（TilingSprite）
4. ホース系
5. キャッパー系
6. ゲージ・UI 系

ビール弧は最後まで Graphics のまま残し、アセットが揃ってからパーティクル化を検討する。
