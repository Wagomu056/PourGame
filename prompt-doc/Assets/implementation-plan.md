# Asset Implementation Plan

## 基本方針：Hybrid アプローチ

| 種別 | 手段 | 理由 |
|---|---|---|
| 位置固定の絵 | `Sprite` | 毎フレーム再描画不要（ボトル、ホルダー、ゲージ枠など） |
| 繰り返しテクスチャ | `TilingSprite` | 木目作業台、ホースの管（チューブ）など |
| ビール弧（物理計算） | `Graphics`（現状維持） | 放物線やノズルのブレをコードで毎フレーム計算・描画するため |
| ビール液面マスク | `Graphics`（マスク専用） | fillAmount に応じて矩形高さを毎フレーム更新 |
| フローゲージ針 | `Sprite`（角度またはx座標更新） | 形状は固定、値に応じてトランスフォームのみ変更 |

---

## Container 階層の再設計

コンベヤーの廃止、ホースホルダーの右側移動、ボトル構成のシンプル化（1枚化）に伴い、シーン構造を以下のように再定義する。


```
GameScreen
├── bgWood: TilingSprite          ← 木目の作業台（画面下部のグレーの矩形を置き換え）
├── bgPanels: Graphics            ← 背景全体の暗いパネル（薄い単色）
├── gaugeTrough: Sprite           ← ゲージ枠（上部中央に固定）
│
├── bottleContainer: Container    ← 中央の固定位置に配置（ステップ1でビン出現）
│   ├── beerFillSprite: Sprite    ← mask で液面クリップ
│   ├── beerFillMask: Graphics    ← 毎フレーム高さを更新
│   ├── beerFoam: Sprite          ← 液面の高さに合わせて y 座標を同期
│   ├── bottle: Sprite            ← 半透明ガラスボトル（最前面にオーバーレイ）
│   └── crownCap: Sprite          ← visible toggle（Wキー/Spaceキー処理用）
│
├── beerArc: Graphics             ← 物理弧（ノズル先端からボトル口への放物線、現状維持）
│
├── hoseHolder: Sprite            ← 画面右側の固定位置（スタート・帰還地点）
├── hoseTube: TilingSprite        ← 右壁（ホルダー）〜ノズル（hoseGrip）間をタイリング結合
├── hoseGrip: Sprite              ← プレイヤーのマウスドラッグ（左右）に追従
│
├── gaugeNeedle: Sprite           ← currentForce（ビールの勢い）で回転またはx座標更新
├── hitSurface: Graphics          ← 当たり判定用（変更なし）
└── Text × 2                     ← メッセージ、右下のBOTTLESカウント（変更なし）
```

---

## ビール液面のマスク実装

`fillAmount`（0.0 〜 1.0）に応じて、ボトルの内径（横幅約128px）に合わせて毎フレームマスクの矩形形状を更新する。

```typescript
// 初期化時
this.beerFillMask = new Graphics();
this.beerFillSprite.mask = this.beerFillMask;
this.beerFoam.mask = this.beerFillMask; // 泡も同時にマスク内に収める
this.bottleContainer.addChild(this.beerFillMask);

// drawBottle() 内（毎フレーム呼び出し）
const BOTTLE_INNER_W = 128;
const BOTTLE_MAX_H = 420; // ボトルの胴体〜首下までの最大液面高さ
const fh = BOTTLE_MAX_H * this.fillAmount;

this.beerFillMask.clear()
  .rect(-BOTTLE_INNER_W / 2, -fh, BOTTLE_INNER_W, fh)
  .fill(0xffffff);

// 泡のスプライト位置も液面のトップに合わせてリアルタイム移動
this.beerFoam.y = -fh;
```

---

## アセットバンドル設定

`raw-assets/game{m}/` ディレクトリを作成し、新設計のアセット画像をすべて格納する。

```typescript
// GameScreen.ts
public static assetBundles: string[] = ['game'];
```

AssetPack が `src/manifest.json` に `game` バンドルを自動追記するため、その他のパイプライン設定変更は不要。

---

## 段階的移行ステップ

1. **環境準備**: `raw-assets/game{m}/` を作成し、AIで生成したアセット画像を配置。
2. **ボトル・液体レイヤーの実装**: 1枚の半透明 `bottle.png` の裏で `beer_fill.png` がマスク制御で綺麗に上昇することを確認（視覚的効果が最も高い部分）。
3. **背景・作業台の配置**: 木目 `bg_wood.png` を TilingSprite で適用し、PoCのベタ塗り感を無くす。
4. **右側ホース系の実装**: ホースホルダーを右に配置し、ノズルをドラッグした際に `hose_tube.png` が右壁から綺麗に伸び縮みして追従するようロジックを変更。
5. **UI・ゲージの結合**: 上部の FLOW RATE ゲージをスプライト化し、プログラムの乱数（勢いの変動）と針の動きを同期。
