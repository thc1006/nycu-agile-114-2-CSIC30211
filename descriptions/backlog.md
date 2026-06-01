# CampusEats Product Backlog

**文件版本：** v2.0  
**建立日期：** 2026-05-24  
**修訂日期：** 2026-05-25  
**負責角色：** PM / Scrum Master  
**專案範圍：** CampusEats MVP，Sprint 0–4  
**狀態：** Draft  

---

## 1. 文件目的

本文件用來整理 CampusEats MVP 的 Product Backlog，作為 Sprint Planning、Sprint Review、Acceptance Criteria 驗收與期末報告整理的依據。

本 Backlog 依據以下文件整理：

1. `initial-spec.md`
2. `mvp-impact-map.md`
3. `user-journey-map.md`
4. `story-map-sprint-slicing.md`
5. 原始 `backlog.md`

本版本將原本 Sprint 1–2 的 Backlog 擴充為 Sprint 0–4，並補上：

- Priority
- Sprint
- Estimate
- Status
- Acceptance Criteria
- Demo 驗收重點

---

## 2. Backlog 管理原則

### 2.1 優先順序原則

Product Backlog 依以下原則排序：

1. 優先完成能支撐 MVP 交易閉環的 Story
2. 優先完成可在 Sprint Review 中展示的功能
3. 優先完成風險較高、會影響後續功能的 Story
4. P0 必須優先於 P1 / P2
5. 若 Sprint 時間不足，優先保留「發單 → 接單 → 狀態更新 → 確認收餐」流程

---

## 3. Priority 定義

| Priority | 定義 | 處理方式 |
|---|---|---|
| P0 | MVP 必要功能，沒有它無法完成核心流程 | 必做 |
| P1 | 強化 MVP 體驗或信任機制，但不一定阻斷核心流程 | 優先做，若時間不足可延後 |
| P2 | 體驗優化、通知、紀錄、非核心功能 | Optional |
| Future | 後續版本功能，不列入本次期末 MVP | 不做 |

---

## 4. Estimate 定義

本專案初期採用簡化估算方式。

| Estimate | 說明 |
|---|---|
| S | 小型 Story，預期 1 人可在 1–2 天內完成 |
| M | 中型 Story，需要前後端協作，約 2–4 天 |
| L | 大型 Story，涉及多頁面、狀態或較多例外處理，需要拆小 |
| XL | 過大，不應直接進 Sprint，需要拆分 |

---

## 5. Status 定義

| Status | 說明 |
|---|---|
| Todo | 尚未開始 |
| Ready | AC 清楚，可進 Sprint Planning |
| In Progress | 開發中 |
| Review | 等待 PM / PO 驗收 |
| Done | 符合 AC，已可展示 |
| Blocked | 被技術、需求或協作問題阻塞 |
| Deferred | 延後處理 |

---

## 6. Product Backlog 總覽

| ID | Story | Priority | Sprint | Estimate | Status |
|---|---|---|---|---|---|
| AG-000 | Project Setup / 產品探索文件整理 | P0 | Sprint 0 | M | In Progress |
| AG-001 | Email 註冊與登入 | P0 | Sprint 1 | M | Todo |
| AG-002 | 發布訂單 | P0 | Sprint 1 | M | Todo |
| AG-003 | 瀏覽待接訂單列表 | P0 | Sprint 1 | S | Todo |
| AG-004 | 接單 | P0 | Sprint 2 | M | Todo |
| AG-005 | 更新訂單狀態 | P0 | Sprint 2–3 | M | Todo |
| AG-006 | 確認收餐 | P0 | Sprint 3 | S | Todo |
| AG-007 | 雙向評價 | P1 | Sprint 3 | M | Todo |
| AG-008 | 取消訂單 | P1 | Sprint 4 | S | Todo |
| AG-009 | Email / 站內通知 | P2 | Sprint 4 | M | Optional |
| AG-010 | 歷史訂單紀錄 | P2 | Sprint 4 | S | Optional |
| AG-011 | UI / Bug Fix | P0 | Sprint 4 | M | Todo |
| AG-012 | Demo Seed Data | P0 | Sprint 4 | S | Todo |

---

# 7. Sprint 0 Backlog：產品探索與開發準備

## AG-000 Project Setup / 產品探索文件整理

**Priority：** P0  
**Sprint：** Sprint 0  
**Estimate：** M  
**Status：** In Progress  

### User Story

身為 PM / Scrum Master，  
我想要整理專案方向文件與 Sprint 規劃，  
以便團隊能在開發前對產品目標、MVP 範圍與開發順序有共識。

