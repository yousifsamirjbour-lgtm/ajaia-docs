export interface SubtitleCue {
  startFrame: number;
  endFrame: number;
  text: string;
}

export interface SceneConfig {
  id: string;
  title: string;
  category: string;
  durationInFrames: number;
  bgGradient: string;
  caption: string;
  subtitles: SubtitleCue[];
  bulletPoints?: string[];
  codeSnippet?: string;
  badge?: string;
  mediaFile?: string; // image or recorded clip path
}

export const FPS = 30;

export const SCENES: SceneConfig[] = [
  {
    id: 'intro',
    title: 'Ajaia Docs: AI-Native Document Workspace',
    category: 'Architecture & Overview',
    durationInFrames: 450, // 15s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    caption: 'Welcome to Ajaia Docs. In this walkthrough, I will present the complete AI-native full-stack document system, its architecture, and real operational verification.',
    badge: 'Senior Full Stack Assignment',
    bulletPoints: [
      'Full-Stack Architecture: FastAPI + SQLAlchemy + SQLite / PostgreSQL',
      'Production Frontend: React 18 + TipTap + Vite single-origin bundle',
      'Granular Access Control: Multi-tenant document sharing and server-side RBAC',
      'End-to-End Reliability: Deterministic pytest and Playwright e2e test suites'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 150, text: 'Welcome to Ajaia Docs: an AI-native collaborative document workspace.' },
      { startFrame: 150, endFrame: 300, text: 'Built with a clean FastAPI backend and a responsive React TipTap frontend.' },
      { startFrame: 300, endFrame: 450, text: 'This walkthrough demonstrates real features, test execution, and architectural tradeoffs.' }
    ]
  },
  {
    id: 'main-flow',
    title: 'Rich Text Editing & Formatting Engine',
    category: 'Core Functionality',
    durationInFrames: 750, // 25s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
    caption: 'The editor provides seamless rich-text capabilities with inline title renaming, bold, italic, underline, structured headings, and lists.',
    badge: 'TipTap v2 Integration',
    mediaFile: 'screenshot_02_rich_formatting.png',
    bulletPoints: [
      'Inline document title renaming with 200-character boundary enforcement',
      'Formatting toolbar: Bold, Italic, Underline, H1, H2, Bullet & Ordered lists',
      'Standardized HTML content storage with instant DOM hydration',
      'Fluid cursor focus and keyboard shortcuts for rapid document composition'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 250, text: 'Creating a document provides immediate rich text formatting and inline renaming.' },
      { startFrame: 250, endFrame: 500, text: 'The TipTap engine delivers bold, italic, underline, headings, and clean list hierarchies.' },
      { startFrame: 500, endFrame: 750, text: 'All content is persisted as standard semantic HTML with server-side validation.' }
    ]
  },
  {
    id: 'persistence',
    title: 'Dual-Mode Persistence & Auto-Save',
    category: 'Data Reliability',
    durationInFrames: 600, // 20s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    caption: 'To prevent data loss, the application implements debounced auto-saving combined with instant manual save via toolbar and Ctrl/Cmd+S.',
    badge: 'Debounced Save + Keyboard Shortcuts',
    mediaFile: 'screenshot_03_autosave_indicator.png',
    bulletPoints: [
      '1200ms debounced auto-save triggers smoothly during continuous typing',
      'Manual instant save triggered via button or global Ctrl/Cmd+S shortcut',
      'Live status pill: Saved (green), Saving... (spinner), Unsaved (amber), Error (red)',
      'Persistence verified across hard page reloads and server restarts'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 200, text: 'A debounced auto-save timer catches every change after a 1200 millisecond pause.' },
      { startFrame: 200, endFrame: 400, text: 'Users can also press Control or Command S for immediate synchronous persistence.' },
      { startFrame: 400, endFrame: 600, text: 'Status indicators clearly display whether changes are unsaved, saving, or safely stored.' }
    ]
  },
  {
    id: 'sharing',
    title: 'Multi-Tenant Sharing & Access Control',
    category: 'Security & Collaboration',
    durationInFrames: 900, // 30s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
    caption: 'Granular sharing enforces strict permissions server-side: only owners can share, revoke, or delete; shared collaborators can view and edit.',
    badge: 'Header-Enforced RBAC',
    mediaFile: 'screenshot_04_share_modal.png',
    bulletPoints: [
      'Seeded accounts (alice@ajaia.ai, bob@ajaia.ai, charlie@ajaia.ai) with quick switcher',
      'Owner vs Shared badges with dynamic collaborator counts and tooltips',
      'Owner-only access for sharing modal, revocation, and document deletion',
      'Unauthorized access returns HTTP 403 Forbidden; missing documents return 404'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 300, text: 'The user switcher simulates real enterprise collaboration between Alice, Bob, and Charlie.' },
      { startFrame: 300, endFrame: 600, text: 'When Alice shares with Bob, he sees it under Shared with Me and can collaboratively edit.' },
      { startFrame: 600, endFrame: 900, text: 'Charlie is denied with 403 Forbidden, and revoking Bob immediately removes access.' }
    ]
  },
  {
    id: 'import',
    title: 'Document Ingestion & Sanitization',
    category: 'Data Pipeline',
    durationInFrames: 750, // 25s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #14532d 100%)',
    caption: 'Users can import Markdown (.md) and plain text (.txt) files. All ingested content is rigorously sanitized server-side with nh3.',
    badge: 'nh3 Rust Sanitizer',
    mediaFile: 'screenshot_06_import_modal.png',
    bulletPoints: [
      'Markdown to semantic HTML transformation with headers and lists preserved',
      'Plaintext ingestion with paragraph and line-break preservation',
      'Server-side validation: 400 on unsupported types, empty files, or non-UTF-8 encodings',
      'Strict 1 MB size limit with HTTP 413 Content Too Large enforcement',
      'Rust-based nh3 allowlist sanitizer completely strips script tags and event handlers'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 250, text: 'The import modal accepts Markdown and plaintext files up to one megabyte.' },
      { startFrame: 250, endFrame: 500, text: 'Unsupported files like PDFs, empty files, or non-UTF-8 encodings are rejected with clear errors.' },
      { startFrame: 500, endFrame: 750, text: 'Every byte is sanitized server-side with nh3, eliminating XSS and malicious scripts.' }
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture & Persistence Layer',
    category: 'System Design',
    durationInFrames: 600, // 20s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    caption: 'The system pairs FastAPI with async SQLAlchemy, providing clean schema design and seamless single-origin Docker production deployment.',
    badge: 'SQLAlchemy 2.0 Async + SQLite',
    mediaFile: 'screenshot_05_shared_with_me.png',
    bulletPoints: [
      'Normalized schema: documents and document_shares with cascading delete integrity',
      'Idempotent database seeding automatically initializes sample documents when empty',
      'FastAPI serves API routes and built React static assets from a single unified origin',
      'Multi-stage Dockerfile builds Node assets and serves via Uvicorn in Python 3.11'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 200, text: 'Under the hood, async SQLAlchemy manages SQLite persistence with configurable connection URLs.' },
      { startFrame: 200, endFrame: 400, text: 'Database seeding is idempotent, ensuring instant demo readiness without duplicate entries.' },
      { startFrame: 400, endFrame: 600, text: 'In production, FastAPI serves the built React single-page application from one origin.' }
    ]
  },
  {
    id: 'tradeoffs',
    title: 'Scope Cuts & Engineering Tradeoffs',
    category: 'Pragmatic Decisions',
    durationInFrames: 600, // 20s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #3b0764 100%)',
    caption: 'To maximize reliability and meet the project deadline, specific intentional tradeoffs were made and documented.',
    badge: 'Honest Engineering Assessment',
    bulletPoints: [
      'Header-Based Auth (X-User-Email): Demo-friendly, spoofable, strictly non-production',
      'Last-Write-Wins Concurrency: Prioritized over complex CRDTs/OT for predictable behavior',
      'HTML Storage: Pragmatic portability over proprietary AST or ProseMirror JSON',
      'Ephemeral SQLite: Simple local zero-dependency setup; persistent volume recommended for production'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 200, text: 'Header-based authentication was chosen for frictionless demo switching, but is spoofable in production.' },
      { startFrame: 200, endFrame: 400, text: 'A last-write-wins model was selected over CRDTs to keep synchronization deterministic and fast.' },
      { startFrame: 400, endFrame: 600, text: 'Storing HTML provides maximum portability while relying on nh3 for rigorous sanitization.' }
    ]
  },
  {
    id: 'ai-workflow',
    title: 'Autonomous AI Agent Workflow',
    category: 'Development Process',
    durationInFrames: 750, // 25s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    caption: 'The candidate defined the comprehensive specification, scope, and criteria. The entire implementation was executed autonomously by an AI coding agent.',
    badge: 'Honest Attribution & Workflow',
    bulletPoints: [
      'Candidate Role: Defined detailed specifications, constraints, and acceptance criteria',
      'Agent Execution: Implemented full-stack code, tests, self-review, and video in one autonomous run',
      'Automated Testing: 7 backend pytest suites passed in 0.74s; Playwright e2e deterministic specs',
      'Security Audits: Ran pip-audit (0 vulnerabilities) and npm audit (0 high/critical)'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 250, text: 'The candidate defined the project architecture, constraints, and functional criteria.' },
      { startFrame: 250, endFrame: 500, text: 'Execution, testing, video generation, and hardening were conducted autonomously by the AI agent.' },
      { startFrame: 500, endFrame: 750, text: 'Both pytest and Playwright automated tests ran locally to guarantee absolute correctness.' }
    ]
  },
  {
    id: 'self-review',
    title: 'Agent Self-Review & Hardening',
    category: 'Verification & Fixes',
    durationInFrames: 750, // 25s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #701a75 100%)',
    caption: 'During skeptical self-review, the agent probed edge cases, uncovering and resolving real vulnerabilities.',
    badge: 'Hardening & Edge-Case Fixes',
    mediaFile: 'screenshot_07_invalid_import_error.png',
    bulletPoints: [
      'Issue 1: nh3 link_rel conflict caused 500 on save -> Resolved by passing link_rel=None',
      'Issue 2: Pydantic email validation returned 422 instead of required 400 -> Fixed with custom validator',
      'Issue 3: Plaintext import generated non-standard br tags -> Standardized HTML5 line breaks',
      'Issue 4: Title overflow -> Enforced 200-char client/server truncation and character counter'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 250, text: 'During self-review, the agent uncovered a configuration error in nh3 sanitization.' },
      { startFrame: 250, endFrame: 500, text: 'Pydantic validation returned 422 instead of the required 400 on invalid emails, which was promptly fixed.' },
      { startFrame: 500, endFrame: 750, text: 'All issues were committed separately with automated regression tests verifying the fixes.' }
    ]
  },
  {
    id: 'next-steps',
    title: 'Live Production Deployment & Roadmap',
    category: 'Production Status & Roadmap',
    durationInFrames: 600, // 20s
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)',
    caption: 'The application is deployed and live on AWS with Docker, Nginx, Terraform, and GitHub Actions CI/CD. Future roadmap enhancements are queued as next steps.',
    badge: 'Live in Production • AWS Free Tier',
    bulletPoints: [
      'Live Production URL: Deployed on AWS EC2 (eu-north-1) with Nginx reverse proxy and Docker',
      'Automated CI/CD & Terraform: GitHub Actions pipeline automatically tests and deploys on push to main',
      'Domain & Subdomain: Configured for ajaiadocsyousifjbour.duckdns.org and live public IP',
      'Future Roadmap (2-4h): Production OAuth2/JWT auth, Yjs WebSocket CRDTs, and revision history snapshots'
    ],
    subtitles: [
      { startFrame: 0, endFrame: 200, text: 'Ajaia Docs is live in production on AWS EC2, automated with Terraform and GitHub Actions CI/CD.' },
      { startFrame: 200, endFrame: 400, text: 'Nginx reverse proxies traffic for ajaiadocsyousifjbour and public IP, maintaining zero-cost Free Tier compliance.' },
      { startFrame: 400, endFrame: 600, text: 'Future roadmap items include JWT auth and real-time collaborative cursors. Thank you for your evaluation.' }
    ]
  }
];

export const TOTAL_DURATION_IN_FRAMES = SCENES.reduce((acc, scene) => acc + scene.durationInFrames, 0);
