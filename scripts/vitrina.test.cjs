const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { createClient } = require('@supabase/supabase-js');

function service(response, status = 200) {
  const requests = [];
  const client = createClient('https://test.supabase.co', 'sb_publishable_test', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (url, options) => {
      requests.push({ url: String(url), ...options });
      return new Response(response === null ? null : JSON.stringify(response), {
        status, headers: { 'Content-Type': 'application/json' },
      });
    } },
  });
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('src/lib/vitrina.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: () => ({ getSupabase: () => client }), Error });
  return { api: exports, requests };
}

const row = { id: 3, nombre: 'Mesa', categoria: 'Muebles', precio: 895000, epoca: 'Años 40', imagen_url: 'https://example.com/image.jpg' };

test('publishing rejects decimals because the database price column is integer', async () => {
  const { api, requests } = service(row);
  for (const price of [1.5, 0, -1, NaN, Infinity, 1000000001]) {
    await assert.rejects(api.createProduct('Mesa', price), /precio entero positivo/);
  }
  assert.equal(requests.length, 0);
});

test('catalog maps database fields, preserves database IDs and COP prices', async () => {
  const { api, requests } = service([row]);
  const products = await api.loadProducts();
  assert.equal(products[0].id, 3);
  assert.equal(products[0].name, 'Mesa');
  assert.equal(products[0].price, '$895.000');
  assert.match(requests[0].url, /articulos_vitrina/);
  assert.equal(requests[0].method, 'GET');
});

test('publishing persists numeric price and uses the returned database ID', async () => {
  const { api, requests } = service(row);
  const result = await api.createProduct(' Mesa ', 895000);
  assert.equal(result.id, 3);
  const body = JSON.parse(requests[0].body);
  assert.equal(body.nombre, 'Mesa');
  assert.equal(body.precio, 895000);
  assert.equal(body.id, undefined);
  assert.match(requests[0].headers.get('Prefer'), /return=representation/);
});

test('purchase requests contain the real product ID and never request private rows', async () => {
  const { api, requests } = service(null, 201);
  await api.requestPurchase(3, ' Prueba ', ' 3001234567 ');
  assert.match(requests[0].url, /vitrina_solicitudes_compra/);
  assert.deepEqual(JSON.parse(requests[0].body), { articulo_id: 3, nombre: 'Prueba', telefono: '3001234567' });
  assert.equal(requests[0].headers.get('Prefer'), null);
});

test('registration submits only contact fields without reading private data', async () => {
  const { api, requests } = service(null, 201);
  const values = { nombre: 'Prueba', correo: 'prueba@example.com', telefono: '3001234567', ciudad: 'Pasto' };
  await api.registerContact(values);
  assert.match(requests[0].url, /vitrina_registros/);
  assert.deepEqual(JSON.parse(requests[0].body), values);
  assert.equal(requests[0].headers.get('Prefer'), null);
});

test('missing tables and denied RLS propagate as failures instead of success', async () => {
  for (const [code, status] of [['PGRST205', 404], ['42501', 401]]) {
    const { api } = service({ code, message: 'Denied' }, status);
    await assert.rejects(api.requestPurchase(3, 'Prueba', '3001234567'), error => error.code === code);
    await assert.rejects(api.registerContact({}), error => error.code === code);
    assert.match(api.connectionError({ code }), /administrador/);
  }
});

const furniture = { id: 'record-1', nombre: 'Ana', correo: 'ana@example.invalid', telefono: '3001234567', ciudad: 'Pasto', mueble_favorito: 'Mesa', material_preferido: 'Madera', created_at: '2026-10-19T00:00:00Z' };
test('furniture form preserves both preferences and uses the server record', async () => {
 const { api, requests } = service(furniture);
 const { id, created_at, ...input } = furniture;
 const result = await api.saveFurnitureRegistration(input);
 assert.equal(result.id, id);
 assert.equal(result.material_preferido, 'Madera');
 assert.match(requests[0].url, /vitrina_preferencias/);
 assert.deepEqual(JSON.parse(requests[0].body), input);
 assert.equal(JSON.parse(requests[0].body).usuario_id, undefined);
 assert.match(requests[0].headers.get('Prefer'), /return=representation/);
});
test('saved preferences are queried in newest-first order', async () => {
 const { api, requests } = service([furniture]);
 const rows = await api.loadFurnitureRegistrations();
 assert.equal(rows[0].mueble_favorito, 'Mesa');
 assert.match(requests[0].url, /order=created_at.desc/);
});
test('private preference read/write errors cannot become a successful result', async () => {
 const { api } = service({ code: '42501', message: 'Denied' }, 401);
 await assert.rejects(api.loadFurnitureRegistrations(), error => error.code === '42501');
 await assert.rejects(api.saveFurnitureRegistration({}), error => error.code === '42501');
});
