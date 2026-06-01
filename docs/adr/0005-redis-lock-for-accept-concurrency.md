# ADR-0005: 用 Redis 分散式鎖防止重複接單

- **Status:** Accepted（鎖**釋放機制**已由 [ADR-0007](0007-order-state-transitions.md) 以 Lua 原子比對刪除修訂；接單加鎖的整體決策仍有效）
- **Date:** 2026-05-29
- **Deciders:** 後端
- **相關 Story:** AG-004

## Context

AG-004 規則 R-004-05:「同一筆訂單只能被一位帶餐者接單」。兩名帶餐者同時點「接單」時,可能都讀到 `OPEN` 而雙雙接走,造成資料不一致。

## Decision

接單流程加 **Redis 分散式鎖**:

1. `SET lock:order:{id} <value> NX EX 5` 取得鎖(取不到→回 409)。此鎖為**每筆訂單共用**,接單與後續狀態轉移(start/deliver/confirm,見 ADR-0007)皆使用同一把鎖。
2. 鎖內重新讀訂單,檢查 `status == OPEN`、`customer_id != runner_id`。
3. 更新狀態為 `ACCEPTED`、記錄 runner、移出 `orders:open`。
4. `finally` 釋放鎖:以 **Lua script 原子比對刪除**(`if redis.call('get',KEYS[1])==ARGV[1] then del`),只有持鎖者能刪,避免誤刪他人鎖。(初版為「GET 後 DELETE」非原子,已由 ADR-0007 改為此原子版本。)

## Alternatives

- **只靠狀態判斷(無鎖):** 有 check-then-set 競態,無法保證唯一。
- **Redis 交易 / WATCH-MULTI:** 可行但程式較繁複;鎖在此情境更直觀。

## Consequences

- ✅ 滿足 AC「不可重複接單」,測試 `test_cannot_accept_order_twice` 通過。
- ✅ 鎖有 5 秒 TTL,持有者崩潰也會自動釋放,不會永久卡死。
- ✅ 釋放鎖採 Lua 原子比對刪除(ADR-0007),已消除初版「GET 後 DELETE」非原子的釋放競態。
