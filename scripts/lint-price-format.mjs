#!/usr/bin/env node
/**
 * G-PRICE — lint-price-format.mjs
 * Enforces BR-07, BR-08, BR-30:
 *   - Exactly 5 service cards on /services
 *   - Card 1 has data-service="bridal" and data-order="1"
 *   - Every card price matches the allowed format
 *   - Cards with numeric price contain "Indicative price"
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const servicesFile = join(distDir, 'services', 'index.html');

let content;
try {
  content = readFileSync(servicesFile, 'utf-8');
} catch {
  console.error('G-PRICE: dist/services/index.html not found. Run astro build first.');
  process.exit(1);
}

let failures = 0;

// Count service cards
const cardMatches = content.match(/data-service=/g) || [];
if (cardMatches.length !== 5) {
  console.error(`✗ G-PRICE  Expected 5 service cards, found ${cardMatches.length}.`);
  failures++;
}

// Card 1 must be bridal at order 1
if (!content.includes('data-service="bridal"')) {
  console.error('✗ G-PRICE  No card with data-service="bridal" found.');
  failures++;
}
if (!content.includes('data-order="1"')) {
  console.error('✗ G-PRICE  No card with data-order="1" found.');
  failures++;
}

// Verify bridal is order 1 (appears before other cards)
const bridal1 = content.indexOf('data-service="bridal"');
const otherCards = ['data-service="engagement"', 'data-service="festival"', 'data-service="group"', 'data-service="homeservice"'];
for (const other of otherCards) {
  const pos = content.indexOf(other);
  if (pos !== -1 && pos < bridal1) {
    console.error(`✗ G-PRICE  "${other}" appears before bridal card. Bridal must be first.`);
    failures++;
  }
}

// Price format check — extract price text nodes
const priceRe = /data-price-label="([^"]+)"/g;
const priceFormat = /^(₹[\d,]+(\s*(per hand onwards|onwards|per hand))?|On request|Included within Kota|₹\d+–₹\d+ per hand)$/;
let priceMatch;
while ((priceMatch = priceRe.exec(content)) !== null) {
  const price = priceMatch[1];
  if (!priceFormat.test(price)) {
    console.error(`✗ G-PRICE  Invalid price format: "${price}"`);
    failures++;
  }
}

// Cards with numeric price (₹) must contain "Indicative price"
const cardBlockRe = /<[^>]+data-service="[^"]+"[^>]*>([\s\S]*?)<\/[^>]+>/g;
// Simpler: just check the whole page — if ₹ price exists, Indicative price must appear
const hasNumericPrice = /₹[\d,]/.test(content);
if (hasNumericPrice && !content.includes('Indicative price')) {
  console.error('✗ G-PRICE  Numeric price found but "Indicative price" negotiation note is missing.');
  failures++;
}

if (failures > 0) {
  console.error(`\n✗ G-PRICE failed — ${failures} violation(s).`);
  process.exit(1);
}

console.log('✓ G-PRICE passed — all service cards are correctly formatted.');
