# ADR-0001: 採用 FastAPI 作為 Web 框架

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** 後端
- **相關 Story:** AG-000

## Context

需要一個能快速開發 REST API、有自動文件、且支援 async 的 Python 框架,以在期末有限時間內完成 MVP。

## Decision

採用 **FastAPI**(`uvicorn` 啟動),搭配 **Pydantic** 做 request/response 驗證與序列化。

## Alternatives

- **Flask:** 輕量但需自行整合驗證與 OpenAPI 文件,額外工。
- **Django REST Framework:** 功能完整但偏重,且綁 ORM,與本專案用 Redis 的方向不合。

## Consequences

- ✅ Pydantic 直接滿足多項 AC 的欄位驗證(必填、`delivery_fee ≥ 0`),少寫驗證碼。
- ✅ 內建 Swagger UI(`/docs`),Demo 與前端串接都方便。
- ✅ async 原生支援,搭配 async Redis client。
- ⚠️ 團隊需熟悉 async/await 寫法。
