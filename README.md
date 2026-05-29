# CampusEats 🍱

[![Backend CI](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/thc1006/nycu-agile-114-2-CSIC30211/actions/workflows/backend-ci.yml)
[![License](https://img.shields.io/github/license/thc1006/nycu-agile-114-2-CSIC30211)](LICENSE)
![Python](https://img.shields.io/badge/python-3.12-blue)

> An Agile/Scrum software-engineering course project (NYCU CSIC30211): a FastAPI + Redis peer-to-peer **campus meal-pickup** platform, built sprint by sprint.
>
> 校園帶餐媒合平台 — 以 Scrum 流程開發的期末專案,讓「需要帶餐」與「順路帶餐」的學生互相媒合。

CampusEats matches a student who needs a meal brought to them with a student already heading to a restaurant — *students helping students*. The repo doubles as a worked example of running **Agile/Scrum** on a real product: product backlog, user stories with acceptance criteria, sprint planning/review/retrospective, Definition of Done, and architecture decision records.

## Highlights

- 🧭 **Full Scrum artifacts** — backlog, story map, user journey, example-mapped acceptance criteria, DoD → [`docs/`](docs/)
- 🧩 **Architecture Decision Records** — backend ADRs + reusable template → [`docs/adr/`](docs/adr/)
- ⚙️ **FastAPI + Redis backend** — JWT auth, order lifecycle, optimistic accept lock, pytest + CI
- 📱 **Web & mobile prototypes** — zero-dependency vanilla JS, no build step

## MVP flow

`sign up → post order → browse open orders → accept → update status → confirm receipt → two-way rating`
Two roles: **orderer (訂餐者)** and **runner (帶餐者)**.

## Tech stack

**Backend** Python 3.12 · FastAPI · Redis · JWT (PyJWT) · bcrypt · pytest
**Frontend** static HTML/CSS + vanilla JS · **CI** GitHub Actions · git pre-push test hook

## Repository layout

Work is split across branches:

| Branch | Contents |
|---|---|
| `main` | Project & Scrum docs (`docs/`, `docs/adr/`) |
| `backend` | FastAPI + Redis backend + tests |
| `feature/campuseats-web-and-mobile` | Web + mobile front-end prototypes |

## Quick start (backend)

On the `backend` branch, with Redis running:

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload     # API docs at http://127.0.0.1:8000/docs
pytest -q
```

## Documentation

- **Product & process** → [`docs/`](docs/) — brief, backlog, story map, acceptance criteria, Scrum templates
- **Architecture decisions** → [`docs/adr/`](docs/adr/)

## Course

National Yang Ming Chiao Tung University (NYCU) — Agile Software Engineering, **CSIC30211**, spring 2026 (114-2). A team project demonstrating iterative, sprint-based delivery.

## License

See [LICENSE](LICENSE).
