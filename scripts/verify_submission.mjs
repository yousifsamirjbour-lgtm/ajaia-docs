import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = path.resolve('.')
const BUNDLE_DIR = path.resolve(PROJECT_ROOT, 'SUBMISSION_BUNDLE')
const PRIVATE_DIR_NAME = 'PRIVATE_FOR_CANDIDATE'
const PRIVATE_FILES = ['PROCESS_LOG.md', 'INTERVIEW_BRIEFING.md', 'DEPLOY_CHECKLIST.md']

const ALLOWED_PLACEHOLDERS = [
  'PASTE_LIVE_URL_HERE',
  'PASTE_LOOM_OR_YOUTUBE_UNLISTED_LINK_HERE'
]

const FORBIDDEN_PLACEHOLDER_PATTERNS = [
  /\[INSERT/i,
  /\[YOUR/i,
  /\[TODO/i,
  /TODO:/i,
  /FIXME/i,
  /<INSERT/i,
  /REPLACE_ME/i,
  /TBD/i,
  /PASTE_/i
]

let totalErrors = 0

function logError(msg) {
  console.error(`[FAIL] ${msg}`)
  totalErrors++
}

function logSuccess(msg) {
  console.log(`[PASS] ${msg}`)
}

console.log('====================================================')
console.log('AJAIA SUBMISSION VERIFICATION & LEAK AUDIT')
console.log('====================================================\n')

// 1. Audit PRIVATE_FOR_CANDIDATE location
const siblingPrivate = path.resolve(PROJECT_ROOT, '..', PRIVATE_DIR_NAME)
if (fs.existsSync(siblingPrivate)) {
  logSuccess(`PRIVATE_FOR_CANDIDATE correctly located outside project root at: ${siblingPrivate}`)
} else {
  logError(`PRIVATE_FOR_CANDIDATE was not found at expected sibling path: ${siblingPrivate}`)
}

// 2. Audit that project root and SUBMISSION_BUNDLE do NOT contain PRIVATE_FOR_CANDIDATE
const internalPrivate = path.join(PROJECT_ROOT, PRIVATE_DIR_NAME)
if (fs.existsSync(internalPrivate)) {
  logError(`Project root contains forbidden folder: ${internalPrivate}`)
} else {
  logSuccess('Project root does NOT contain PRIVATE_FOR_CANDIDATE')
}

// Helper to walk directory
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.venv' || entry.name === '.git') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList)
    } else {
      fileList.push(fullPath)
    }
  }
  return fileList
}

// 3. Audit SUBMISSION_BUNDLE if assembled
if (fs.existsSync(BUNDLE_DIR)) {
  console.log(`\nAuditing SUBMISSION_BUNDLE at ${BUNDLE_DIR}...`)
  const bundleFiles = walkDir(BUNDLE_DIR)
  console.log(`Total files in SUBMISSION_BUNDLE: ${bundleFiles.length}`)

  for (const filePath of bundleFiles) {
    const relPath = path.relative(BUNDLE_DIR, filePath)
    const baseName = path.basename(filePath)

    // Check forbidden file names
    if (PRIVATE_FILES.includes(baseName)) {
      logError(`SUBMISSION_BUNDLE contains private candidate file: ${relPath}`)
    }

    if (relPath.includes(PRIVATE_DIR_NAME)) {
      logError(`SUBMISSION_BUNDLE contains path referencing private dir: ${relPath}`)
    }

    // Inspect text files for content leaks
    if (/\.(md|txt|json|jsx|js|ts|tsx|py|html)$/i.test(baseName)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      for (const pFile of PRIVATE_FILES) {
        if (content.includes(pFile)) {
          logError(`File ${relPath} references private file name "${pFile}"`)
        }
      }
      if (content.includes(PRIVATE_DIR_NAME)) {
        logError(`File ${relPath} references "${PRIVATE_DIR_NAME}"`)
      }

      // Check forbidden placeholders in documentation files
      if (/\.(md|txt)$/i.test(baseName)) {
        for (const pattern of FORBIDDEN_PLACEHOLDER_PATTERNS) {
          if (pattern.test(content)) {
            logError(`File ${relPath} contains unresolved placeholder matching ${pattern}`)
          }
        }
      }
    }
  }
} else {
  console.log(`\nSUBMISSION_BUNDLE not yet assembled (will audit prior to final wrap).`)
}

// 4. Audit project root submission docs
console.log('\nAuditing Project Root Submission Documents...')
const rootDocs = ['README.md', 'ARCHITECTURE.md', 'AI_WORKFLOW.md', 'SUBMISSION.md', 'walkthrough_link.txt']
for (const doc of rootDocs) {
  const p = path.join(PROJECT_ROOT, doc)
  if (!fs.existsSync(p)) {
    logError(`Missing required root submission doc: ${doc}`)
    continue
  }
  const content = fs.readFileSync(p, 'utf-8')

  // Check no private leaks
  for (const pFile of PRIVATE_FILES) {
    if (content.includes(pFile)) {
      logError(`Root doc ${doc} references private file "${pFile}"`)
    }
  }
  if (content.includes(PRIVATE_DIR_NAME)) {
    logError(`Root doc ${doc} references "${PRIVATE_DIR_NAME}"`)
  }

  // Check forbidden placeholders
  for (const pattern of FORBIDDEN_PLACEHOLDER_PATTERNS) {
    if (pattern.test(content)) {
      logError(`Root doc ${doc} contains unresolved placeholder matching ${pattern}`)
    }
  }

  // Check line count on SUBMISSION.md
  if (doc === 'SUBMISSION.md') {
    const lines = content.split('\n').length
    if (lines >= 1000) {
      logError(`SUBMISSION.md has ${lines} lines (must be strictly under 1000 lines)`)
    } else {
      logSuccess(`SUBMISSION.md has ${lines} lines (< 1000 lines requirement met)`)
    }
  }

  logSuccess(`Root doc ${doc} passed content audit`)
}

// 5. Summary
console.log('\n====================================================')
if (totalErrors === 0) {
  console.log('AUDIT PASSED: 0 errors detected. Full isolation confirmed.')
  process.exit(0)
} else {
  console.error(`AUDIT FAILED: ${totalErrors} issue(s) detected. Fix before submission.`)
  process.exit(1)
}
