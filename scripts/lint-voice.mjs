#!/usr/bin/env node
/**
 * G-VOICE — lint-voice.mjs
 * Enforces BR-28, BR-31: STRICTLY fails if it finds "I", "Me", "My" (case-sensitive, whole words).
 * Allows "We", "Our", "Us".
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
  console.error('G-VOICE: No HTML files found in dist/. Run astro build first.');
  process.exit(1);
}

// Strictly fail on standalone I, Me, My (and my, myself)
const FORBIDDEN_VOICE = [
  /\bI\b/,
  /\bMe\b/,
  /\bme\b/,
  /\bMy\b/,
  /\bmy\b/,
  /\bmyself\b/i,
];

// Strip exempted elements: <blockquote> and elements with data-voice-exempt
function stripExempted(html) {
  return html
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
    .replace(/<[^>]+data-voice-exempt[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
}

let failures = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf-8');
  const content = stripExempted(raw);
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const text = line.replace(/<[^>]+>/g, ''); // strip tags for text check
    for (const pattern of FORBIDDEN_VOICE) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) {
        console.error(`✗ G-VOICE  ${file}:${idx + 1}  →  ${text.trim().slice(0, 80)}`);
        failures++;
      }
    }
  });
}

if (failures > 0) {
  console.error(`\n✗ G-VOICE failed — ${failures} singular first-person violation(s). Never use "I", "Me", or "My". Use "We/Our" or brand "Shagun".`);
  process.exit(1);
}

console.log('✓ G-VOICE passed — no singular first-person copy ("I", "Me", "My") found.');
