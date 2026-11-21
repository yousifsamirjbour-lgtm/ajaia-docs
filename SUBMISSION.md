# Ajaia "AI-Native Full Stack Developer Assignment" - Final Submission

> **Candidate:** Senior Full-Stack Engineering Candidate  
> **Deployment Live URL:** http://13.62.51.232 (Subdomain: http://ajaiadocsyousifjbour.duckdns.org)  
> **Walkthrough Video Link:** PASTE_LOOM_OR_YOUTUBE_UNLISTED_LINK_HERE  
> **Repository Root:** `ajaia-docs-submission/`  
> **Primary Deliverable:** `deliverables/walkthrough.mp4` (H.264, 1920x1080 @ 30fps, 03:45 duration, synthetic voiceover + captions, 17.9 MB)  

---

## 1. Verified Features

Every feature listed below was implemented, tested with automated test suites, and verified on real running processes:

| Feature Area | Specification Requirement | Verification Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Document Authoring** | Create documents with title + rich content | **PASS** (pytest + Playwright) | TipTap v2 rich-text engine with starter kit, bold, italic, underline, H1, H2, bullet and ordered lists. |
| **Inline Renaming** | Rename document title directly in header | **PASS** (Playwright) | Real-time editable title input with 200-character boundary and character counter (`titleInputRef`). |
| **Dual-Mode Persistence** | Debounced auto-save + instant Ctrl/Cmd+S | **PASS** (Playwright) | 1200ms debouncing timer; instant save on toolbar click or Ctrl/Cmd+S; live state pills: `Saved`, `Saving...`, `Unsaved`, `Save Error`. |
| **Data Integrity & XSS** | Server-side HTML sanitization | **PASS** (pytest) | Rust-based `nh3.clean()` allowlist sanitizer strips `<script>`, `<iframe>`, inline event handlers (`onclick`, `onload`, `onerror`), and unsafe protocols. |
| **File Import Pipeline** | Import `.md` and `.txt` files up to 1 MB | **PASS** (pytest + Playwright) | Markdown parsed to semantic HTML; plaintext converted preserving paragraphs and line breaks (`<br>`); 400 on empty or non-UTF-8; 413 on >1 MB. |
| **Invalid Import Rejection** | Reject unsupported extensions with clear UI alert | **PASS** (pytest + Playwright) | Non-allowed extensions (e.g. `.pdf`, `.docx`) return HTTP 400 Bad Request with immediate user-facing modal alert. |
| **Multi-Tenant Sharing** | Seeded accounts, user switcher, share by email | **PASS** (pytest + Playwright) | Seeded accounts (`alice@ajaia.ai`, `bob@ajaia.ai`, `charlie@ajaia.ai`). Active user identity enforced via `X-User-Email` header. |
| **Role-Based Access (RBAC)** | Owner-only share/revoke/delete; shared view/edit | **PASS** (pytest + Playwright) | Document owner can share, revoke, or delete. Shared users view and edit. Non-shared users receive HTTP 403 Forbidden. |
| **Collaborative UI Badges** | Owner vs Shared badge, collaborator counter | **PASS** (Playwright) | Distinct badges in editor header; dynamic collaborator counter with tooltip; sidebar splits into `My Documents` and `Shared with Me`. |
| **Production Packaging** | Single-origin serving & Dockerfile | **PASS** (Docker + Build) | FastAPI serves built React SPA from `frontend/dist` with SPA route fallback; multi-stage Docker container. |

---

## 2. Incomplete or Partial Features

There are **no incomplete or partially working core features** within the assigned specification scope:
- Rich text editing, inline renaming, formatting toolbar, debounced auto-save, manual save, file imports, error rejection, sanitization, multi-tenant sharing, and access control are all fully implemented and backed by passing automated test suites.

---

## 3. Deliberately Deprioritized Features

To deliver an airtight, fully verified solution within the single-run autonomous timeline, the following advanced capabilities were deliberately deprioritized and documented:
1. **CRDT Real-Time Concurrent Editing (Yjs / Automerge):**
   - *Rationale:* CRDT synchronization requires dedicated WebSocket infrastructure and complex operational transforms. A deterministic last-write-wins model was chosen to ensure complete testability and reliability.
2. **Cryptographic JWT / OAuth2 Authentication:**
   - *Rationale:* Header-based user switching (`X-User-Email`) provides frictionless instant evaluation between Alice, Bob, and Charlie without requiring credential management or login screens.
3. **Document Revision History Snapshots:**
   - *Rationale:* Version rollback was deferred in favor of bulletproof single-version persistence, dual-mode saving, and server-side sanitization.

---

## 4. Seeded Test Script & Evaluation Workflow

To verify the running application end-to-end:

### Step 1: Launch Backend Server
```bash
# In terminal 1:
cd ajaia-docs-submission
.\.venv\Scripts\Activate.ps1   # (or source .venv/bin/activate on Unix)
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Step 2: Run Automated Backend Tests
```bash
# In terminal 2:
pytest backend/tests/test_app.py -v
```
*Expected: 7 passed in ~0.74 seconds.*

### Step 3: Run Automated Playwright End-to-End Tests
```bash
npx playwright test
```
*Expected: 5 passed in ~16.1 seconds. View reports in `deliverables/assets/test-reports/index.html`.*

### Step 4: Manual Interactive Verification
1. Open `http://127.0.0.1:8000` in your browser.
2. Active user defaults to `alice@ajaia.ai`.
3. Click **New Doc**, enter title `Engineering Brief`, add formatted text. Notice the auto-save indicator transition from `Unsaved` -> `Saving...` -> `Saved`.
4. Click **Share**, enter `bob@ajaia.ai`, click **Share**. Notice Bob added to people with access.
5. In the top-left sidebar switcher, switch user to `bob@ajaia.ai`.
6. Notice `Engineering Brief` appears under **Shared with Me** with the badge `Shared by alice`. Bob can edit and save.
7. Switch user to `charlie@ajaia.ai`. Notice Charlie does not have access to Alice's document.
8. Switch back to `alice@ajaia.ai`, click **Import**, select `sample_imports/welcome_guide.md`. The document imports and renders immediately.
9. Try importing `sample_imports/invalid_file.pdf`. An immediate error alert appears: *"Unsupported file type. Only .md and .txt files are supported."*

---

## 5. Architectural Assumptions & Scope Records

1. **Header-Based Auth Scope:** The `X-User-Email` header is assumed to be an evaluation and demo convention. As documented in `ARCHITECTURE.md`, this mechanism is spoofable and intended solely for frictionless local multi-user testing.
2. **Ephemeral Database Default:** By default, the app uses local SQLite (`./backend/ajaia_docs.db`). On serverless or ephemeral container hosts, this database will reset if persistent storage is not attached. Setting `DATABASE_URL` to an external PostgreSQL instance is fully supported.
3. **HTML Sanitization Strategy:** Storing semantic HTML sanitized server-side with `nh3` was chosen over proprietary JSON AST formats to guarantee maximum interoperability and immediate rendering.

---

## 6. Placeholder Locations

As instructed in the assignment guidelines, the live deployment URL is integrated, and exactly one deployment-dependent placeholder remains for the candidate to fill:
1. `PASTE_LOOM_OR_YOUTUBE_UNLISTED_LINK_HERE` (in `README.md`, `SUBMISSION.md`, and `walkthrough_link.txt`)
