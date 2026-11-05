#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const gates = [
  'lint-money-terms.mjs',
  'lint-alt-text.mjs',
  'lint-price-format.mjs',
  'lint-team-size.mjs',
  'check-placeholders.mjs',
  'lint-links.mjs',
  'lint-claims.mjs',
  'lint-voice.mjs',
];

let failed = 0;

for (const gate of gates) {
  console.log(`\n▶ ${gate}`);
  const result = spawnSync('node', [`scripts/${gate}`], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`✗ ${gate} failed`);
    failed++;
  } else {
    console.log(`✓ ${gate} passed`);
  }
}

if (failed > 0) {
  console.error(`\n✗ ${failed} gate(s) failed. Deploy blocked.`);
  process.exit(1);
}

console.log('\n✓ All gates passed.');
