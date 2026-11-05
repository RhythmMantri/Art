#!/usr/bin/env node
/**
 * G-TEAM — lint-team-size.mjs
 * Enforces BR-01: no team size disclosure in headings/paragraphs/list items.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function walkHtml(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) results.push(...walkHtml(full));
    else if (e.isFile() && e.name.endsWith('.html')) results.push(full);
  }
  return results;
}

const distDir = join(process.cwd(), 'dist');
const files = walkHtml(distDir);

if (files.length === 0) {
  console.error('G-TEAM: No HTML files found in dist/. Run astro build first.');
  process.exit(1);
}

// Patterns to check, scoped to text nodes in p, h1-h6, li only
const FORBIDDEN_PATTERNS = [
  /\bteam of \d+\b/gi,
  /\b\d+ artists?\b/gi,
  /\b\d+ team members\b/gi,
  /\bup to \d+ guests\b/gi,
];

// Extract text from inline elements only (p, h1-h6, li)
const TEXT_TAGS_RE = /<(p|h[1-6]|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;

let failures = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  let tagMatch;
  TEXT_TAGS_RE.lastIndex = 0;
  while ((tagMatch = TEXT_TAGS_RE.exec(content)) !== null) {
    const text = tagMatch[2].replace(/<[^>]+>/g, ''); // strip inner tags
    for (const pattern of FORBIDDEN_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        console.error(`✗ G-TEAM  ${file}  — "${text.trim().slice(0, 80)}"`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ G-TEAM failed — ${failures} violation(s).`);
  process.exit(1);
}

console.log('✓ G-TEAM passed — no team size disclosures found.');
