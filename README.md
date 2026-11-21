# Ajaia Docs (AI-Native Full-Stack Document Workspace)

> **Live Deployment URL:** http://ajaiadocsyousifjbour.duckdns.org (Server Direct IP: http://13.62.51.232)  
> **Walkthrough Video:** https://youtu.be/sBymFgackgU  
> **Public Repository:** https://github.com/yousifsamirjbour-lgtm/ajaia-docs  

A modern, responsive, collaborative rich-text document platform built with FastAPI, React 18, TipTap v2, and SQLite. Features server-side sanitized HTML persistence, dual-mode saving (debounced auto-save + instant Ctrl/Cmd+S), multi-tenant sharing with granular role-based permissions, and Markdown/plaintext ingestion.

---

## Architecture & Technology Stack

- **Backend:** Python 3.11+ / FastAPI, SQLAlchemy 2.0 (asyncio + aiosqlite), Pydantic v2 data models.
- **Frontend:** React 18, TipTap v2 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`), Lucide icons, Vite 6.
- **Sanitization & Security:** Server-side Rust-based `nh3` allowlist HTML sanitization (strips `<script>`, iframe, event handlers, and unsafe protocols).
- **Persistence:** SQLite with asynchronous engine (`aiosqlite`) and foreign-key cascading deletes. Configurable via `DATABASE_URL` for PostgreSQL in production.
- **Testing:** 7 backend pytest suites (`pytest`, `pytest-asyncio`, `httpx`), 5 end-to-end Playwright tests (`@playwright/test`, Chromium).
- **Video Walkthrough:** Programmatic video rendered via Remotion (`@remotion/cli`, React 18).

---

## Seeded User Accounts

The database initializes idempotently with three default accounts:
- `alice@ajaia.ai` (Owner of initial welcome documents)
- `bob@ajaia.ai` (Collaborator & engineering lead)
- `charlie@ajaia.ai` (Designer / external teammate)

Users can be switched dynamically in the sidebar switcher. The active user identity is transmitted via the `X-User-Email` HTTP header and enforced strictly on every backend route.

---

## Supported File Import Types

Users can import documents via the "Import" button in the sidebar:
- **Markdown (`.md`):** Automatically transformed to semantic HTML with headers, lists, code blocks, and bold/italic elements preserved.
- **Plain Text (`.txt`):** Converted to paragraph blocks with native line breaks and double newlines preserved.

### Import Validation Rules
- Supported extensions: strictly `.md` and `.txt`. Any other extension returns HTTP 400 with a descriptive error.
- Size limit: maximum 1 MB (1,048,576 bytes). Files exceeding 1 MB are rejected with HTTP 413 (Content Too Large).
- Content validation: empty files and non-UTF-8 encodings are rejected with HTTP 400.
- All imported content is filtered server-side through `nh3` sanitization before database insertion.

---

## Local Development Setup

### Prerequisites
- Python 3.11+ (tested with Python 3.11 and 3.14)
- Node.js 18+ (tested with Node 20 and 24)
- npm 9+

### 1. Backend Setup
```bash
# Navigate to project root
cd ajaia-docs-submission

# Create and activate Python virtual environment
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run FastAPI backend development server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is accessible at `http://127.0.0.1:8000`. Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (Development Proxy)
```bash
# In a new terminal:
cd frontend
npm install
npm run dev
```
The Vite development server runs at `http://localhost:5173` and automatically proxies `/api` calls to `http://127.0.0.1:8000`.

---

## Running Automated Tests

### Backend Unit & Integration Tests (pytest)
```bash
# Run pytest with isolated in-memory test database
pytest backend/tests/test_app.py -v
```
**Expected Output:** 7 passed in under 1 second. Verifies CRUD operations, sharing, revocation, 403 authorization checks, 400/413 import rejections, and nh3 script-stripping sanitization.

### Frontend & End-to-End Tests (Playwright)
```bash
# Run Playwright test suite against the running app
npx playwright test

# To view the visual HTML report and traces:
npx playwright show-report deliverables/assets/test-reports
```
**Expected Output:** 5 passed in ~16 seconds. Deterministic assertions testing document creation, inline renaming, rich formatting, debounced auto-save, Ctrl+S manual save, sharing with Bob, permissions enforcement against Charlie, and file imports.

### Security Audits
```bash
# Python dependencies audit
pip-audit

# Node.js dependencies audit
cd frontend && npm audit
```

---

## Production Deployment & Docker

FastAPI is configured to serve the production-compiled React frontend single-page application from a single unified origin.

### Single-Origin Build
```bash
# 1. Compile frontend assets
cd frontend
npm run build
cd ..

# 2. Run single-origin server
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
FastAPI detects `frontend/dist` and serves `index.html` as the catch-all SPA router for any non-API route.

### Docker Multi-Stage Container
```bash
# Build production Docker image
docker build -t ajaia-docs:latest .

# Run container
docker run -p 8000:8000 -e DATABASE_URL="sqlite+aiosqlite:///backend/ajaia_docs.db" ajaia-docs:latest
```

> [!WARNING]
> **Ephemeral Storage Caveat:** When running on ephemeral cloud hosts (e.g. basic Render, Fly.io, or Heroku instances without persistent volumes), the default local SQLite database (`./backend/ajaia_docs.db`) is re-initialized whenever the container restarts or spins down. For durable cloud persistence, supply a managed PostgreSQL connection string via the `DATABASE_URL` environment variable (e.g. `postgresql+asyncpg://user:pass@host:5432/db`).

---

## Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite+aiosqlite:///backend/ajaia_docs.db` | SQLAlchemy connection string (supports SQLite and PostgreSQL) |
| `PORT` | `8000` | Port for the Uvicorn web server |
| `ENVIRONMENT` | `production` | Environment mode (`production` or `development`) |

---

## Development Process & Attribution

This project showcases a balanced, modern AI-native engineering methodology:
- **Candidate Direction:** Formulated the full product and engineering specification, defined architecture and data models, established functional constraints, drafted detailed prompts and workflows, and directed deployment infrastructure and DNS configuration.
- **AI Coding Agent:** Carried out code implementation, test automation, adversarial edge-case verification, video synthesis, and technical documentation under the candidate's exact specifications and oversight.
