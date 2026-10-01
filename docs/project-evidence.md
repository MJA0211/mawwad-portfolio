# Project evidence used in the portfolio

The portfolio describes the source supplied in this workspace. Existing project applications were inspected without changing their implementation. Earlier design documents sometimes describe planned features that later code implements; the current code and newer verification records take precedence.

The user identified all projects as active work in progress and confirmed ongoing agentic development for AutoValue AI and FailureLab. Muhammed supplied his name, education details, email, and LinkedIn URL. The portfolio uses his requested education label, University of Maryland. GitHub links were taken from actual repository remotes and checked publicly.

## AutoValue AI

Location: `project1/`. Remote: https://github.com/MJA0211/autovalue-ai.

| Portfolio claim                                              | Implementation evidence                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Historical U.S. asking-price estimates with RF05             | `README.md`, `backend/src/autovalue_api/services/valuation.py`, `docs/model-cards/autovalue-retail-rf05-v1.md`            |
| Schema normalization, cents, duplicate detection, quarantine | `ml/src/autovalue_ml/acquisition/normalization.py`, `scalar_parsing.py`, `contracts.py`, `tests/ml/test_normalization.py` |
| Independent collection and training permissions              | `ml/src/autovalue_ml/acquisition/training_gate.py`, `policy.py`, `provenance.py`                                          |
| Authenticated model and calibration artifacts                | `backend/src/autovalue_api/services/valuation.py`, `tests/backend/test_valuation_service.py`                              |
| API and browser-scoped SQLite history                        | `backend/src/autovalue_api/api/routes/valuation.py`, `services/history.py`, `frontend/src/App.jsx`                        |
| Isolated River learning and ADWIN telemetry                  | `ml/src/autovalue_ml/online/`, `tests/ml/online/`, `docs/river-shadow-learning.md`                                        |
| Partial V2 agentic research                                  | `ml/src/autovalue_ml/v2/`, `docs/v2/README.md`, `docs/v2/easterns-live-smoke-2026-09-13.md`                               |
| Real screenshot                                              | `docs/screenshots/valuation-result-desktop.png`                                                                           |

The site does not claim live-market accuracy, a completed external acquisition pipeline, online updates to RF05, live outcomes for River, or public availability of the private estimator. The latest external smoke record is blocked. Source dataset names, experiment metrics, and binaries are not turned into marketing claims.

## FailureLab

Local reference: `failurelab/` (kept outside this repository). Remote: https://github.com/MJA0211/failurelab.

| Portfolio claim                                           | Implementation evidence                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Two typed model stages in LangGraph                       | `src/failurelab/workflow.py`, `agents.py`, `schemas.py`                                           |
| Lexical retrieval and optional neural retrieval           | `src/failurelab/retrieval.py`, `pyproject.toml`                                                   |
| Interleaved browser experiments and deterministic verdict | `src/failurelab/runner.py`, especially `verdict` and `run_fixture`                                |
| Evidence, checkpoint persistence, leased jobs, replay     | `src/failurelab/store.py`, `workflow.py`, `tests/test_release_gate.py`                            |
| GitHub import, webhook validation, bounded downloads      | `src/failurelab/integrations.py`, `api.py`, `tests/test_integrations.py`                          |
| Reviewed Linux repository runner                          | `src/failurelab/runner_service.py`, `docs/runner-protocol.md`, `docs/unfamiliar-ci-validation.md` |
| Incomplete live gate and outstanding validation           | `docs/releases/v0.1.2-final-readiness.md`, `docs/portfolio-case-study.md`                         |
| Real screenshot                                           | `docs/screenshots/experiment.png`                                                                 |

The site distinguishes implemented agent stages from the user's ongoing work on a broader agentic workflow. It does not claim a finished release, independent diagnostic accuracy, time savings, arbitrary safe code execution, or verified PostgreSQL deployment.

## EICC

Local reference: `EICC PROJECT/` (kept outside this repository). Remote: https://github.com/MJA0211/eicc. The portfolio links to the repository and includes a local recording.

