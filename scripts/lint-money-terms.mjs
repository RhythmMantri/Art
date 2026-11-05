#!/usr/bin/env node
/**
 * G-MONEY — lint-money-terms.mjs
 * Enforces BR-25: no monetary commitment terms in dist/**\/*.html
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function walkHtml(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtml(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const distDir = join(process.cwd(), 'dist');

const FORBIDDEN = [
  // advance — exempt "advance consultation" and "advance booking"
  /\badvance\b(?!\s+(consultation|booking))/gi,
  /\bdeposit\b/gi,
  /\btoken amount\b/gi,
  /\bbooking fee\b/gi,
  /\b25%\b/g,
  /\b50%\b/g,
  /\bearnest money\b/gi,
  /\bpeeshegi\b/gi,
];

const files = walkHtml(distDir);
if (files.length === 0) {
  console.error('G-MONEY: No HTML files found in dist/. Run astro build first.');
  process.exit(1);
}

let failures = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    for (const pattern of FORBIDDEN) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        console.error(`✗ G-MONEY  ${file}:${idx + 1}  →  ${line.trim()}`);
        failures++;
      }
    }
  });
}

if (failures > 0) {
  console.error(`\n✗ G-MONEY failed — ${failures} violation(s). Fix content, do not edit the gate.`);
  process.exit(1);
}

console.log('✓ G-MONEY passed — no monetary commitment terms found.');
