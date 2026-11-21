# Ajaia Docs Walkthrough Narration Script

**Total Target Duration:** 3 minutes 45 seconds (225 seconds / 6,750 frames at 30 fps)  
**Speaker:** Candidate (presenting the architecture, implementation, and operational verification)  
**Execution Transparency:** The candidate specified requirements, architecture, constraints, and acceptance criteria; an autonomous AI coding agent executed the implementation, testing, self-review, video composition, and documentation in a single run.

---

### Scene 1: Introduction & Architecture (0:00 - 0:15 / Frames 0 - 450)
> "Welcome to Ajaia Docs, an AI-native collaborative document workspace designed for speed, reliable persistence, and clean abstractions. In this walkthrough, I will present the end-to-end full-stack implementation, spanning our asynchronous FastAPI and SQLite backend, our responsive React 18 frontend powered by TipTap, and our comprehensive verification suite. Everything you will see was executed deterministically to demonstrate production-grade reliability."

---

### Scene 2: Core Document Editing & Formatting Engine (0:15 - 0:40 / Frames 450 - 1200)
> "Let's begin in the workspace. Creating a document gives you an immediate rich-text canvas with inline title editing. The title input enforces a strict 200-character boundary with live feedback. Our formatting engine is built on TipTap v2, providing bold, italic, underline, semantic Heading 1 and Heading 2 tags, and structured bulleted and ordered lists. Every edit is represented as clean, semantic HTML, ensuring high portability and seamless rendering."

---

### Scene 3: Dual-Mode Persistence & Auto-Save (0:40 - 1:00 / Frames 1200 - 1800)
> "Document reliability depends on robust persistence. Ajaia Docs implements a dual-mode save strategy: continuous edits trigger a debounced 1200-millisecond auto-save timer, while users can also trigger instant synchronous saves using the toolbar button or the global Control or Command S shortcut. Notice the reactive status indicator transitioning between Saved, Saving, and Unsaved. Even across hard browser reloads and server restarts, every keystroke is safely persisted in our relational store."

---

### Scene 4: Granular Sharing & Access Control (1:00 - 1:30 / Frames 1800 - 2700)
> "Next is our multi-tenant sharing model. Using our workspace switcher, we can toggle between seeded accounts: Alice, Bob, and Charlie. The active user is passed through the `X-User-Email` header and strictly enforced server-side. When Alice creates a document, she is badged as Owner with full sharing and deletion privileges. She shares the document with Bob, who immediately sees it under his 'Shared with Me' list. Bob can edit and collaborate, but cannot delete or re-share. Meanwhile, Charlie is denied access with an HTTP 403 Forbidden. Revoking Bob's share immediately cuts off access, demonstrating true multi-tenant isolation."

---

### Scene 5: Document Import Pipeline & Sanitization (1:30 - 1:55 / Frames 2700 - 3450)
> "To accelerate knowledge migration, Ajaia Docs includes a document import pipeline supporting Markdown and plain text files up to 1 megabyte. Markdown headings, lists, and emphasis are converted into standard HTML, while plain text preserves paragraph structures and line breaks. Invalid file extensions, empty files, non-UTF-8 encodings, or oversized payloads are rejected with clear HTTP 400 and 413 responses. Furthermore, every ingested document is scrubbed server-side using nh3, an ultra-fast Rust-based allowlist sanitizer that strips script tags and event handlers before persistence."

---

### Scene 6: Architecture & Database Design (1:55 - 2:15 / Frames 3450 - 4050)
> "Taking a look under the hood: the backend is powered by FastAPI and SQLAlchemy 2.0 with asynchronous SQLite, configurable via environment variables for easy transition to PostgreSQL. The schema features normalized `documents` and `document_shares` tables with cascading deletes. Database seeding is completely idempotent on startup. In production, FastAPI serves the pre-built React application from a single unified origin, packaged neatly inside a multi-stage Docker container."

---

### Scene 7: Scope Cuts & Engineering Tradeoffs (2:15 - 2:35 / Frames 4050 - 4650)
> "To deliver a solid, deterministic core within the project scope, several conscious tradeoffs were made:
> First, header-based authentication was selected to enable instant persona switching in the demo UI. In production, this would be replaced with JWT or OAuth2.
> Second, a last-write-wins concurrency model was chosen over operational transforms or CRDTs to keep the architecture transparent and predictable.
> Third, storing clean HTML rather than a proprietary AST maximizes interoperability across platforms."

---

### Scene 8: Autonomous AI Execution & Verification (2:35 - 3:00 / Frames 4650 - 5400)
> "To be completely transparent about how this project was delivered: I formulated the full specification, defined architectural constraints, and set acceptance criteria. The execution—including coding the full stack, setting up automated testing, conducting self-review, and building this Remotion walkthrough—was carried out autonomously by an AI coding agent in a single run. We verified every requirement with seven automated backend pytest suites and deterministic Playwright end-to-end tests."

---

### Scene 9: Agent Self-Review & Hardening (3:00 - 3:25 / Frames 5400 - 6150)
> "During the autonomous self-review phase, the agent acted as a skeptical reviewer, stress-testing edge cases. It discovered that `nh3` threw a configuration exception when managing the `rel` attribute alongside default link rels, which was resolved by passing `link_rel=None`. It also found that Pydantic returned HTTP 422 instead of the expected 400 for malformed emails, which was corrected with explicit validation. Each issue was fixed in its own commit with automated regression tests."

---

### Scene 10: Live Production Deployment & Roadmap (3:25 - 3:45 / Frames 6150 - 6750)
> "Ajaia Docs is live in production on AWS, automated with Terraform and GitHub Actions CI/CD. Nginx reverse proxies traffic for our subdomain and live IP within AWS Free Tier. Priorities ahead include JWT authentication and Yjs real-time cursors. Thank you; all deliverables are ready."
