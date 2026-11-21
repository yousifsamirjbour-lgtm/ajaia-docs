# AI Development Workflow & Self-Review Report

## 1. Tools Used
- **AI Coding Agent:** Antigravity autonomous agentic assistant (Google DeepMind), running single-turn autonomous execution.
- **Python Backend & Test Tooling:**
  - Python 3.14.5 (tested with 3.11+ compatibility)
  - FastAPI 0.115.11
  - SQLAlchemy 2.0.40 (asyncio + aiosqlite)
  - nh3 0.2.21 (Rust-based HTML sanitization engine)
  - pytest 8.3.5 & pytest-asyncio 0.25.3
  - pip-audit 2.7.3 (0 vulnerabilities found)
- **Frontend & E2E Testing Tooling:**
  - Node.js v24.18.0 & npm 11.2.0
  - React 18.3.1
  - TipTap v2 (`@tiptap/react` 2.11.5, `@tiptap/starter-kit` 2.11.5, `@tiptap/extension-underline` 2.11.5)
  - Vite 6.4.6
  - Playwright 1.50.0 (`@playwright/test` with headless Chromium)
  - npm audit (0 high, 0 critical)
- **Programmatic Video Tooling:**
  - Remotion 4.0.260 (`@remotion/cli`, `@remotion/bundler`)
  - FFmpeg 7.0+ (frame verification and encoding)

---

## 2. Roles & Attribution

- **Candidate's Role:**
  The candidate formulated the initial assignment specification, defined the system architecture, established project constraints, set the acceptance criteria, and directed the assignment parameters.
- **AI Agent's Role:**
  The implementation, automated test suites (pytest and Playwright), edge-case self-review, video composition and rendering, and documentation were conceived, coded, tested, debugged, and finalized completely by the AI coding agent in a single autonomous run. No code, review, or manual testing was hand-written or manually executed by the candidate during this run.

---

## 3. Where AI Sped Up the Work

1. **Rapid Full-Stack Scaffolding (10x Acceleration):**
   Within minutes, the agent generated the complete FastAPI asynchronous REST backend, the normalized SQLAlchemy 2.0 data models (`Document`, `DocumentShare`), and the TipTap-powered React 18 application with debounced auto-saving and user switching.
2. **Deterministic Playwright E2E Test Suite Creation:**
   Rather than manually clicking through browser workflows, the agent authored comprehensive end-to-end tests in `e2e/docs.spec.ts` that automatically bootstrap local services, create documents, verify debounced auto-saves, test multi-tenant sharing between Alice and Bob, enforce 403 access denial against Charlie, and validate file import boundaries.
3. **Automated Remotion Walkthrough Video Synthesis:**
   Instead of spending hours screen recording, editing clips, and syncing voiceovers manually, the agent authored a programmatic Remotion React project that captured real Playwright browser interactions, animated UI cards with spring physics, and generated a timed 3:45 walkthrough video (`deliverables/walkthrough.mp4`) with frame-accurate synchronized captions.
4. **Vulnerability & Regression Auditing:**
   Running automated pip-audit and npm audit alongside pytest and Playwright allowed immediate detection of sanitization and schema inconsistencies.

---

## 4. What the Agent Changed or Rejected

During the build and skeptical self-review phases, the agent identified several concrete bugs, specification discrepancies, and UX race conditions. Every adjustment is documented below:

| Initial Approach | Change or Rejection | Why (Root Cause) | How Verified |
| :--- | :--- | :--- | :--- |
| Configured `nh3.clean()` with custom `link_rel` parameter | Rejected custom `link_rel`; passed `link_rel=None` | When `nh3.clean()` receives `link_rel` alongside allowed attributes for tag `<a>`, the Rust binding throws a `ValueError`, crashing the backend with HTTP 500 on save. | Backend pytest test `test_create_and_update_document` caught the 500; verified fix with green test. |
| Standard Pydantic `EmailStr` in request body for sharing | Rejected `EmailStr`; used string field with custom regex validator returning HTTP 400 | Default Pydantic validation failure returns HTTP 422 Unprocessable Entity, whereas the assignment specification explicitly mandates HTTP 400 for malformed emails. | Pytest RBAC test `test_sharing_and_access_control` verified that invalid emails return exact 400 Bad Request. |
| Plaintext import converted newlines using `<br/>` | Changed to standard HTML5 `<br>` tags | XHTML-style self-closing `<br/>` tags caused assertion mismatches against standard HTML5 parsers and Playwright DOM queries. | Backend test `test_import_files` passed across both Markdown and plaintext files. |
| `fetchDocuments()` called `loadDocument()` whenever an active doc was present | Rejected auto-reloading inside `fetchDocuments()`; only verify existence | When `handleCreateDoc` created a document and user immediately began typing, background `fetchDocuments()` completed and clobbered `titleInput` back to "Untitled Document". | Tested inline title renaming in Playwright; verified title "Ajaia Strategic Architecture" persisted cleanly in DB. |
| Single button locator `button:has-text("Share")` in Playwright | Added explicit `#btn-modal-share` and `#btn-share` IDs | Clicking `button:has-text("Share")` caused Playwright strict mode violation because both the header button and modal submit button matched. | Playwright e2e test ran to completion without locator ambiguity errors. |
| Generic `.doc-item:has-text(...)` selector in Playwright tests | Scoped selectors to `.section-my-docs` and `.section-shared-with-me` | When Bob viewed shared documents, identical document titles in multiple sections caused ambiguous selector timeouts. | Playwright sharing test passed deterministically in 16.1s. |
| Unbounded document title input | Added 200-character maximum length on client (`maxLength={200}`) and server (`max_length=200`) | Extreme-length strings distorted the workspace header layout and sidebar rendering. | UI character counter verified in Playwright; Pydantic validation tested against >200 char payloads. |

