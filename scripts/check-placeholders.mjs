#!/usr/bin/env node
/**
 * G-PLACEHOLDER — check-placeholders.mjs
 * Enforces SEC-009 + BR-29: no placeholder contacts in production builds.
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

const isProd = process.env.NODE_ENV === 'production';
const distDir = join(process.cwd(), 'dist');
const files = walkHtml(distDir);

if (files.length === 0) {
  if (isProd) {
    console.error('G-PLACEHOLDER: No HTML files found in dist/. Run astro build first.');
    process.exit(1);
  }
  console.warn('G-PLACEHOLDER: No dist/ HTML files found. Skipping (dev mode).');
  process.exit(0);
}

const FORBIDDEN = [
  { pattern: /dummy@gmail\.com/gi, label: 'dummy@gmail.com email' },
  { pattern: /instagram\.com\/dummy\b/gi, label: 'instagram.com/dummy handle' },
  { pattern: /example\.com/gi, label: 'example.com domain' },
  { pattern: /\bSarika\b/gi, label: 'legacy brand name "Sarika"' },
  { pattern: /Kota Mehendi Arts/gi, label: 'legacy name "Kota Mehendi Arts"' },
];

let failures = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  for (const { pattern, label } of FORBIDDEN) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      const msg = `Placeholder found — ${label}  in  ${file}`;
      if (isProd) {
        console.error(`✗ G-PLACEHOLDER  ${msg}`);
        failures++;
      } else {
        console.warn(`⚠  G-PLACEHOLDER (dev warning)  ${msg}`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ G-PLACEHOLDER failed — ${failures} placeholder(s) in production build. Deploy blocked.`);
  process.exit(1);
}

if (isProd) {
  console.log('✓ G-PLACEHOLDER passed — no placeholder contacts found.');
} else {
  console.log('✓ G-PLACEHOLDER passed (dev mode — warnings only).');
}
