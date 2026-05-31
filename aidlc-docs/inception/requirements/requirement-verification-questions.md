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

---

---
# 要件確認質問（Change Request Cycle 2）

以下の質問に回答してください。各質問の `[Answer]:` タグの後に選択肢の文字（A、B、C...）を入力してください。  
いずれの選択肢も合わない場合は「X」を選び、[Answer]: の後に説明を追記してください。

---

## Question 5
ビールが左に向かって出る際の「放射状」とはどのようなイメージですか？

A) 単一の斜めストリーム（1本の流れが左斜め方向に固定されており、現在と同様にdrift振動が乗る）
B) 扇形スプレー（複数の短いセグメントが扇状に広がって描画される、より視覚的に派手な演出）
C) どちらでも構わない（実装しやすい方で良い）
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
「出る勢いの下限と上限」のパラメータは何を制御すべきですか？

現在のビームの着地点は `hoseX + drift` です。  
左への基本オフセット（ベースアングル）を `BEER_FORCE_MIN`〜`BEER_FORCE_MAX` の範囲で定義する想定ですが、具体的にどれが意図に合いますか？

A) 着地点の左オフセット量（px）の最小・最大（例: MIN=-20px, MAX=-80px → 常に20〜80px左に着地）
B) 初速の最小・最大（force = px/sec の水平成分。落下距離に比例してオフセットが増える放物線的な動き）
C) 振動（drift）の振幅の最小・最大（現在の drift 振動の中心を左にずらし、その振れ幅の範囲をMIN/MAXで定義）
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 7
既存のdrift振動（`sin`波による左右の揺れ）は変更後も残しますか？

A) 残す（新しいベース角度に対して、さらにdrift振動が重なる。現状の揺れ感を維持しつつ左方向にシフト）
B) drift振動をなくす or 大幅に縮小して、よりシンプルな動きにする
C) どちらでも構わない
X) Other (please describe after [Answer]: tag below)

[Answer]: X Q6で設定する初速の最小と最大の値によってのみ揺れを表現してほしいです

---

## Question 8
Change 2（FULL状態でのpointerup自動戻し）の実装後、以下の視覚エフェクトはどうしますか？

現在: FULL状態でホルダー近くに戻したときに黄色の点滅リングと緑のスナップグローが表示されます。  
新しい動作ではホルダー位置に戻す必要がなくなるため、これらのエフェクトは不要になります。

A) 削除する（エフェクト自体が不要になるので削除）
B) 残す（FULL状態の間、常に視覚フィードバックとして表示し続ける）
C) どちらでも構わない
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
Change 2の後、FULL状態での指示テキスト（現在: "Bottle full!  Return hose to holder  →"）はどう変更しますか？

A) "Bottle full!  Release to continue!" に変更する
B) "Bottle full！リリースで次へ！" に変更する（日本語）
C) テキストは削除する（満杯メッセージ "満杯！" だけで十分）
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

回答が完了したら「done」とお知らせください。
