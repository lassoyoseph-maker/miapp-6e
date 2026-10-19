// Read-only checks. No customer records are retrieved or created.
import { createClient } from '@supabase/supabase-js';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Configura .env.local con las variables de .env.example.');

const checks = [
  ['Autenticación', '/auth/v1/settings'],
  ['Catálogo', '/rest/v1/articulos_vitrina?select=id,nombre,categoria,precio,epoca,imagen_url&limit=0'],
  ['Registro', '/rest/v1/vitrina_registros?select=id&limit=0', true],
  ['Preferencias privadas', '/rest/v1/vitrina_preferencias?select=id&limit=0', true],
  ['Compras', '/rest/v1/vitrina_solicitudes_compra?select=id&limit=0', true],
];
let failed = false;
for (const [name, path, privateTable] of checks) {
  try {
    const response = await fetch(`${url}${path}`, {
      headers: { apikey: key }, signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    // Intake tables deliberately deny SELECT. A permission error confirms existence.
    const ok = privateTable ? body.code === '42501' : response.ok;
    console.log(`${ok ? 'OK' : 'ERROR'} ${name}: HTTP ${response.status}${body.code ? ` (${body.code})` : ''}`);
    if (!ok) failed = true;
  } catch { console.log(`ERROR ${name}: conexión no disponible`); failed = true; }
}
if (failed) process.exitCode = 1;
const { error, status } = await createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
}).from('articulos_vitrina').select('id,nombre,categoria,precio,epoca,imagen_url').limit(0);
console.log(`${error ? 'ERROR' : 'OK'} SDK Supabase: HTTP ${status}`);
if (error) process.exitCode = 1;