### Acceptance Criteria

```gherkin
Scenario: 完成產品探索文件
Given 團隊準備開始開發 CampusEats
When PM 完成 Project Brief、Impact Map、User Journey Map、Story Map 與 Product Backlog
Then 團隊可以根據這些文件進行 Sprint Planning

Scenario: 記錄需求疑問
Given 團隊檢視 Sprint 1 的內容
When 團隊成員對 Story 範圍或 AC 有疑問
Then PM / Scrum Master 需要記錄問題並在 Planning 前釐清
```

### Demo / Review 重點

- 能說明產品問題與 MVP 範圍
- 能展示 Story Map 與 Sprint Slicing
- 能說明 Sprint 1 要做哪些 Story

---

# 8. Sprint 1 Backlog：登入、發單、待接列表

## AG-001 Email 註冊與登入

**Priority：** P0  
**Sprint：** Sprint 1  
**Estimate：** M  
**Status：** Todo  

### User Story

身為訂餐者或帶餐者，  
我想要用 Email 註冊並登入，  
以便使用 CampusEats 平台。

### Acceptance Criteria

```gherkin
Scenario: 新使用者成功註冊
Given 我是新使用者
When 我輸入有效 Email 和密碼完成註冊
Then 系統建立我的帳號
And 我可以用該帳號登入平台

Scenario: 已註冊使用者成功登入
Given 我已完成註冊
When 我輸入正確 Email 和密碼
Then 我可以進入平台首頁

Scenario: 使用者登出
Given 我已登入
When 我點擊登出
Then 我會回到登入頁
And 我無法在未登入狀態下直接進入平台主要頁面

Scenario: 登入失敗
Given 我輸入不存在的 Email 或錯誤密碼
When 我送出登入表單
Then 系統顯示登入失敗訊息
And 我仍停留在登入頁
```

### Demo / Review 重點

- 可註冊
- 可登入
- 可登出
- 未登入不可進入主要頁面

---

## AG-002 發布訂單

**Priority：** P0  
**Sprint：** Sprint 1  
**Estimate：** M  
**Status：** Todo  

### User Story

身為訂餐者，  
我想要發布餐點需求訂單，  
以便讓帶餐者知道我需要什麼餐點、送到哪裡，以及我願意支付多少帶餐費。

### Acceptance Criteria

```gherkin
Scenario: 成功發布訂單
Given 我已登入
When 我填寫餐廳、餐點內容、取餐地點、期望時間、帶餐費並送出
Then 系統建立一筆新訂單
And 訂單狀態為「待接單」
And 該訂單會出現在待接訂單列表

Scenario: 必填欄位未填
Given 我已登入
When 我未填寫餐廳、餐點內容、取餐地點、期望時間或帶餐費任一必填欄位
And 我送出訂單
Then 系統提示錯誤
And 不建立訂單

Scenario: 帶餐費格式錯誤
Given 我已登入
When 我輸入非數字或小於 0 的帶餐費
Then 系統提示帶餐費格式錯誤
And 不允許送出訂單

Scenario: 發布後可在列表看到
Given 我成功發布一筆訂單
When 帶餐者進入待接訂單列表
Then 帶餐者可以看到該訂單的餐廳、餐點摘要、取餐地點、期望時間與帶餐費
```

### Demo / Review 重點

- 訂餐者可建立訂單
- 表單有基本驗證
- 訂單建立後狀態為「待接單」
- 帶餐者可在列表看到該訂單

---

## AG-003 瀏覽待接訂單列表

**Priority：** P0  
**Sprint：** Sprint 1  
**Estimate：** S  
**Status：** Todo  

### User Story

身為帶餐者，  
我想要瀏覽目前可接的訂單列表，  
以便找到適合我順路帶餐的訂單。

### Acceptance Criteria

```gherkin
Scenario: 顯示待接訂單列表
Given 我已登入
When 我進入訂單列表頁
Then 我可以看到所有狀態為「待接單」的訂單
And 每筆訂單顯示餐廳、餐點摘要、取餐地點、期望時間與帶餐費

Scenario: 不顯示已接單訂單
Given 某筆訂單狀態為「已接單」
When 我進入待接訂單列表
Then 我不應該在待接訂單列表看到該訂單

Scenario: 訂單排序
Given 訂單列表有多筆待接訂單
When 頁面載入
Then 系統預設以期望時間由近到遠排序

Scenario: 沒有待接訂單
Given 目前沒有任何待接訂單
When 我進入訂單列表頁
Then 系統顯示「目前沒有可接訂單」的提示
```

### Demo / Review 重點