| Portfolio claim                                           | Implementation evidence                                                |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| Enterprise Integration Control Center                     | `README.md`                                                            |
| Fictional Northstar enterprise workflow                   | `README.md`, `backend/seed.py`, `docs/demo-walkthrough.md`             |
| Modular monolith, relational artifact subtypes            | `backend/models.py`, `docs/architecture.md`                            |
| REST and SOAP simulator execution                         | `backend/simulator.py`, `tests/test_security_simulators.py`            |
| Contract fingerprints, stale evidence and UAT checks      | `backend/graph.py`, `services.py`, `tests/test_evidence_governance.py` |
| Immutable evidence and versioned report snapshots         | `backend/evidence.py`, `reports.py`, `models.py`                       |
| Auth, CSRF and revision checks                            | `backend/auth.py`, `main.py`, `schemas.py`                             |
| React/TypeScript, FastAPI, SQLAlchemy, PostgreSQL, SQLite | `frontend/package.json`, `pyproject.toml`, `docker-compose.yml`        |
| Workflow and browser testing                              | `tests/`, `frontend/e2e/governance.spec.ts`, `docs/verification.md`    |
| Real screenshot                                           | `docs/screenshots/dashboard-dark.png`                                  |

The user confirmed ongoing EICC development. Its documentation does not define a specific future feature commitment, so the site leaves that scope open. Production enterprise use, business savings, AI approvals, and actual external deployments are not claimed.

## Copy and assets

Copy was reviewed with [Humanizer](https://github.com/blader/humanizer) and [Stop Slop](https://github.com/hardikpandya/stop-slop). The edits cut repeated descriptions and vague claims while preserving technical details and project status.

The site uses original HTML/CSS diagrams. They describe the architecture and do not simulate runtime status, measurements, or project execution. Screenshots are copied directly from the repositories. Only public-facing screenshots and notes enter the site; `.env`, runtime databases, raw datasets, checkpoints, and estimator artifacts do not.

## Recorded demos

| Project      | Source                                                                                             | Verified browser duration | Portfolio file                            |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------- |
| AutoValue AI | Local React/FastAPI application, captured October 1, 2026 with `scripts/record-autovalue-demo.mjs` | 97.001 seconds            | `site/public/videos/autovalue-demo.mp4`   |
| FailureLab   | `failurelab/docs/walkthrough.webm`                                                                 | 27.56 seconds             | `site/public/videos/failurelab-demo.webm` |
| EICC         | `EICC PROJECT/docs/demo/eicc-walkthrough.mp4`                                                      | 205.813 seconds           | `site/public/videos/eicc-demo.mp4`        |

The FailureLab and EICC recordings added September 23 are retained as supplied. AutoValue AI's October 1 recording replaces its earlier 105.367-second video. AutoValue AI and FailureLab posters are actual frames captured from their recordings. The EICC poster comes from the existing application screenshot. Posters are resized to at most 800 pixels wide and encoded as WebP by `scripts/optimize-posters.mjs`. The separate screenshots in the engineering notes remain unchanged.

AutoValue's new recording uses the verified local RF05 model and an isolated SQLite history database. It shows real API results for a 2020 Toyota Camry and a 2021 Honda CR-V, compares 90% and 95% intervals, and reviews saved estimates. The engineering segment shows holdout metrics, interval calibration, architecture, experiment decisions, and a synthetic River replay. The replay displays recorded research aggregates and does not update the serving model. Twelve chapter captions and the HTML walkthrough are generated from the capture timings by `scripts/package-autovalue-demo.py`. Private model artifacts and runtime databases remain outside the portfolio repository.

FailureLab's walkthrough was checked against the recording and `scripts/record_walkthrough.py`; its scope is explicitly the deterministic baseline on owned fixtures. The EICC description track was copied from `docs/demo/eicc-captions.vtt`; its text walkthrough retains the same chapter information and fictional-scenario scope. Each recording has a separate accessible HTML walkthrough.

Native browser controls provide playback, seeking, captions, and fullscreen. Recordings are served locally with `preload="none"`; automated checks confirm no MP4 or WebM request occurs before playback. When JavaScript is available, starting a recording pauses the others.
