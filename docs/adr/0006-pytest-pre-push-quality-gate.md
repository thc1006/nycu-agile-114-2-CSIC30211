# ADR-0006: pytest + pre-push hook 作為品質閘門

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** 後端

## Context

敏捷開發要求每個 Story 的 Definition of Done 包含「無阻斷性錯誤、資料正確」。需要一個自動、低成本的機制防止壞掉的程式進主線。

## Decision

- 用 **pytest** 寫 API 層級整合測試(目前 15 項,涵蓋 health、auth、orders 主要情境與例外)。
- 測試使用 **Redis DB 15**,與開發用的 DB 0 隔離,且每測試前後 `flushdb`。
- 設 **git pre-push hook**(`.githooks/pre-push` → `scripts/run-tests.sh`):push 前自動跑測試,**失敗則中止 push**。
- 啟用方式:`git config core.hooksPath .githooks`。

## Alternatives

- **只靠人工測試:** 易遺漏、回歸成本高。
- **雲端 CI(GitHub Actions):** 更完整,但期末先用本機 hook 最快落地(未來可再補 CI)。

## Consequences

- ✅ 直接支撐 DoD,壞程式進不了遠端分支,是敏捷流程的具體證據。
- ✅ 測試隔離資料庫,不污染開發資料。
- ⚠️ hook 為本機機制,需每位成員執行一次 `git config` 才生效;繞過(`--no-verify`)仍可能。
- ⚠️ 跑測試需本機有 Redis;未來可移到 CI 降低環境依賴。
