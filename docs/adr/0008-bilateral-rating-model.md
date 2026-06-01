# ADR-0008：雙向評價採「立即、不可竄改」模型,以 HSETNX + 執行中聚合實作

- 狀態（Status）：Accepted
- 日期：2026-05-31
- 決策者：後端
- 對應 Story：AG-007（雙向評價）

## 背景（Context）

訂單 COMPLETED 後,訂餐者與帶餐者**互相**給 1–5 星。AC 要求:只有 COMPLETED 可評、星等 1–5、每位使用者對同一單**只能評一次**、評後**不可修改**、**只有兩位參與者**可評;另需提供**每位使用者的聚合評分**(平均 + 次數)供顯示。

需決定:(1) 是否採 Airbnb 式「雙盲」(雙方都評完才互相揭露)以防報復偏差;(2) 用什麼 Redis 結構保證「一單一人一次、不可改」與聚合。

## 決策（Decision）

1. **立即顯示(non-double-blind),不做雙盲。**
   送出即計入對方平均分。校園場景為高信任、低詐欺的小群體,雙盲的 pending 狀態/揭露觸發/視窗計時等複雜度,對 MVP 不划算。

2. **每張單一個 Hash 存評價,用 `HSETNX` 當「一次性 + 不可改」守衛。**
   ```
   HSETNX rating:order:{order_id} {rater_user_id} <json{stars,ratee,ts}>
   ```
   `HSETNX` 只在該 rater 首次寫入時回 1,重複回 0——一個原子操作同時達成「一單一人一次」與「不可竄改」,**不需額外鎖**。

3. **被評者聚合用執行中加總(running aggregate)。**
   ```
   HINCRBY      user:{ratee}:rating count 1
   HINCRBYFLOAT user:{ratee}:rating sum   {stars}
   平均 = sum / count
   ```
   讀取(顯示個人頁)為 O(1),不需每次掃描重算。

4. **把守衛與聚合包進一支 Lua 腳本,確保原子。**
   ```lua
   if redis.call('HSETNX', KEYS[1], ARGV[1], ARGV[2]) == 1 then
       redis.call('HINCRBY', KEYS[2], 'count', 1)
       redis.call('HINCRBYFLOAT', KEYS[2], 'sum', ARGV[3])
       return 1
   else return 0 end
   ```
   避免「守衛成功但聚合更新前當機」造成漏計或重複計。

5. **角色/狀態檢查在服務層**:非 COMPLETED→409、非參與者→403、星等不在 1–5→422(Pydantic `ge=1, le=5`)、重複評價→409。被評者(ratee)由訂單另一方推導,呼叫端不需自行帶入。

## 替代方案（Alternatives）

- **Airbnb 雙盲 + 14 天視窗**:防報復偏差,但需 pending 狀態與揭露機制。對校園 MVP 屬 over-engineering。否決(保留未來低成本作法:評價先隱藏,待 `HLEN rating:order:{id} == 2` 才互相揭露)。
- **每次讀取時重算平均(掃描所有評價)**:讀重寫輕,但個人頁顯示頻繁,O(n) 不划算。否決(改用執行中聚合)。
- **用分散式鎖保護評價寫入**:`HSETNX` 本身即原子守衛,不需鎖。否決。

## 後果（Consequences）

- ✅ 一個 `HSETNX` 同時滿足「一次性 + 不可改」;Lua 讓「守衛 + 聚合」原子化。
- ✅ 聚合讀取 O(1),適合個人頁顯示。
- ✅ 不需鎖,寫入路徑簡單。
- ⚠️ 「跳過雙盲」是基於場景的**判斷**,調研中 Airbnb/Uber 的雙盲描述未通過一手來源查證——若日後出現報復性評價,再評估上述低成本雙盲作法。
- ⚠️ 因評價不可改(immutable),聚合採「只增不減」;若未來要支援刪改評價,需改為可重算或維護可回退的聚合(目前 AC 明訂不可改,故可接受)。
- ⚠️ 聚合 `sum` 以 `HINCRBYFLOAT` 儲存為浮點字串,顯示時 `round(sum/count, 2)`;星等為整數,精度風險可忽略。
