import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authError, signIn, signOut, signUp } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { useRegistration } from '@/lib/registration-context';

export default function Usuario() {
  const router = useRouter();
  const { session, loading, profile, profileLoading, error: sessionError } = useAuth();
  const { setRegistration } = useRegistration();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const userId = session?.user.id;
  const metadataName = session?.user.user_metadata?.nombre_completo;
  const displayName = profile?.nombre_completo || (typeof metadataName === 'string' && metadataName ? metadataName : 'Usuario');
  useEffect(() => { setEmail(''); setPassword(''); setName(''); }, [userId]);

  async function submit() {
    if (busyRef.current) return;
    setError(''); setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password || (creating && (!name.trim() || password.length < 8))) {
      setError(creating ? 'Completa tu nombre, un correo válido y una contraseña de al menos 8 caracteres.' : 'Escribe un correo válido y tu contraseña.');
      return;
    }
    busyRef.current = true; setBusy(true);
    try {
      if (creating) {
        const nextSession = await signUp(email, password, name);
        if (!nextSession) setMessage('Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.');
        setCreating(false);
      } else { await signIn(email, password); }
      setPassword('');
    } catch (err) { setError(authError(err)); }
    finally { busyRef.current = false; setBusy(false); }
  }

  async function logout() {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(''); setMessage('');
    try {
      await signOut(); setRegistration(null); setPassword(''); router.replace('/');
    } catch (err) { setError(authError(err)); }
    finally { busyRef.current = false; setBusy(false); }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <Text style={styles.title}>Mi usuario</Text>
        {loading ? <ActivityIndicator accessibilityLabel="Cargando sesión" /> : session ? (
          <View style={styles.card}>
            <Text style={styles.heading}>{displayName}</Text>
            <Dato label="Correo" value={session.user.email} />
            {profileLoading && <ActivityIndicator accessibilityLabel="Cargando perfil" />}
            <Dato label="Teléfono" value={profile?.telefono} />
            <Dato label="Ciudad" value={profile?.ciudad} />
            <Text style={styles.note}>Sesión iniciada en este dispositivo.</Text>
            <Pressable accessibilityRole="button" disabled={busy} onPress={logout} style={[styles.button, busy && styles.disabled]}>
              <Text style={styles.buttonText}>{busy ? 'Cerrando sesión...' : 'Cerrar sesión'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.heading}>{creating ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
            <Text style={styles.note}>Accede para ver tu usuario y administrar tu sesión.</Text>
            {creating && <><Text style={styles.label}>Nombre</Text><TextInput accessibilityLabel="Nombre" placeholder="Tu nombre" maxLength={120} value={name} onChangeText={setName} editable={!busy} style={styles.input} /></>}
            <Text style={styles.label}>Correo</Text>
            <TextInput accessibilityLabel="Correo" placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} value={email} onChangeText={setEmail} editable={!busy} style={styles.input} />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput accessibilityLabel="Contraseña" placeholder="Contraseña" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={creating ? 'new-password' : 'current-password'} value={password} onChangeText={setPassword} editable={!busy} style={styles.input} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.button, busy && styles.disabled]}>
              <Text style={styles.buttonText}>{busy ? 'Procesando...' : creating ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setCreating(!creating); setError(''); setMessage(''); }} style={styles.secondary}>
              <Text style={styles.secondaryText}>{creating ? 'Ya tengo cuenta' : 'Crear una cuenta'}</Text>
            </Pressable>
          </View>
        )}
        {!!(error || sessionError) && <Text accessibilityRole="alert" style={styles.error}>{error || sessionError}</Text>}
        {!!message && <Text accessibilityRole="alert" style={styles.note}>{message}</Text>}
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.secondary}>
          <Text style={styles.secondaryText}>Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dato({ label, value }: { label: string; value?: string | null }) {
  return <View style={styles.data}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value || 'Sin información'}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EC' },
  container: { flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#382B16' },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: '#D7C8B4', gap: 10 },
  heading: { fontSize: 22, fontWeight: '700', color: '#382B16', flexShrink: 1 },
  note: { color: '#685B4F', lineHeight: 22 },
  label: { color: '#685B4F', fontWeight: '700' },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#D7C8B4', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, color: '#382B16' },
  button: { minHeight: 48, padding: 14, backgroundColor: '#846B46', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  secondary: { minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#685B4F', fontWeight: '700', textAlign: 'center' },
  data: { gap: 4 }, value: { color: '#382B16', fontSize: 17, flexShrink: 1 },
  error: { color: '#A12626', lineHeight: 22 }, disabled: { opacity: 0.6 },
});