- 帶餐者可看到待接訂單
- 已接單或已完成訂單不出現在待接列表
- 列表資訊足以支援接單判斷

---

# 9. Sprint 2 Backlog：接單與初步狀態更新

## AG-004 接單

**Priority：** P0  
**Sprint：** Sprint 2  
**Estimate：** M  
**Status：** Todo  

### User Story

身為帶餐者，  
我想要接下某一筆待接訂單，  
以便確認我會負責這筆帶餐需求。

### Acceptance Criteria

```gherkin
Scenario: 成功接單
Given 我是已登入的帶餐者
And 我在訂單列表看到一筆待接訂單
When 我點擊「接單」
Then 訂單狀態變為「已接單」
And 訂單記錄接單者為我
And 該訂單不再出現在其他帶餐者的待接訂單列表

Scenario: 訂單已被其他人接走
Given 某筆訂單已被其他帶餐者接走
When 我嘗試接該筆訂單
Then 系統提示該訂單已被接
And 我無法接單

Scenario: 訂餐者不能接自己的訂單
Given 我是某筆訂單的建立者
When 我嘗試接自己的訂單
Then 系統不允許接單
And 顯示錯誤提示

Scenario: 接單後可查看完整訂單資訊
Given 我成功接下一筆訂單
When 我進入訂單詳情頁
Then 我可以看到完整餐點內容、取餐地點、期望時間與帶餐費
```

### Demo / Review 重點

- 帶餐者可接單
- 接單後狀態變為「已接單」
- 防止重複接單
- 防止訂餐者接自己的單

---

## AG-005 更新訂單狀態

**Priority：** P0  
**Sprint：** Sprint 2–3  
**Estimate：** M  
**Status：** Todo  

### User Story

身為帶餐者，  
我想要更新訂單狀態，  
以便讓訂餐者知道目前餐點購買與送達進度。

### Acceptance Criteria

```gherkin
Scenario: 更新為購買中
Given 我已成功接下一筆訂單
And 訂單狀態為「已接單」
When 我點擊「開始購買」
Then 訂單狀態變為「購買中」

Scenario: 更新為已送達
Given 我是該訂單的接單者
And 訂單狀態為「購買中」
When 我點擊「已送達」
Then 訂單狀態變為「已送達」

Scenario: 只有接單者可以更新狀態
Given 我不是該訂單的接單者
When 我嘗試更新訂單狀態
Then 系統不允許我更新狀態

Scenario: 狀態不可跳躍
Given 訂單狀態為「已接單」
When 我嘗試直接將狀態改為「已送達」
Then 系統不允許此操作
And 顯示狀態流程錯誤提示

Scenario: 訂餐者可看到狀態變化
Given 帶餐者更新訂單狀態
When 訂餐者查看訂單詳情頁
Then 訂餐者可以看到最新訂單狀態
```

### Demo / Review 重點

- 已接單 → 購買中
- 購買中 → 已送達
- 訂餐者可看到狀態變化
- 狀態不可亂跳
- 非接單者不可更新

---

# 10. Sprint 3 Backlog：完成交易與評價

## AG-006 確認收餐

**Priority：** P0  
**Sprint：** Sprint 3  
**Estimate：** S  
**Status：** Todo  

### User Story

身為訂餐者，  
我想要在收到餐點後確認收餐，  
以便完成這筆交易。

### Acceptance Criteria

```gherkin
Scenario: 訂餐者成功確認收餐
Given 我是該訂單的訂餐者
And 訂單狀態為「已送達」
When 我點擊「確認收餐」
Then 訂單狀態變為「已完成」

Scenario: 只有訂餐者可以確認收餐
Given 我不是該訂單的訂餐者
When 我嘗試點擊「確認收餐」
Then 系統不允許我確認收餐

Scenario: 未送達訂單不可確認收餐
Given 訂單狀態不是「已送達」
When 訂餐者嘗試確認收餐
Then 系統不允許確認收餐
And 顯示「訂單尚未送達」提示

Scenario: 已完成訂單出現在紀錄中
Given 訂單狀態為「已完成」
When 我查看我的訂單紀錄
Then 我可以看到這筆已完成的訂單
```

### Demo / Review 重點

- 訂餐者能確認收餐
- 訂單變成已完成
- 未送達不能確認
- 只有訂餐者能確認

---

## AG-007 雙向評價

**Priority：** P1  
**Sprint：** Sprint 3  
**Estimate：** M  
**Status：** Todo  

### User Story

身為訂餐者與帶餐者，  
我想要在交易完成後互相評價，  
以便建立平台的基本信任機制。

