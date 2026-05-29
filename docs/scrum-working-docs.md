# CampusEats Definition of Done & Sprint Meeting Templates

**文件版本：** v1.0  
**負責角色：** PM / Scrum Master  
**適用範圍：** CampusEats MVP，Sprint 0–4  
**狀態：** Draft  

---

## 1. 文件目的

本文件用來定義 CampusEats 專案中「完成」的標準，以及每個 Sprint 需要記錄的會議內容。

本文件主要用途：

1. 定義 User Story 怎樣才算 Done
2. 定義 Sprint 怎樣才算完成
3. 提供 Sprint Planning、Sprint Review、Sprint Retrospective 的紀錄模板
4. 支援期末專案影片與報告整理
5. 幫助 PM / Scrum Master 追蹤團隊是否持續改善

---

## 2. Scrum 文件與影片要求對應

本專案期末需要保留連續三個 Sprint 的會議紀錄與影片。

| Sprint | Sprint Planning | Sprint Review | Sprint Retrospective |
|---|---|---|---|
| Sprint 1 | 需紀錄 / 錄影 | 需紀錄 / 錄影 | 需紀錄 / 錄影 |
| Sprint 2 | 需紀錄 / 錄影 | 需紀錄 / 錄影 | 需紀錄 / 錄影 |
| Sprint 3 | 需紀錄 / 錄影 | 需紀錄 / 錄影 | 需紀錄 / 錄影 |
| Sprint 4 | 建議紀錄 | 建議紀錄 | 建議紀錄 |

---

# Part A：Definition of Done

---

## 3. Definition of Done 總覽

Definition of Done，簡稱 DoD，用來定義一個 Story、Sprint 或 Demo 怎樣才算真正完成。

本專案分成三層 DoD：

| 層級 | 說明 |
|---|---|
| Story DoD | 單一 User Story 完成標準 |
| Sprint DoD | 一個 Sprint 完成標準 |
| Demo DoD | 期末展示可接受標準 |

---

## 4. Story Definition of Done

一個 User Story 必須符合以下條件，才可以標記為 Done。

| 檢查項目 | 完成標準 | 是否必須 |
|---|---|---|
| 功能完成 | 功能已依 Story 描述實作 | 必須 |
| 符合 AC | 通過該 Story 的 Acceptance Criteria | 必須 |
| 可操作 | 可在本機或測試環境實際操作 | 必須 |
| 無阻斷性錯誤 | 不會阻止核心流程繼續進行 | 必須 |
| UI 可理解 | 使用者能理解主要操作按鈕與狀態 | 必須 |
| 資料正確 | 新增、更新、查詢資料結果正確 | 必須 |
| 權限合理 | 未登入或非相關使用者不可執行不該做的操作 | 必須 |
| PM 驗收 | PM / Scrum Master 依 AC 檢查通過 | 必須 |
| Demo 可展示 | Sprint Review 可展示此功能 | 建議 |
| 簡單測試紀錄 | 記錄測過哪些主要情境 | 建議 |

---

## 5. Story DoD Checklist

每個 Story 驗收時可使用以下檢查表。

```markdown
## Story DoD Checklist

**Story ID：**  
**Story 名稱：**  
**負責人：**  
**Sprint：**  

| 檢查項目 | 結果 | 備註 |
|---|---|---|
| 功能是否完成？ | Pass / Fail |  |
| 是否符合所有 AC？ | Pass / Fail |  |
| 是否可實際操作？ | Pass / Fail |  |
| 是否沒有阻斷性錯誤？ | Pass / Fail |  |
| UI 是否容易理解？ | Pass / Fail |  |
| 資料新增 / 更新 / 查詢是否正確？ | Pass / Fail |  |
| 權限檢查是否合理？ | Pass / Fail |  |
| PM 是否已驗收？ | Pass / Fail |  |
| 是否可在 Sprint Review 展示？ | Pass / Fail |  |

**驗收結論：** Done / Not Done  
**需要修正項目：**
1. 
2. 
3. 
```

---

## 6. Sprint Definition of Done

一個 Sprint 必須符合以下條件，才算完成。

