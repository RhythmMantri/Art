#!/usr/bin/env node
/**
 * G-LINK — lint-links.mjs
 * Enforces BR-03, BR-06, BR-21: correct wa.me, tel:, mailto: formats.
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
  console.error('G-LINK: No HTML files found in dist/. Run astro build first.');
  process.exit(1);
}

const WA_HREF_RE = /href="(https:\/\/wa\.me\/[^"]+)"/g;
const TEL_HREF_RE = /href="(tel:[^"]+)"/g;
const MAILTO_HREF_RE = /href="(mailto:[^"]+)"/g;
const BLANK_TARGET_RE = /<a\s[^>]*target="_blank"[^>]*>/gi;
const NOOPENER_RE = /rel="[^"]*noopener[^"]*"/i;

// Context words that must appear in the decoded WA text
const CONTEXT_WORDS = ['bridal', 'engagement', 'festival', 'group', 'ghar par', 'sangeet'];

let failures = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');

  // WhatsApp links
  let waMatch;
  WA_HREF_RE.lastIndex = 0;
  while ((waMatch = WA_HREF_RE.exec(content)) !== null) {
    const href = waMatch[1];
    if (!/^https:\/\/wa\.me\/919414829851\?text=.+$/.test(href)) {
      console.error(`✗ G-LINK  ${file}  — bad wa.me URL: ${href}`);
      failures++;
      continue;
    }
    const textParam = new URL(href).searchParams.get('text') || '';
    const decoded = decodeURIComponent(textParam).toLowerCase();
    if (!decoded || !CONTEXT_WORDS.some((w) => decoded.includes(w))) {
      console.error(`✗ G-LINK  ${file}  — WA text missing context word. Decoded: "${decoded.slice(0, 60)}"`);
      failures++;
    }
  }

  // Tel links
  let telMatch;
  TEL_HREF_RE.lastIndex = 0;
  while ((telMatch = TEL_HREF_RE.exec(content)) !== null) {
    const href = telMatch[1];
    if (href !== 'tel:+919414829851') {
      console.error(`✗ G-LINK  ${file}  — bad tel: link: ${href}`);
      failures++;
    }
  }

  // External blank links need noopener noreferrer
  let blankMatch;
  BLANK_TARGET_RE.lastIndex = 0;
  while ((blankMatch = BLANK_TARGET_RE.exec(content)) !== null) {
    const tag = blankMatch[0];
    if (!NOOPENER_RE.test(tag)) {
      console.error(`✗ G-LINK  ${file}  — target="_blank" without rel="noopener noreferrer": ${tag.slice(0, 100)}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ G-LINK failed — ${failures} violation(s).`);
  process.exit(1);
}

console.log('✓ G-LINK passed — all links correctly formatted.');