### Acceptance Criteria

```gherkin
Scenario: 訂餐者評價帶餐者
Given 我是該訂單的訂餐者
And 訂單狀態為「已完成」
When 我給帶餐者 1–5 星評分並送出
Then 系統儲存我的評價

Scenario: 帶餐者評價訂餐者
Given 我是該訂單的帶餐者
And 訂單狀態為「已完成」
When 我給訂餐者 1–5 星評分並送出
Then 系統儲存我的評價

Scenario: 未完成訂單不可評價
Given 訂單狀態不是「已完成」
When 使用者嘗試評價
Then 系統不允許評價

Scenario: 評價星等範圍限制
Given 我正在評價
When 我輸入小於 1 或大於 5 的星等
Then 系統提示評分必須介於 1 到 5 之間

Scenario: 評價送出後不可修改
Given 我已送出評價
When 我再次查看該訂單
Then 我可以看到已送出的評價
And 系統不允許我修改評價
```

### Demo / Review 重點

- 訂餐者可評價帶餐者
- 帶餐者可評價訂餐者
- 只有完成訂單可評價
- 評價不可修改

---

# 11. Sprint 4 Backlog：例外流程、通知與展示準備

## AG-008 取消訂單

**Priority：** P1  
**Sprint：** Sprint 4  
**Estimate：** S  
**Status：** Todo  

### User Story

身為訂餐者，  
我想要取消尚未被接的訂單，  
以便在不再需要餐點時撤回需求。

### Acceptance Criteria

```gherkin
Scenario: 取消待接單
Given 我是訂單建立者
And 訂單狀態為「待接單」
When 我點擊「取消訂單」
Then 訂單狀態變為「已取消」
And 該訂單不再出現在待接訂單列表

Scenario: 已接單不可取消
Given 我是訂單建立者
And 訂單狀態為「已接單」或之後
When 我嘗試取消訂單
Then 系統不允許取消
And 顯示「訂單已被接單，無法取消」提示

Scenario: 非訂單建立者不可取消
Given 我不是該訂單的建立者
When 我嘗試取消該訂單
Then 系統不允許取消
```

### Demo / Review 重點

- 待接單可取消
- 已接單不可取消
- 取消後列表不再顯示

---

## AG-009 Email / 站內通知

**Priority：** P2  
**Sprint：** Sprint 4  
**Estimate：** M  
**Status：** Optional  

### User Story

身為使用者，  
我想要在訂單狀態變更時收到通知，  
以便即時掌握訂單進度。

### Acceptance Criteria

```gherkin
Scenario: 訂單被接單時通知訂餐者
Given 我的訂單狀態從「待接單」變為「已接單」
When 系統更新訂單狀態
Then 我收到通知

Scenario: 訂單進入購買中時通知訂餐者
Given 訂單狀態從「已接單」變為「購買中」
When 系統更新訂單狀態
Then 訂餐者收到通知

Scenario: 訂單已送達時通知訂餐者
Given 訂單狀態從「購買中」變為「已送達」
When 系統更新訂單狀態
Then 訂餐者收到通知

Scenario: 接單成功時通知帶餐者
Given 帶餐者成功接單
When 系統更新訂單狀態
Then 帶餐者收到接單成功通知
```

### 備註

若 Email 實作成本過高，Sprint 4 可改為「站內通知」或「頁面提示」，保留相同驗收邏輯。

---

## AG-010 歷史訂單紀錄

**Priority：** P2  
**Sprint：** Sprint 4  
**Estimate：** S  
**Status：** Optional  

### User Story

身為使用者，  
我想要查看自己的歷史訂單，  
以便確認過去建立、接單或完成的交易紀錄。

### Acceptance Criteria

```gherkin
Scenario: 訂餐者查看自己建立的訂單
Given 我是訂餐者
When 我進入我的訂單頁
Then 我可以看到自己建立過的訂單

Scenario: 帶餐者查看自己接過的訂單
Given 我是帶餐者
When 我進入我的接單紀錄頁
Then 我可以看到自己接過的訂單

Scenario: 歷史訂單顯示狀態
Given 我有多筆歷史訂單
When 我查看訂單紀錄
Then 每筆訂單會顯示目前狀態
```

---

## AG-011 UI / Bug Fix

**Priority：** P0  
**Sprint：** Sprint 4  
**Estimate：** M  
**Status：** Todo  

### User Story

身為團隊成員，  
我想要修正 Sprint Review 中發現的 UI、流程與阻斷性錯誤，  
以便期末展示時能穩定完成 Demo。

### Acceptance Criteria

