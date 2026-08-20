import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../theme/tokens.css', import.meta.url), 'utf8');

test('dashboard uses the centralized semantic theme token layer', () => {
  assert.match(html, /theme\/tokens\.css/);
  for (const category of ['intelligence', 'workflow', 'knowledge', 'report', 'action', 'review', 'risk', 'system']) {
    assert.match(css, new RegExp(`--theme-${category}:`));
    assert.match(css, new RegExp(`\\.category-${category}`));
  }
});

test('report and risk cards use distinct non-text semantic treatments', () => {
  assert.match(html, /category-card category-report/);
  assert.match(html, /category-card category-risk/);
  assert.match(css, /category-card::before/);
  assert.match(css, /category-risk[^}]*border-color/);
});

test('theme preserves responsive, contrast, and reduced-motion behavior', () => {
  assert.match(html, /@media\(max-width:570px\)/);
  assert.match(css, /prefers-contrast: more/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
