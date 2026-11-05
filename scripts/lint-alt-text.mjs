#!/usr/bin/env node
/**
 * G-ALT — lint-alt-text.mjs
 * Enforces NFR-014 + BR-20: alt text ≥10 chars on every img; ≥20 gallery images; ≥3 per category.
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
  console.error('G-ALT: No HTML files found in dist/. Run astro build first.');
  process.exit(1);
}

let failures = 0;

// Rule 1: every <img> has non-empty alt >= 10 chars
const imgRe = /<img\s[^>]*>/gi;
const altRe = /\balt="([^"]*)"/i;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const imgs = content.match(imgRe) || [];
  for (const tag of imgs) {
    const altMatch = tag.match(altRe);
    if (!altMatch) {
      console.error(`✗ G-ALT  ${file}  — <img> missing alt attribute: ${tag.slice(0, 80)}`);
      failures++;
    } else if (altMatch[1].trim().length < 10) {
      console.error(`✗ G-ALT  ${file}  — alt too short (${altMatch[1].trim().length} chars): "${altMatch[1]}"`);
      failures++;
    }
  }
}

// Rule 2+3: gallery page image counts
const galleryFile = join(distDir, 'gallery', 'index.html');
let galleryContent = '';
try { galleryContent = readFileSync(galleryFile, 'utf-8'); } catch { /* gallery page may not exist yet */ }

if (galleryContent) {
  const galleryImgs = galleryContent.match(imgRe) || [];
  const categories = ['bridal', 'festival', 'arabic', 'figures', 'designer', 'guest', 'alta'];

  if (galleryImgs.length < 20) {
    console.error(`✗ G-ALT  Gallery page has ${galleryImgs.length} images; need ≥20.`);
    failures++;
  }

  for (const cat of categories) {
    // Count items with data-category matching
    const re = new RegExp(`data-category="${cat}"`, 'gi');
    const matches = galleryContent.match(re) || [];
    if (matches.length > 0 && matches.length < 3) {
      console.error(`✗ G-ALT  Category "${cat}" has ${matches.length} images; need ≥3.`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ G-ALT failed — ${failures} violation(s).`);
  process.exit(1);
}

console.log('✓ G-ALT passed — all images have valid alt text.');
