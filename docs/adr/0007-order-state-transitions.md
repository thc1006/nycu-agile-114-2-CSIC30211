# ADR-0007：訂單狀態轉移以動作端點 + 手寫狀態機實作,並以 Lua 原子釋放鎖

- 狀態（Status）：Accepted
- 日期：2026-05-31
- 決策者：後端
- 對應 Story：AG-005（更新訂單狀態）、AG-006（確認收餐）

## 背景（Context）

訂單生命週期為**固定、單向、不可跳關**的有限狀態機：

```
OPEN → ACCEPTED → BUYING → DELIVERED → COMPLETED
（CANCELLED 僅能由 OPEN 進入,屬 AG-008,本 ADR 不含）
```

AC 要求:轉移順序固定、不可跳關(如 ACCEPTED→DELIVERED 須拒絕);`start`/`deliver` 只有**帶餐者(runner,接單者)**可操作;`confirm`(確認收餐)只有**訂餐者(orderer)**可操作;終態(COMPLETED/CANCELLED)不可再更新。需要決定:(1) 用什麼 HTTP 形狀表達狀態轉移、(2) 用什麼方式實作狀態機、(3) 並發下如何安全。

## 決策（Decision）

1. **動作端點(action endpoints),不用 PATCH 帶目標狀態。**
   每個轉移是一個 `POST` 子資源,沿用既有 `POST /orders/{id}/accept` 的 path-segment 風格:
   - `POST /orders/{id}/start`(runner;ACCEPTED→BUYING)
   - `POST /orders/{id}/deliver`(runner;BUYING→DELIVERED)
   - `POST /orders/{id}/confirm`(orderer;DELIVERED→COMPLETED,AG-006)

2. **手寫轉移表(transition table),不引入狀態機套件。**
   `services/order_service.py` 內一張 `TRANSITIONS = {action: {from, to, actor}}` 表,搭配單一泛用 `transition(order_id, action, user_id)`。6 個狀態、單向、角色守衛——手寫即足夠,且能完全掌控 HTTPException 狀態碼。

3. **檢查順序:404 →（狀態 409）→（角色 403）。**
   先檢查狀態(非法/跳關/終態→409),再檢查角色(非指定角色/非參與者→403)。
   先查狀態的好處:當 `start`/`deliver` 通過狀態檢查時,訂單必已 ACCEPTED/BUYING,`runner_id` 必已設定,角色比對才有意義(避免對 OPEN 單比對 `runner_id=None` 誤判)。

4. **並發:沿用既有悲觀鎖,並改用 Lua 原子釋放。**
   所有改狀態的操作(accept + 三個轉移)共用 `SET lock:order:{id} <unique-value> NX EX 5`;搶不到→409;鎖內重讀狀態後才寫入;`finally` 以 **Lua compare-and-delete** 釋放:
   ```lua
   if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end
   ```
   這同時**修正 ADR-0005 自承的「GET-then-DELETE 釋放非原子」技術債**(accept 一併受惠)。

## 替代方案（Alternatives）

- **PATCH /orders/{id} 帶 `status` 目標欄位**:語意上把「狀態」當可寫欄位,易被誤用、難表達「動作」與權限。Google AIP-216/136、Zalando #148、Microsoft Azure 指南一致建議**非 CRUD 的狀態機變更走 POST 動作**而非 PATCH。否決。
- **引入 `python-statemachine` / `transitions` 套件**:對 6 個狀態是多餘 ceremony,且 `transitions` 的角色守衛失敗只會讓觸發變 no-op、無法直接回清楚的 403。否決(規模變大時可再評估)。
- **全套樂觀鎖(version 欄位 + Lua/WATCH CAS)**:本規模 overkill;`start/deliver/confirm` 皆為純 status 欄位翻轉、不動二級索引,鎖內重讀即足夠。否決。

## 後果（Consequences）

- ✅ 端點語意清楚、與既有 `accept` 一致;狀態碼明確(409 非法轉移/409 鎖爭用、403 角色不符、404 不存在)。
- ✅ 狀態機集中在一張表 + 一個方法,易讀、易測(已參數化測試合法/非法/角色/終態)。
- ✅ Lua 原子釋放修掉 ADR-0005 的鎖釋放競態。
- ⚠️ HTTP 409「非法轉移」的依據是 RFC-9110 社群共識 + Azure 的 409-for-conflict,**非**來自單一無爭議的一手規範(調研中「AIP-216 規定非法轉移→409」這條未通過對抗式查證)。
- ⚠️ 重複呼叫(如連點兩次 `start`)第二次回 409 而非 200 冪等——對 MVP 可接受;若要嚴格冪等,可在「目標狀態已達成」時短路回 200(未實作)。
- ⚠️ 動作端點數量隨狀態增加而線性成長(本次三個);若未來狀態爆炸,再評估狀態機套件。

> 分支拓樸註記:本 ADR 與程式碼同在 `backend` 分支線;既有 ADR-0001~0006 目前在 `docs/backend-adr` 分支。待兩條線併入 `main` 時,應將 ADR-0005 的狀態欄補上「鎖釋放競態已由 ADR-0007 解決」,並合併 ADR 索引。
