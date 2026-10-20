import { getSupabase } from './supabase';

export type UserProfile = { nombre_completo: string | null; telefono: string | null; ciudad: string | null };

export function authError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'user_already_exists' || code === 'email_exists' ||
      (error as { message?: string })?.message === 'User already registered') {
    return 'Correo registrado. Inicia sesión con tu cuenta.';
  }
  if (code === 'invalid_credentials') return 'El correo o la contraseña no son correctos.';
  if (code === 'email_not_confirmed') return 'Confirma tu correo antes de iniciar sesión.';
  if (code === 'weak_password') return 'Elige una contraseña más segura.';
  if (code === 'local_signout_unconfirmed') return 'La sesión local se cerró, pero no se pudo confirmar el cierre en el servidor.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'Espera unos minutos antes de intentarlo de nuevo.';
  if (error instanceof Error && error.message.startsWith('Falta configurar')) return error.message;
  return 'No se pudo completar la operación. Revisa tu conexión e inténtalo de nuevo.';
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  return data.session;
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim().toLowerCase(), password,
    options: { data: { nombre_completo: name.trim() } },
  });
  if (error) throw error;
  // With confirmation enabled, an existing confirmed account can be returned
  // as an obfuscated user with no identities instead of an API error.
  if (!data.session && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw Object.assign(new Error('User already registered'), { code: 'user_already_exists' });
  }
  return data.session;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut({ scope: 'local' });
  // This SDK version removes local credentials even when server revocation fails.
  if (error) throw Object.assign(new Error('Server sign-out could not be confirmed'), { code: 'local_signout_unconfirmed', cause: error });
}

export async function loadUserProfile(userId: string) {
  const { data, error } = await getSupabase().from('perfiles_usuario')
    .select('nombre_completo,telefono,ciudad').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}