```gherkin
Scenario: 修正阻斷性錯誤
Given Sprint Review 發現某錯誤會阻止完整 Demo 流程
When 團隊修正該錯誤
Then Demo 流程可以繼續執行

Scenario: 修正流程不清楚問題
Given 測試者表示某操作按鈕或狀態不清楚
When 團隊調整 UI 文案或流程
Then 測試者能理解下一步操作

Scenario: 完整 Demo Flow 可重跑
Given 使用測試帳號登入
When 團隊依照 Demo Script 操作
Then 可以完整跑完「發單 → 接單 → 狀態更新 → 確認收餐 → 評價」
```

---

## AG-012 Demo Seed Data

**Priority：** P0  
**Sprint：** Sprint 4  
**Estimate：** S  
**Status：** Todo  

### User Story

身為 PM / Scrum Master，  
我想要準備展示用測試帳號與測試資料，  
以便期末展示時能穩定呈現完整流程。

### Acceptance Criteria

```gherkin
Scenario: 準備訂餐者測試帳號
Given 期末展示需要操作訂餐者流程
When 使用訂餐者測試帳號登入
Then 可以成功進入平台並建立訂單

Scenario: 準備帶餐者測試帳號
Given 期末展示需要操作帶餐者流程
When 使用帶餐者測試帳號登入
Then 可以成功進入平台並接單

Scenario: 準備展示訂單
Given Demo 需要穩定展示
When 測試資料建立完成
Then 系統中至少有一筆可用於展示的待接訂單

Scenario: Demo 可重複執行
Given Demo 流程已跑完一次
When 團隊需要重新展示
Then 可以透過重置資料或建立新訂單再次執行流程
```

---

# 12. Sprint Backlog 建議切分

## Sprint 1 建議 Sprint Backlog

| ID | Story | Priority |
|---|---|---|
| AG-001 | Email 註冊與登入 | P0 |
| AG-002 | 發布訂單 | P0 |
| AG-003 | 瀏覽待接訂單列表 | P0 |

### Sprint 1 Goal

讓使用者能登入，訂餐者能建立訂單，帶餐者能看到待接訂單。

---

## Sprint 2 建議 Sprint Backlog

| ID | Story | Priority |
|---|---|---|
| AG-004 | 接單 | P0 |
| AG-005-1 | 更新狀態：已接單 / 購買中 | P0 |
| AG-003-1 | 列表排除已接單訂單 | P1 |

### Sprint 2 Goal

讓帶餐者能接單，並讓訂餐者看到訂單狀態開始變化。

---

## Sprint 3 建議 Sprint Backlog

| ID | Story | Priority |
|---|---|---|
| AG-005-2 | 更新狀態：已送達 | P0 |
| AG-006 | 確認收餐 | P0 |
| AG-007 | 雙向評價 | P1 |

### Sprint 3 Goal

完成從接單到完成交易與評價的核心閉環。

---

## Sprint 4 建議 Sprint Backlog

| ID | Story | Priority |
|---|---|---|
| AG-008 | 取消訂單 | P1 |
| AG-011 | UI / Bug Fix | P0 |
| AG-012 | Demo Seed Data | P0 |
| AG-009 | Email / 站內通知 | P2 |
| AG-010 | 歷史訂單紀錄 | P2 |

### Sprint 4 Goal

處理基本例外流程、修正問題，並完成期末展示準備。

---

# 13. MVP 最小必做範圍

若時間不足，最少必須完成以下 Story：

| ID | Story | 原因 |
|---|---|---|
| AG-001 | Email 註冊與登入 | 需要基本身份 |
| AG-002 | 發布訂單 | 沒有訂單就沒有媒合 |
| AG-003 | 瀏覽待接訂單列表 | 帶餐者需要找到訂單 |
| AG-004 | 接單 | 媒合成立的關鍵 |
| AG-005 | 更新訂單狀態 | 讓交易流程可追蹤 |
| AG-006 | 確認收餐 | 定義交易完成 |

AG-007 雙向評價建議盡量完成，因為它對應本專案的「信任機制」。  
AG-008 之後的 Story 可視時間延後。

---

# 14. Backlog 結論

本 Product Backlog 以 CampusEats 的 MVP 交易閉環為核心。

開發順序應為：

1. 先建立身份與訂單資料流
2. 再完成帶餐者接單
3. 接著完成狀態更新
4. 最後完成收餐確認與評價
5. Sprint 4 處理修正、展示資料與基本例外流程

後續每次 Sprint Review 後，PM / Scrum Master 應根據回饋更新 Backlog 的 Priority、Status 與 AC。