| 檢查項目 | 完成標準 |
|---|---|
| Sprint Goal 已檢查 | Review 時能說明 Sprint Goal 是否達成 |
| Done Story 已驗收 | 所有標記 Done 的 Story 都符合 Story DoD |
| 未完成項目已處理 | 未完成 Story 回到 Product Backlog 或移入下個 Sprint |
| Sprint Review 已完成 | 團隊已展示可運作功能 |
| Retrospective 已完成 | 團隊已討論做得好的、問題與改善行動 |
| Backlog 已更新 | Product Backlog 的 Status、Priority 或 Sprint 已更新 |
| 影片已保存 | 必要的 Planning / Review / Retro 影片已保存 |
| 會議紀錄已整理 | Planning、Review、Retro 有文字紀錄 |

---

## 7. Demo Definition of Done

期末展示或 Sprint Review Demo 需符合以下條件。

| 檢查項目 | 完成標準 |
|---|---|
| 測試帳號可登入 | 訂餐者與帶餐者帳號可正常登入 |
| Demo 資料可使用 | 可建立或重置展示用訂單 |
| 核心流程可完成 | 可跑完發單、接單、狀態更新、確認收餐 |
| 評價流程可展示 | 若 AG-007 完成，雙方可留下星等評價 |
| 畫面切換穩定 | Demo 過程不需手動修改資料庫才能繼續 |
| 備案已準備 | 若即時操作失敗，有截圖或預錄流程可輔助說明 |

---

# Part B：Definition of Ready

---

## 8. Definition of Ready

Definition of Ready，簡稱 DoR，用來判斷一個 Story 是否已經準備好進入 Sprint Planning。

| 檢查項目 | Ready 標準 |
|---|---|
| Story 描述清楚 | 有明確的「身為…我想要…以便…」 |
| 商業價值清楚 | 團隊知道此 Story 為何重要 |
| AC 初稿完成 | 至少有基本 Acceptance Criteria |
| 依賴關係清楚 | 知道是否依賴其他 Story 或 API |
| 範圍可完成 | 能在一個 Sprint 內完成 |
| 優先順序已標記 | 有 P0 / P1 / P2 |
| Demo 方式可想像 | 團隊知道完成後如何展示 |

---

## 9. Story Ready Checklist

```markdown
## Story Ready Checklist

**Story ID：**  
**Story 名稱：**  

| 檢查項目 | 結果 | 備註 |
|---|---|---|
| Story 描述是否清楚？ | Yes / No |  |
| 為何要做是否清楚？ | Yes / No |  |
| AC 是否已寫好？ | Yes / No |  |
| 是否可在一個 Sprint 內完成？ | Yes / No |  |
| 是否知道需要哪些頁面 / API？ | Yes / No |  |
| 是否有明顯未釐清問題？ | Yes / No |  |
| 是否能在 Review 展示？ | Yes / No |  |

**Ready 結論：** Ready / Not Ready  
**待釐清問題：**
1. 
2. 
3. 
```

---

# Part C：Sprint Meeting Templates

---

## 10. Sprint Planning Template

### 10.1 Sprint Planning 目的

Sprint Planning 用來決定本 Sprint 要達成什麼目標、選入哪些 Stories、如何分工，以及有哪些風險。

---

## Sprint Planning Notes Template

```markdown
# Sprint Planning Notes

**Sprint：** Sprint __  
**日期：**  
**會議時間：**  
**參與者：**  
**主持人：** PM / Scrum Master  
**影片連結：**  

---

## 1. Sprint Goal

本 Sprint 的目標是：

> 

---

## 2. 本 Sprint 選入的 Stories

| ID | Story | Priority | Estimate | 負責人 | 狀態 |
|---|---|---|---|---|---|
|  |  |  |  |  | Todo |
|  |  |  |  |  | Todo |
|  |  |  |  |  | Todo |

---

## 3. 為什麼選這些 Stories？

| Story | 選入原因 |
|---|---|
|  |  |
|  |  |
|  |  |

---

## 4. Acceptance Criteria 檢查

| Story | AC 是否清楚？ | 需要補充的地方 |
|---|---|---|
|  | Yes / No |  |
|  | Yes / No |  |
|  | Yes / No |  |

---

## 5. 任務拆分

| Story | Task | 負責人 | 備註 |
|---|---|---|---|
|  | 前端頁面 |  |  |
|  | 後端 API |  |  |
|  | 資料庫欄位 |  |  |
|  | 測試 / 驗收 |  |  |

---

## 6. 風險與阻礙

| 風險 / 阻礙 | 影響 | 應對方式 | 負責人 |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |

---

## 7. 本 Sprint 預期 Demo Flow

1. 
2. 
3. 
4. 

---

## 8. 會議結論

本 Sprint 承諾完成：

1. 
2. 
3. 

若時間不足，優先保留：

1. 
2. 
3. 
```

