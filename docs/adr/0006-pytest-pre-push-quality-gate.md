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
- **雲端 CI(GitHub Actions):** 更完整且不可繞過。**現已採用** — `backend-ci.yml`(pytest + 90% 分支覆蓋率閘門、ruff、bandit、pip-audit)與 `secret-scan.yml`(gitleaks)為**正式的 gate of record**;pre-push hook 降級為本機快速回饋。

## Consequences

- ✅ 測試隔離資料庫(DB 15、前後 `flushdb`),不污染開發資料。
- ✅ pre-push hook 提供 push 前的本機快速回饋。
- ⚠️ **pre-push hook 不是權威閘門**:它是 opt-in(每人需 `git config core.hooksPath .githooks`)、可被 `--no-verify` 繞過、且只在開發者本機跑。權威閘門應為**伺服器端 required status checks + branch protection**(non-bypassable、統一、環境受控)。
- 🔜 **待辦:在 `main`/`backend` 開啟 branch protection**,將 `Tests + coverage gate`、`SAST + dependency audit`、`gitleaks` 設為必過,並要求 ≥1 review 與分支更新(含 administrators)。
