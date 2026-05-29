# ADR-0002: 以 Redis 作為 MVP 主資料儲存

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** 後端
- **相關 Story:** AG-002, AG-003, AG-004

## Context

MVP 需要儲存使用者與訂單,並支援「待接訂單依期望時間排序」「快速查單」。期末範圍不需要複雜關聯查詢或報表。

## Decision

使用 **Redis** 作為唯一資料儲存:

- 使用者/訂單以 JSON 字串存於 `user:{id}`、`order:{id}`。
- email→user 以字串鍵 `email_to_user:{email}` 建索引。
- 待接訂單用 **ZSET `orders:open`**,score = 期望時間 timestamp,天然支援排序與移除。
- 使用者訂單關聯用 SET(`orders:by_customer`、`orders:by_runner`)。

## Alternatives

- **PostgreSQL / SQLite:** 關聯與查詢強,但要設計 schema、migration,期末時間成本高。
- **記憶體 dict:** 重啟即失,且不支援多 worker。

## Consequences

- ✅ 排序、原子操作(見 ADR-0005)直接用 Redis 原生指令完成。
- ✅ 開發/部署簡單,`docker-compose` 一行起 Redis。
- ⚠️ 無 schema 與 join,複雜查詢需自行在程式組裝。
- ⚠️ 預設非持久化,正式環境需開 RDB/AOF;資料一致性靠應用層維護。
- ⚠️ 列表查詢採「逐一 GET」(N 次往返),資料量大時需改 pipeline/MGET。