---

## 11. Sprint Review Template

### 11.1 Sprint Review 目的

Sprint Review 用來展示本 Sprint 實際完成的產品增量，檢查 Sprint Goal 是否達成，並收集回饋以更新 Backlog。

---

## Sprint Review Notes Template

```markdown
# Sprint Review Notes

**Sprint：** Sprint __  
**日期：**  
**會議時間：**  
**參與者：**  
**主持人：** PM / Scrum Master  
**影片連結：**  

---

## 1. Sprint Goal 回顧

本 Sprint 原目標：

> 

是否達成：

- [ ] 達成
- [ ] 部分達成
- [ ] 未達成

說明：


---

## 2. Demo 內容

| Demo 項目 | 對應 Story | Demo 結果 | 備註 |
|---|---|---|---|
|  |  | Pass / Fail |  |
|  |  | Pass / Fail |  |
|  |  | Pass / Fail |  |

---

## 3. 已完成 Stories

| ID | Story | 是否符合 AC | 是否 Done | 備註 |
|---|---|---|---|---|
|  |  | Yes / No | Done / Not Done |  |
|  |  | Yes / No | Done / Not Done |  |

---

## 4. 未完成 Stories

| ID | Story | 未完成原因 | 後續處理 |
|---|---|---|---|
|  |  |  | 回 Backlog / 移至下 Sprint |
|  |  |  | 回 Backlog / 移至下 Sprint |

---

## 5. 收到的回饋

| 回饋來源 | 回饋內容 | 影響 | 是否加入 Backlog |
|---|---|---|---|
| 老師 / 同學 / 組員 |  | 高 / 中 / 低 | Yes / No |
| 老師 / 同學 / 組員 |  | 高 / 中 / 低 | Yes / No |

---

## 6. Backlog 更新

| 新增 / 修改項目 | 原因 | 優先順序 |
|---|---|---|
|  |  | P0 / P1 / P2 |
|  |  | P0 / P1 / P2 |

---

## 7. Review 結論

本 Sprint 主要完成：

1. 
2. 
3. 

下一 Sprint 需要優先處理：

1. 
2. 
3. 
```

---

## 12. Sprint Retrospective Template

### 12.1 Sprint Retrospective 目的

Sprint Retrospective 用來檢討團隊這個 Sprint 的協作方式、流程問題、技術問題與改善行動。

注意：Retro 不是責備大會，而是找出可以改善的地方，並在下一 Sprint 實際嘗試改善。

---

## Sprint Retrospective Notes Template

```markdown
# Sprint Retrospective Notes

**Sprint：** Sprint __  
**日期：**  
**會議時間：**  
**參與者：**  
**主持人：** PM / Scrum Master  
**影片連結：**  

---

## 1. Sprint 狀態摘要

| 項目 | 結果 |
|---|---|
| Sprint Goal | 達成 / 部分達成 / 未達成 |
| 完成 Stories 數 |  |
| 未完成 Stories 數 |  |
| 最大阻礙 |  |
| 是否有延遲 | Yes / No |

---

## 2. 做得好的地方

| 項目 | 說明 | 是否保留 |
|---|---|---|
|  |  | Yes / No |
|  |  | Yes / No |

---

## 3. 遇到的問題

| 問題 | 發生原因 | 影響 |
|---|---|---|
|  |  | 高 / 中 / 低 |
|  |  | 高 / 中 / 低 |

---

## 4. 可以改善的地方

| 改善方向 | 原因 | 預期效果 |
|---|---|---|
|  |  |  |
|  |  |  |

---

## 5. 下一 Sprint 的改善行動

| Action Item | 負責人 | 完成時間 | 驗證方式 |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |

---

## 6. 上一 Sprint 改善行動追蹤

| 上次 Action Item | 是否完成 | 結果 | 是否繼續 |
|---|---|---|---|
|  | Yes / No |  | Yes / No |
|  | Yes / No |  | Yes / No |

---

## 7. Retro 結論

本 Sprint 最大學習：

> 

下一 Sprint 最重要的改善：

> 
```

---

# Part D：影片規劃

---

## 13. Sprint 影片清單

