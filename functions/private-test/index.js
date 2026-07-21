export async function onRequest(context) {
  const request = context.request;
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'Authenticated user';
  const country = request.headers.get('Cf-Ipcountry') || 'Unknown';
  const now = new Date().toISOString();

  const html = `<!doctype html>
<html lang="zh-HK">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>AIOS Private Login Test</title>
<style>
:root{color-scheme:dark;--bg:#07101d;--panel:#0e1a2b;--line:#24364d;--text:#f6f8fb;--muted:#9fb0c5;--green:#5de09a;--blue:#6cacff}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 85% 0,#17385b,transparent 35%),var(--bg);color:var(--text);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif}.card{width:min(680px,calc(100% - 32px));padding:30px;border:1px solid var(--line);border-radius:24px;background:rgba(14,26,43,.95);box-shadow:0 24px 70px rgba(0,0,0,.35)}.status{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border-radius:999px;background:#123d2b;color:#8df0b7;font-weight:800}.dot{width:9px;height:9px;border-radius:50%;background:var(--green)}h1{font-size:clamp(2rem,6vw,3.5rem);line-height:1.03;margin:18px 0 12px;letter-spacing:-.04em}p{color:var(--muted)}dl{display:grid;grid-template-columns:140px 1fr;gap:10px 16px;margin:24px 0;padding:18px;border:1px solid var(--line);border-radius:16px}dt{color:var(--muted)}dd{margin:0;font-weight:750;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}a{display:inline-block;padding:11px 15px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:linear-gradient(135deg,#62e8d5,var(--blue));color:#06101c}.secondary{border:1px solid var(--line);color:var(--text)}small{display:block;color:var(--muted);margin-top:18px}@media(max-width:560px){dl{grid-template-columns:1fr;gap:3px}.card{padding:22px}}
</style>
</head>
<body>
<main class="card">
  <div class="status"><span class="dot"></span>Private access test passed</div>
  <h1>AIOS Private Dashboard</h1>
  <p>你已通過 Cloudflare Access 身份驗證。此頁只用作登入及權限測試，不顯示任何秘密資料。</p>
  <dl>
    <dt>Signed-in email</dt><dd>${escapeHtml(email)}</dd>
    <dt>Access level</dt><dd>Private test user</dd>
    <dt>Request country</dt><dd>${escapeHtml(country)}</dd>
    <dt>Checked at</dt><dd>${escapeHtml(now)}</dd>
  </dl>
  <div class="actions">
    <a class="primary" href="/aios/">Open AIOS Dashboard</a>
    <a class="secondary" href="/cdn-cgi/access/logout">Sign out</a>
  </div>
  <small>Expected result: an unauthorised email is blocked before this page loads; an approved Google account reaches this page.</small>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'no-store, private',
      'x-robots-tag': 'noindex, nofollow',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;'
  })[char]);
}
