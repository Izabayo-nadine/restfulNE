/**
 * Smoke-test gateway routes documented in OpenAPI vs live responses.
 * Run with backend: npm run dev (from backend folder), then: node scripts/verify-api-routes.js
 */
import { openApiSpec } from '../gateway/src/openapi-spec.js';

const BASE = process.env.GATEWAY_URL || 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = process.env.SWAGGER_TEST_EMAIL || 'admin@tzw-ltd.com';
const ADMIN_PASSWORD = process.env.SWAGGER_TEST_PASSWORD || 'Admin@12345';

const publicGets = ['/config'];
const publicPosts = [
  { path: '/auth/login', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } },
];

function pathToUrl(template) {
  return `${BASE}${template.replace(/\{[^}]+\}/g, '000000000000000000000001')}`;
}

async function request(method, url, { token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text: text.slice(0, 120) };
}

async function main() {
  const documented = Object.keys(openApiSpec.paths);
  console.log(`OpenAPI documents ${documented.length} paths\n`);

  const results = [];

  for (const p of publicGets) {
    const url = pathToUrl(p);
    const r = await request('GET', url);
    const ok = r.status >= 200 && r.status < 300;
    results.push({ method: 'GET', path: p, status: r.status, ok });
    console.log(`${ok ? '✓' : '✗'} GET ${p} → ${r.status}`);
  }

  let token = null;
  for (const { path, body } of publicPosts) {
    const url = pathToUrl(path);
    const r = await request('POST', url, { body });
    const ok = r.status >= 200 && r.status < 300;
    if (ok && r.json?.data?.token) token = r.json.data.token;
    results.push({ method: 'POST', path, status: r.status, ok });
    console.log(`${ok ? '✓' : '✗'} POST ${path} → ${r.status}`);
  }

  if (!token) {
    console.error('\nNo JWT — seed admin user or set SWAGGER_TEST_EMAIL/PASSWORD. Skipping protected routes.');
    process.exit(1);
  }

  const protectedSmoke = [
    ['GET', '/auth/profile'],
    ['GET', '/auth/users?page=1&limit=5'],
    ['GET', '/extinguishers?page=1&limit=5'],
    ['GET', '/inspections?page=1&limit=5'],
    ['GET', '/maintenance?page=1&limit=5'],
    ['GET', '/reports/dashboard'],
    ['GET', '/reports/inventory'],
    ['GET', '/reports/inspections'],
    ['GET', '/reports/compliance'],
    ['GET', '/reports/maintenance'],
    ['GET', '/notifications?page=1&limit=5'],
    ['GET', '/notifications/unread-count'],
  ];

  for (const [method, path] of protectedSmoke) {
    const url = pathToUrl(path.split('?')[0]) + (path.includes('?') ? '?' + path.split('?')[1] : '');
    const r = await request(method, url, { token });
    const ok = r.status >= 200 && r.status < 400;
    results.push({ method, path, status: r.status, ok });
    console.log(`${ok ? '✓' : '✗'} ${method} ${path} → ${r.status}${!ok ? ` (${r.text})` : ''}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} smoke checks passed`);
  if (failed.length) {
    failed.forEach((f) => console.log('  failed:', f.method, f.path, f.status));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Gateway not reachable. Start backend: cd backend && npm run dev');
  console.error(err.message);
  process.exit(1);
});
