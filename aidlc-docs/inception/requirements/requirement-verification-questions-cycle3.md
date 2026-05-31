# Requirements Clarification Questions — Cycle 3

## 背景
ビールの初速をランダムに変化させる仕様変更に関する確認事項です。

---

## Question 1
初速が新しい値に変わる際の遷移スタイルはどのようにしますか？

A) 瞬間的にジャンプ — 新しい値に即座に切り替わる（より予測しにくいが、見た目は唐突）
B) スムーズな補間（lerp） — 現在の値から新しい目標値へ徐々に移行する（ビールの流れが自然に変わる）
C) Other (please describe after [Answer]: tag below)

[Answer]: C lerpで徐々に移行させてください。その補間速度はパラメータとしてスタティックな変数で定義してあとで調整できるようにしてください。

---

