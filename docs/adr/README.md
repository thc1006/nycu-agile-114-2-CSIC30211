# Architecture Decision Records (ADR)

本資料夾記錄 CampusEats **後端**的重要架構決策。

ADR 用來回答:「我們當初為什麼這樣決定?」讓新成員、老師、未來的自己能快速理解設計取捨,而不必翻 commit。

## 使用方式

1. 有新架構決策時,複製 [`0000-template.md`](0000-template.md),依序編號命名(如 `0007-xxx.md`)。
2. 每篇只記**一個**決策,保持精簡(Context / Decision / Consequences)。
3. 決策被推翻時,**不要刪舊檔**,把舊檔 Status 改成 `Superseded by ADR-00XX`,再寫一篇新的。

## 狀態說明

| Status | 意義 |
|---|---|
| Proposed | 提案中,尚未拍板 |
| Accepted | 已採用 |
| Superseded | 已被新 ADR 取代 |
| Deprecated | 不再適用 |

## 目前清單

| # | 決策 | Status |
|---|---|---|
| [0001](0001-fastapi-web-framework.md) | 採用 FastAPI 作為 Web 框架 | Accepted |
| [0002](0002-redis-as-primary-datastore.md) | 以 Redis 作為 MVP 主資料儲存 | Accepted |
| [0003](0003-stateless-jwt-auth.md) | 採用無狀態 JWT 認證 | Accepted |
| [0004](0004-layered-architecture.md) | 分層架構:API / Service / Repository | Accepted |
| [0005](0005-redis-lock-for-accept-concurrency.md) | 用 Redis 分散式鎖防止重複接單 | Accepted |
| [0006](0006-pytest-pre-push-quality-gate.md) | pytest + pre-push hook 作為品質閘門 | Accepted |
