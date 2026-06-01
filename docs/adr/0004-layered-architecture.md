# ADR-0004: 分層架構 API / Service / Repository

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** 後端

## Context

MVP 雖小,但要能被測試、好維護,並讓未來換資料庫(見 ADR-0002 風險)時衝擊最小。

## Decision

後端分為四層,單向依賴(上層依賴下層):

- **api/**:FastAPI router,只負責 HTTP、驗證輸入、回應。
- **services/**:商業邏輯與規則(狀態轉換、權限、錯誤判斷)。
- **repositories/**:封裝所有 Redis 存取,對上提供 dict 介面。
- **schemas/**(Pydantic)與 **utils/**(security、auth dependency)為橫切支援。

## Alternatives

- **全部寫在 router:** 開發最快,但邏輯與 HTTP/儲存耦合,難測試與重用。

## Consequences

- ✅ Service 不碰 HTTP、Repository 不碰商業邏輯,單元測試與替換容易。
- ✅ 若日後從 Redis 換 DB(ADR-0002),只需改 repositories 層。
- ⚠️ 小功能也要跨多檔,初期樣板碼略多。
