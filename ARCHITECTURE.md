# Ajaia Docs: Architecture & Technical Tradeoffs

## 1. System Overview & Architecture

Ajaia Docs is structured as an AI-native, modular full-stack application. The codebase separates concerns across an asynchronous Python API service and a modern React single-page application:

```text
┌──────────────────────────────────────────────────────────┐
│                      Client Layer                        │
│   React 18 + TipTap v2 Editor Engine + Lucide UI         │
│   (Debounced Auto-Save + Ctrl+S + Role-Based Sidebar)    │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP / JSON (X-User-Email)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                      Backend API                         │
│               FastAPI Asynchronous Router               │
│  ├── Auth & RBAC Dependency (Header Email Extraction)    │
│  ├── nh3 Rust-Based HTML Allowlist Sanitization Engine   │
│  ├── Document Ingestion Pipeline (.md -> HTML, .txt)     │
│  └── SQLAlchemy 2.0 Async Session Management             │
└────────────────────────────┬─────────────────────────────┘
                             │ Async SQLite (aiosqlite)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Persistence Layer                      │
│   Tables: `documents`, `document_shares` (Cascade FK)   │
│   (Idempotent Seeder: Alice, Bob, Charlie)               │
└──────────────────────────────────────────────────────────┘
```

---

## 2. What Was Prioritized and Why

In an assignment with strict end-to-end deliverables (core features, automated test suites, programmatic walkthrough video, and production Docker containerization), technical priorities were allocated strategically:

1. **Deterministic Data Integrity & Server-Side Security:**
   - *Decision:* Never trust client-generated markup.
   - *Implementation:* Every document modification (manual save, auto-save, Markdown import, plaintext ingestion) passes through `nh3.clean()` using a strict allowlist. Malicious `<script>`, `<iframe>`, inline `onclick`/`onerror` handlers, and `javascript:` URIs are neutralized before reaching the database.

2. **Frictionless Collaboration Simulation:**
   - *Decision:* Rather than forcing evaluators through lengthy signup/login screens with email verification, provide instantaneous multi-user switching.
   - *Implementation:* Seeded accounts (`alice@ajaia.ai`, `bob@ajaia.ai`, `charlie@ajaia.ai`) simulate team collaboration with server-side role enforcement via `X-User-Email`.

3. **Dual-Mode Persistence (Auto-Save + Manual Save):**
   - *Decision:* Prevent accidental work loss while giving power users deterministic control.
   - *Implementation:* Debounced auto-save triggers 1200ms after the last keystroke, while instant manual save is available via toolbar and global `Ctrl/Cmd+S`. Clear visual state pills (`Saved`, `Saving...`, `Unsaved`, `Save Error`) keep the user oriented.

4. **Single-Origin Deployment Simplicity:**
   - *Decision:* Eliminate CORS friction and multi-container overhead in staging/demo environments.
   - *Implementation:* FastAPI mounts `frontend/dist` and handles single-page application HTML fallback routing natively.

---

## 3. Storage, Auth, and Synchronization Tradeoffs

### Tradeoff 1: Header-Based Mock Authentication (`X-User-Email`)
- **Current Approach:** The active user identity is passed in the `X-User-Email` HTTP request header and resolved via FastAPI's `Depends(get_current_user_email)` dependency.
- **Why Chosen:** Enables instant switching between Alice (document owner), Bob (collaborator), and Charlie (unauthorized third party) in a single browser session without clearing cookies or logging out.
- **The Tradeoff:** **Header-based authentication is spoofable and strictly demo-only.** In an untrusted production network, any HTTP client can forge `X-User-Email: alice@ajaia.ai` to impersonate an owner.
- **Production Replacement:** In production, this layer must be replaced by cryptographic JWT Bearer tokens or OAuth2 session cookies issued by an identity provider (e.g., Auth0, Supabase, or FastAPI-Users).

### Tradeoff 2: Concurrency & Synchronization Model (Last-Write-Wins)
- **Current Approach:** Document updates (`PUT /api/documents/{id}`) execute an atomic SQLite transaction updating `title`, `content`, and `updated_at`.
- **Why Chosen:** Simple, deterministic, zero third-party socket infrastructure, and rock-solid reliability across automated testing suites.
- **The Tradeoff:** **Last-write-wins can lead to lost updates on simultaneous typing.** If Alice and Bob edit different paragraphs of the same shared document simultaneously, whoever saves last overwrites the other's modifications.
- **Production Replacement:** For true real-time collaborative editing, the system should adopt conflict-free replicated data types (CRDTs) such as **Yjs** or **Automerge** over WebSockets, with the server maintaining a durable operation log.

### Tradeoff 3: Content Storage Format (Sanitized HTML vs. ProseMirror JSON / AST)
- **Current Approach:** Document content is persisted as standard semantic HTML strings.
- **Why Chosen:** Maximum portability, human readability in the database, trivial rendering in read-only contexts, and direct compatibility with server-side `nh3` allowlist sanitization.
- **The Tradeoff:** HTML can lose specific editor metadata (e.g., custom node attributes, cursor state, selection ranges) that a structured JSON Abstract Syntax Tree (AST) preserves natively.
- **Production Replacement:** A hybrid storage schema storing both ProseMirror AST JSON (for editing state) and sanitized HTML (for export and indexing).

### Tradeoff 4: Database Engine (SQLite / aiosqlite)
- **Current Approach:** Asynchronous SQLite (`sqlite+aiosqlite:///backend/ajaia_docs.db`) with `check_same_thread=False` and cascading foreign keys enabled.
- **Why Chosen:** Zero external database dependencies; clones and runs out-of-the-box on any machine or CI runner.
- **The Tradeoff:** SQLite storage is ephemeral on containerized cloud platforms (Render, Fly.io) unless backed by a persistent block volume.
- **Production Replacement:** Managed PostgreSQL with connection pooling (`asyncpg`). The codebase is already configured via SQLAlchemy 2.0 to accept any `DATABASE_URL`.

---

## 4. What to Build in 2 to 4 More Hours

Given an additional 2 to 4 hours of engineering time, the following enhancements would be prioritized in order of impact:

1. **Real-Time Multi-Cursor Collaboration with Yjs (90 minutes):**
   - Implement `@tiptap/extension-collaboration` and `y-webrtc` / `y-websocket` server on FastAPI WebSockets.
   - Display real-time collaborator cursors, live typing presence indicators, and user avatars.

2. **Cryptographic Authentication & Session Security (45 minutes):**
   - Replace `X-User-Email` header with FastAPI OAuth2 password bearer tokens or magic link authentication.
   - Hash user passwords using Argon2 / bcrypt.

3. **Document Revision History & Point-in-Time Rollback (45 minutes):**
   - Add a `document_revisions` table storing immutable version snapshots on each manual save or hourly milestone.
   - Provide a visual diff viewer allowing users to inspect and restore previous revisions.

4. **Export Engine (PDF & Markdown) (30 minutes):**
   - Implement client-side or server-side export (`html2pdf` or Pandoc) allowing one-click export of documents to styled PDF and Markdown files.
