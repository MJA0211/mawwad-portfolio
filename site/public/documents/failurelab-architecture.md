# FailureLab: architecture notes

FailureLab is an active CI investigation project. It tests proposed diagnoses against a failing baseline and derives findings from the recorded execution results.

## Implemented

FastAPI exposes ingestion, investigation, evidence, and review APIs to a React and TypeScript workspace. SQLAlchemy stores cases and events. A LangGraph worker performs collection, retrieval, diagnosis, planning, execution, and reporting. SQLite and persistent checkpoints support the local setup; PostgreSQL adapters also exist.

GitHub run import and HMAC-validated webhooks collect bounded logs, artifacts, and source from the failing commit. Retained evidence is redacted before receiving an ID and hash. BM25 and exact identifiers provide lexical retrieval within the investigation. Embeddings and cross-encoder reranking are optional.

The diagnosis and planning stages return typed data. Pydantic checks citation IDs, hypotheses, allowed interventions, and repetition budgets. Chat mode calls a provider. Baseline mode uses explicit diagnostic signatures. A provider failure stops chat execution.

The owned browser runner uses fresh contexts and interleaves baseline and intervention trials under identical assertions. Every baseline must fail and every intervention must pass for the tested mechanism to be supported. Mixed outcomes remain inconclusive. Screenshots and Playwright traces remain attached to the experiment.

Workers claim leased jobs, renew their heartbeat, and use bounded retries. Persistent checkpoints and idempotent results support recovery. Completed-case replay verifies stored identity and report consistency before returning the preserved result without new model calls or execution.

The local runner accepts owned fixtures. Imported repositories require an authenticated runner, an operator-reviewed manifest, and a disposable Linux VM. A model selects typed actions; it has no shell tool.

API, browser, security, recovery, and release-gate tests exist. One separate authored GitHub incident completed a live-agent investigation and a real Linux browser experiment. These are development results; independent diagnostic accuracy is unmeasured.

## In development

Work continues on a more automated agentic investigation workflow. The diagnosis, planning, execution, evidence, and replay components above already exist; the broader workflow remains in development.

The documented v0.1.2 release gate is incomplete after provider availability failures. Deployment smoke tests and human review remain outstanding.

## Future

The project documents independent incidents and a frozen held-out evaluation as requirements for broader diagnostic-quality claims. Optional retrieval and deployment adapters also need measured acceptance.

## Source

[FailureLab repository](https://github.com/MJA0211/failurelab)

Local implementation references: `src/failurelab/workflow.py`, `agents.py`, `runner.py`, `retrieval.py`, `store.py`, `integrations.py`, `tests/test_release_gate.py`, `docs/architecture.md`, and `docs/releases/v0.1.2-final-readiness.md`.
