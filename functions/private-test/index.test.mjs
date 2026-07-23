import test from 'node:test';
import assert from 'node:assert/strict';

import { onRequest } from './index.js';

function requestWithHeaders(headers = {}) {
  return new Request('https://example.test/private-test/', { headers });
}

test('renders Cloudflare identity metadata without allowing HTML injection', async () => {
  const response = await onRequest({
    request: requestWithHeaders({
      'Cf-Access-Authenticated-User-Email': 'hudson<script>@example.com',
      'Cf-Ipcountry': 'HK<&'
    })
  });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(html, /hudson&lt;script&gt;@example\.com/);
  assert.match(html, /HK&lt;&amp;/);
  assert.doesNotMatch(html, /hudson<script>/);
});

test('uses non-sensitive fallback labels when optional headers are absent', async () => {
  const response = await onRequest({ request: requestWithHeaders() });
  const html = await response.text();

  assert.match(html, /Authenticated user/);
  assert.match(html, /Unknown/);
  assert.match(html, /\/cdn-cgi\/access\/logout/);
});
