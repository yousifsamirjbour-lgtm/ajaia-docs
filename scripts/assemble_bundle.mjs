import fs from 'fs'
import path from 'path'

const ROOT = path.resolve('.')
const BUNDLE = path.resolve(ROOT, 'SUBMISSION_BUNDLE')

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.venv',
  '.git',
  '.pytest_cache',
  '__pycache__',
  'test-results',
  'blob-report',
  'SUBMISSION_BUNDLE'
])

const EXCLUDE_FILES = new Set([
  'ajaia_docs.db',
  '.DS_Store',
  'Thumbs.db'
])

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    const base = path.basename(src)
    if (EXCLUDE_DIRS.has(base)) return
    if (base === 'PRIVATE_FOR_CANDIDATE') {
      throw new Error(`CRITICAL: Attempted to copy PRIVATE_FOR_CANDIDATE into bundle!`)
    }

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src)
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    const base = path.basename(src)
    if (EXCLUDE_FILES.has(base)) return
    if (base.endsWith('.pyc') || base.endsWith('.swp')) return
    if (base === 'PROCESS_LOG.md' || base === 'INTERVIEW_BRIEFING.md' || base === 'DEPLOY_CHECKLIST.md') {
      throw new Error(`CRITICAL: Attempted to copy private candidate file ${base} into bundle!`)
    }

    const parentDir = path.dirname(dest)
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

console.log('Assembling SUBMISSION_BUNDLE...')

// Clean existing bundle
if (fs.existsSync(BUNDLE)) {
  fs.rmSync(BUNDLE, { recursive: true, force: true })
}
fs.mkdirSync(BUNDLE, { recursive: true })

// Items to copy
const ITEMS = [
  'backend',
  'frontend',
  'video',
  'e2e',
  'sample_imports',
  'scripts',
  'deliverables',
  'infra',
  '.github',
  'README.md',
  'ARCHITECTURE.md',
  'AI_WORKFLOW.md',
  'SUBMISSION.md',
  'walkthrough_link.txt',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.prod.yml',
  'requirements.txt',
  'pyproject.toml',
  'playwright.config.ts',
  '.gitignore'
]

for (const item of ITEMS) {
  const srcPath = path.join(ROOT, item)
  const destPath = path.join(BUNDLE, item)
  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${item} -> SUBMISSION_BUNDLE/${item}`)
    copyRecursive(srcPath, destPath)
  } else {
    console.warn(`Warning: Item ${item} does not exist in root yet.`)
  }
}

console.log('SUBMISSION_BUNDLE assembly completed successfully!')
