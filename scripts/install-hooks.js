#!/usr/bin/env node
// Installs git hooks from scripts/ into .git/hooks/.
// Runs automatically via the `prepare` npm lifecycle (npm install / npm ci).
// Also callable explicitly: npm run setup

import { copyFileSync, chmodSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const hooksDir = resolve(root, '.git', 'hooks')

if (!existsSync(hooksDir)) {
  // Not a git repo (e.g. docker build context, npm pack) — silently skip.
  process.exit(0)
}

const hooks = [
  { src: 'scripts/pre-commit.sh', dst: 'pre-commit' },
]

for (const { src, dst } of hooks) {
  const srcPath = resolve(root, src)
  const dstPath = resolve(hooksDir, dst)
  copyFileSync(srcPath, dstPath)
  chmodSync(dstPath, 0o755)
  console.log(`install-hooks: installed ${dst}`)
}
