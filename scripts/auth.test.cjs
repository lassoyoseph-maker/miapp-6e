const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');

const userId = '11111111-1111-4111-8111-111111111111';
const user = { id: userId, email: 'test@example.invalid', aud: 'authenticated', role: 'authenticated', user_metadata: {}, app_metadata: {} };
const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.testsignature`;
const session = { access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, user };

function service(handler) {
  const requests = [];
  const client = createClient('https://test.supabase.co', 'sb_publishable_test', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async (url, options) => {
      const request = { url: String(url), ...options };
      requests.push(request);
      return handler(request);
    } },
  });
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('src/lib/auth.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: () => ({ getSupabase: () => client }), Error });
  return { api: exports, client, requests };
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' } });

test('sign-in normalizes email but preserves the exact password', async () => {
  const { api, requests } = service(() => json(session));
  const result = await api.signIn(' TEST@example.invalid ', ' password with spaces ');
  assert.equal(result.user.id, userId);
  assert.match(requests[0].url, /token\?grant_type=password/);
  const body = JSON.parse(requests[0].body);
  assert.equal(body.email, 'test@example.invalid');
  assert.equal(body.password, ' password with spaces ');
});

test('signup without a session requires email confirmation and stores only display metadata', async () => {
  const { api, requests } = service(() => json({ user }));
  const result = await api.signUp(' TEST@example.invalid ', 'test-password', ' Test User ');
  assert.equal(result, null);
  assert.deepEqual(JSON.parse(requests[0].body).data, { nombre_completo: 'Test User' });
});

test('logout revokes this device session and removes it from the client', async () => {
  const { api, client, requests } = service(request => request.url.includes('/logout') ? new Response(null, { status: 204 }) : json(session));
  await api.signIn(user.email, 'test-password');
  await api.signOut();
  assert.match(requests[1].url, /logout\?scope=local/);
  assert.equal((await client.auth.getSession()).data.session, null);
});

test('server logout failure is reported while the SDK clears local credentials', async () => {
  const { api, client } = service(request => request.url.includes('/logout') ? json({ msg: 'Server unavailable' }, 500) : json(session));
  await api.signIn(user.email, 'test-password');
  await assert.rejects(api.signOut(), error => error.code === 'local_signout_unconfirmed');
  assert.equal((await client.auth.getSession()).data.session, null);
  assert.match(api.authError({ code: 'local_signout_unconfirmed' }), /sesión local se cerró/);
});

test('profile fetch is restricted to the current user id', async () => {
  const { api, requests } = service(() => json([{ nombre_completo: 'Test', telefono: '3001234567', ciudad: 'Pasto' }]));
  const profile = await api.loadUserProfile(userId);
  assert.equal(profile.nombre_completo, 'Test');
  assert.equal(new URL(requests[0].url).searchParams.get('id'), `eq.${userId}`);
});

test('invalid credentials never become a successful session', async () => {
  const { api, client } = service(() => json({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400));
  await assert.rejects(api.signIn(user.email, 'wrong-password'), error => error.code === 'invalid_credentials');
  assert.equal((await client.auth.getSession()).data.session, null);
  assert.match(api.authError({ code: 'invalid_credentials' }), /no son correctos/);
});
