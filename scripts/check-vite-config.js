#!/usr/bin/env node
// TD-013: Reject process.env references inside a vite.config.js define block.
// Run via: npm run pre-commit
// Also called by the .git/hooks/pre-commit hook.

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'vite.config.js');

if (!existsSync(configPath)) {
  console.error('check-vite-config: vite.config.js not found at', configPath);
  process.exit(1);
}

const content = readFileSync(configPath, 'utf8');

// Detect `define:` blocks that reference process.env — these inline env var
// values into the compiled JS bundle, which can expose backend-only secrets.
//
// Patterns caught:
//   define: { 'process.env.FOO': ... }
//   define: { ...process.env }
//   define({ 'process.env': ... })
const defineProcessPattern = /define\s*[:({\[][^}]*process\s*\.\s*env/s;
const bareProcessEnvInDefine = /['"]process\.env/;

let failed = false;

if (defineProcessPattern.test(content)) {
  console.error('');
  console.error('SECURITY ERROR (TD-013): vite.config.js contains a `define` block that');
  console.error('references `process.env`. This inlines environment variable VALUES into');
  console.error('the compiled frontend bundle, which can expose backend-only secrets.');
  console.error('');
  console.error('What to fix:');
  console.error('  - Remove any `process.env.*` references from the `define:` section of');
  console.error('    vite.config.js.');
  console.error('  - Use Vite\'s built-in VITE_ prefix convention instead:');
  console.error('    only variables named VITE_* are safe to expose to the frontend.');
  console.error('  - Backend-only variables (TRADES_API_KEY, HRW_API_KEY, etc.) must');
  console.error('    never appear in a define block.');
  console.error('');
  failed = true;
}

if (!failed && bareProcessEnvInDefine.test(content)) {
  console.error('');
  console.error('SECURITY ERROR (TD-013): vite.config.js contains \'process.env\' as a');
  console.error('string key inside a define block. This leaks environment variable names');
  console.error('into the bundle. Remove this pattern and use VITE_* prefixed variables.');
  console.error('');
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('check-vite-config: vite.config.js passed — no unsafe process.env define patterns found.');
process.exit(0);
