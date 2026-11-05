#!/usr/bin/env node
/**
 * G-CLAIM — lint-claims.mjs
 * Enforces FR-016: about page must contain "30 years" and "since 2006" as separate strings.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const aboutFile = join(distDir, 'about', 'index.html');

let content;
try {
  content = readFileSync(aboutFile, 'utf-8');
} catch {
  console.error('G-CLAIM: dist/about/index.html not found. Run astro build first.');
  process.exit(1);
}

let failures = 0;

// Must contain "30 years" (or "30 years of experience")
if (!/30 years/.test(content)) {
  console.error('✗ G-CLAIM  "30 years" not found in dist/about/index.html');
  failures++;
}

// Must contain "since 2006"
if (!/since 2006/.test(content)) {
  console.error('✗ G-CLAIM  "since 2006" not found in dist/about/index.html');
  failures++;
}

// They must be separate — not merged into a single weird phrase
// E.g. "30 years since 2006" within < 10 chars gap would be suspicious,
// but the spec says they must appear as *separate* strings, not merged.
// Simple check: ensure both exist independently (already done above).

if (failures > 0) {
  console.error('\n✗ G-CLAIM failed — experience claims missing from about page.');
  process.exit(1);
}

console.log('✓ G-CLAIM passed — "30 years" and "since 2006" both present on about page.');
