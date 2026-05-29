# ADR-0003: 採用無狀態 JWT 認證

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** 後端
- **相關 Story:** AG-001

## Context

AG-001 要求註冊、登入、登出,以及「未登入不可進入主要頁面」。需要一個跨請求識別使用者、且能保護路由的機制。

## Decision

- 密碼以 **bcrypt**(`passlib`)雜湊儲存,不存明文。
- 登入成功簽發 **JWT**(`PyJWT`,HS256),payload 含 `sub`(user id)與 `email`,預設 24 小時到期。
- 受保護路由透過 `get_current_user` 依賴注入驗證 Bearer token。
- **登出由前端清除 token 完成**,後端不維護 session。

## Alternatives

- **Server-side session(存 Redis):** 可即時失效,但增加狀態管理與每請求查詢成本。
- **OAuth / Google 登入:** 已列 Future,非 MVP 核心。

## Consequences

- ✅ 後端無狀態,水平擴充容易;路由保護滿足 AC「未登入不可進入」。
- ✅ 密碼安全(bcrypt),登入失敗統一回 401,不洩漏帳號是否存在。
- ⚠️ **無法伺服器端強制 token 失效**(登出/被盜用後 token 在到期前仍有效);若需要,未來加 token 黑名單(再開一篇 ADR)。
- ⚠️ `JWT_SECRET_KEY` 預設為開發值,**正式展示前必須更換**。
