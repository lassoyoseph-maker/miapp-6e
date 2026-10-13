import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('Falta configurar la conexión. Copia .env.example a .env y reinicia Expo.');
  }
  if (!client) {
    client = createClient(url, key, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage, lock: processLock } : {}),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input, init) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);
          const abort = () => controller.abort();
          init?.signal?.addEventListener('abort', abort, { once: true });
          if (init?.signal?.aborted) controller.abort();
          try {
            return await fetch(input, { ...init, signal: controller.signal });
          } finally {
            clearTimeout(timer);
            init?.signal?.removeEventListener('abort', abort);
          }
        },
      },
    });
  }
  return client;
}