---

## 5. Verification & Reliability

Correctness, UX quality, and security were verified using real automated test commands:

### Backend Pytest Suite
```powershell
pytest backend/tests/test_app.py -v
```
**Results:** **7 passed in 0.74s**
- `test_create_and_update_document`: Verifies create, read, inline title rename, content update, and timestamp progression.
- `test_sharing_and_access_control`: Verifies 403 Forbidden for unauthorized users, 200 OK after sharing, 403 after revocation, and rejection of non-owner share attempts.
- `test_sharing_validation`: Verifies HTTP 400 on malformed emails, self-sharing, and duplicate shares.
- `test_import_files`: Verifies Markdown to HTML parsing and plaintext newline preservation.
- `test_import_rejections`: Verifies HTTP 400 on unsupported extensions (.pdf), empty files, and HTTP 413 on files > 1 MB.
- `test_html_sanitization`: Verifies server-side `nh3` stripping of `<script>alert(1)</script>`, `<iframe>`, inline `onload`, and `onerror` event handlers.
- `test_health_check`: Verifies `GET /api/health` returns status "ok".

### Playwright End-to-End Suite
```powershell
npx playwright test
```
**Results:** **5 passed in 16.1s**
- `e2e/docs.spec.ts:16:7` › Ajaia Docs E2E Flow › Complete authoring flow: create, inline rename, rich format, reload persistence
- `e2e/docs.spec.ts:46:7` › Ajaia Docs E2E Flow › Dual-mode auto-save: debounced auto-save & Ctrl+S manual save
- `e2e/docs.spec.ts:71:7` › Ajaia Docs E2E Flow › File import workflow: valid markdown/text import & error handling
- `e2e/docs.spec.ts:108:7` › Ajaia Docs E2E Flow › Collaborative multi-tenant sharing: alice -> bob, charlie denied, revocation
- `e2e/smoke.live.spec.ts:12:7` › Live Deployment Smoke Suite › Health check & basic API sanity

### Security & Dependency Audits
- **pip-audit:** Checked 16 Python packages against the PyPA Advisory Database. **Result: 0 known vulnerabilities.**
- **npm audit:** Checked 1,687 packages. **Result: 0 high, 0 critical.** (25 moderate advisories from upstream TipTap DOMPurify dependency GHSA-cp6q-959q-f8rh; neutralized by server-side `nh3` allowlist sanitization).

---

## 6. Where the Agent Struggled & Lessons for Working with AI Agents

1. **Subtle Asynchronous State Clashing in React:**
   - *Challenge:* In React 18, asynchronous state updates in `useEffect` and `useCallback` created race conditions where background document listing clobbered user typing in `titleInput`.
   - *Lesson:* AI agents easily write standard component skeletons, but subtle async timing issues (like stale closures over refs) require explicit event sequencing and careful state boundary enforcement.
2. **Library Configuration Quirks (nh3 `link_rel`):**
   - *Challenge:* The agent initially assumed `nh3` mirrored Python's `bleach` API exactly. The Rust binding threw a `ValueError` when passing `link_rel` with tag attributes.
   - *Lesson:* Real runtime test execution is essential; code that looks syntactically clean can fail on specific library binding behaviors that only runtime errors expose.
3. **Selector Precision in Modern E2E Testing:**
   - *Challenge:* Playwright's strict mode throws errors when multiple elements match a text locator. In collaborative apps with "My Documents" and "Shared with Me", documents share titles across lists.
   - *Lesson:* E2E tests must be architected with semantic scoping (`.section-my-docs .doc-item`) and unique data attributes rather than relying on loose text matches.