期末至少需要三個連續 Sprint 的 Planning、Review、Retrospective 影片。

| 影片編號 | 影片內容 | 建議長度 | 負責人 | 狀態 |
|---|---|---|---|---|
| V1 | Sprint 1 Planning | 3–5 分鐘 | PM / Scrum Master | Todo |
| V2 | Sprint 1 Review | 3–5 分鐘 | PM / Scrum Master | Todo |
| V3 | Sprint 1 Retrospective | 3–5 分鐘 | PM / Scrum Master | Todo |
| V4 | Sprint 2 Planning | 3–5 分鐘 | PM / Scrum Master | Todo |
| V5 | Sprint 2 Review | 3–5 分鐘 | PM / Scrum Master | Todo |
| V6 | Sprint 2 Retrospective | 3–5 分鐘 | PM / Scrum Master | Todo |
| V7 | Sprint 3 Planning | 3–5 分鐘 | PM / Scrum Master | Todo |
| V8 | Sprint 3 Review | 3–5 分鐘 | PM / Scrum Master | Todo |
| V9 | Sprint 3 Retrospective | 3–5 分鐘 | PM / Scrum Master | Todo |

---

## 14. 影片命名規則

建議上傳 YouTube 或雲端時使用以下命名格式：

```text
CampusEats_Sprint1_Planning
CampusEats_Sprint1_Review
CampusEats_Sprint1_Retrospective
CampusEats_Sprint2_Planning
CampusEats_Sprint2_Review
CampusEats_Sprint2_Retrospective
CampusEats_Sprint3_Planning
CampusEats_Sprint3_Review
CampusEats_Sprint3_Retrospective
```

---

## 15. 影片內容建議

### 15.1 Sprint Planning 影片內容

Planning 影片建議包含：

1. 本 Sprint Goal
2. 選入哪些 Stories
3. 為什麼選這些 Stories
4. AC 是否清楚
5. 任務如何分工
6. 風險是什麼

---

### 15.2 Sprint Review 影片內容

Review 影片建議包含：

1. 本 Sprint 原本目標
2. 實際完成哪些 Stories
3. Demo 可操作功能
4. 哪些 AC 已通過
5. 哪些項目未完成
6. 收到哪些回饋

---

### 15.3 Sprint Retrospective 影片內容

Retro 影片建議包含：

1. 這個 Sprint 做得好的地方
2. 這個 Sprint 遇到的問題
3. 問題原因
4. 下一 Sprint 要採取的改善行動
5. 上一次改善行動是否有效

---

# Part E：PM / Scrum Master 工作清單

---

## 16. 每個 Sprint 前

| 工作 | 產出 |
|---|---|
| 檢查 Backlog 優先順序 | 更新後的 Backlog |
| 確認 Story 是否 Ready | Ready Checklist |
| 準備 Planning 議程 | Planning Notes |
| 確認錄影安排 | 影片檔或連結 |
| 釐清 RD 問題 | Questions / Action Items |

---

## 17. 每個 Sprint 中

| 工作 | 產出 |
|---|---|
| 追蹤 Story 狀態 | Todo / In Progress / Review / Done |
| 協助移除阻礙 | Blocker list |
| 檢查 AC 是否被理解 | 補充說明 |
| 更新 Backlog 狀態 | 最新 backlog.md |
| 準備 Review Demo Flow | Demo Script |

---

## 18. 每個 Sprint 後

| 工作 | 產出 |
|---|---|
| 整理 Review 結果 | Review Notes |
| 整理 Retro 結果 | Retro Notes |
| 更新 Backlog | 新增或調整 Story |
| 保存影片連結 | Video list |
| 追蹤改善行動 | Action Items |

---

# Part F：結論

本文件定義 CampusEats 專案中的完成標準與 Sprint 會議紀錄格式。

後續每個 Sprint 應至少產出：

1. Sprint Planning Notes
2. Sprint Review Notes
3. Sprint Retrospective Notes
4. 對應的影片連結
5. 更新後的 Product Backlog
6. Retro Action Items

PM / Scrum Master 應確保每個 Sprint 都不只是「做功能」，也要能說明：

- 為什麼選這些 Story
- 這些 Story 是否符合 AC
- Review 收到什麼回饋
- Retro 後下一 Sprint 要怎麼改善

這些內容會直接支援期末報告中的 Sprint 流程、Retrospective 持續改進與 Lesson Learned。