# EICC: architecture notes

EICC stands for Enterprise Integration Control Center. It is an active software engineering project built around the fictional Northstar Enterprise Services scenario. It has no real enterprise deployment or claimed business outcome.

## Implemented

The React and TypeScript workspace calls a FastAPI service through Nginx or the Vite development proxy. Pydantic validates input. Domain services own workflow transitions, while graph queries calculate traceability, change impact, and release readiness.

SQLAlchemy stores a shared artifact identity with seventeen joined subtype tables. Foreign keys connect requirements, integrations, test cases, defects, user acceptance, changes, and releases. Alembic manages migrations. SQLite supports local development; Docker Compose defines a PostgreSQL deployment.

The integration runner sends requests through `httpx.ASGITransport` to fixed local REST/JSON and SOAP/XML simulators. The requests exercise routing, authentication, payload validation, field mapping, response serialization, and evidence persistence. They do not measure an external network or production service.

Execution records include a fingerprint of the current test and interface contract. A mapping change makes earlier execution evidence stale. UAT approvals depend on current criteria and evidence too. Release transitions recheck these conditions on the server.

Execution evidence is immutable through the API. Reports are versioned Markdown snapshots of stored records. Role checks, opaque cookie sessions, CSRF checks, optimistic revisions, and audit records support the workflow. The application has no AI approval path.

Backend tests cover workflow rules, authentication, evidence, protocol simulators, and migrations. Playwright tests exercise the requirements-to-release workflow against an isolated backend.

## In development

Muhammed continues to develop the enterprise workflow around this architecture. Additional capabilities are still being defined.

## Future

The repository does not commit to a specific next feature set. Real enterprise integration and deployment remain outside the demonstrated scope. A release transition records a delivery decision; it does not deploy external software.

## Source files reviewed

These notes summarize the local EICC repository:

- `README.md`, `docs/architecture.md`, `docs/implementation-plan.md`
- `backend/models.py`, `backend/services.py`, `backend/graph.py`
- `backend/simulator.py`, `backend/evidence.py`, `backend/reports.py`
- `backend/main.py`, `backend/auth.py`, `backend/schemas.py`
- `frontend/src/App.tsx`, `frontend/e2e/governance.spec.ts`
- `tests/test_evidence_governance.py`, `docker-compose.yml`
