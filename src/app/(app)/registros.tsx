import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { connectionError, loadFurnitureRegistrations, type FurnitureRegistration } from '@/lib/vitrina';

export default function Registros() {
  const router = useRouter();
  const [rows, setRows] = useState<FurnitureRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError('');
    loadFurnitureRegistrations().then(data => { if (active) setRows(data); })
      .catch(reason => { if (active) setError(connectionError(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]));
  return <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <FlatList contentContainerStyle={styles.content} data={error ? [] : rows} keyExtractor={row => row.id}
      refreshing={loading} onRefresh={() => setRetry(value => value + 1)}
      ListHeaderComponent={<View><Text style={styles.title}>Mis preferencias de muebles</Text><Text style={styles.text}>Registros guardados en Supabase, visibles únicamente para tu cuenta.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/formulario')}><Text style={styles.buttonText}>Registrar preferencias</Text></Pressable>
        {loading && <ActivityIndicator color="#846B46" />}
        {!!error && <View><Text accessibilityRole="alert" style={styles.text}>{error}</Text><Pressable style={styles.button} onPress={() => setRetry(value => value + 1)}><Text style={styles.buttonText}>Reintentar</Text></Pressable></View>}
      </View>}
      ListEmptyComponent={!loading && !error ? <Text style={styles.text}>Todavía no tienes registros. Completa el formulario para comenzar.</Text> : null}
      renderItem={({ item }) => <View style={styles.card}>
        <Text style={styles.name}>{item.nombre}</Text><Text style={styles.text}>{item.correo}</Text>
        <Text style={styles.text}>Teléfono: {item.telefono} · Ciudad: {item.ciudad}</Text>
        <Text style={styles.text}>Mueble favorito: {item.mueble_favorito}</Text>
        <Text style={styles.text}>Material preferido: {item.material_preferido}</Text>
        <Text style={styles.text}>Registro: {item.id}</Text>
        <Text style={styles.text}>{new Date(item.created_at).toLocaleString('es-CO')}</Text>
      </View>} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F3EC' },
  content: { padding: 20, flexGrow: 1, width: '100%', maxWidth: 700, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#544633', marginBottom: 12 },
  text: { color: '#655B4E', marginBottom: 8, lineHeight: 22 },
  name: { fontSize: 19, fontWeight: '700', color: '#544633', marginBottom: 8 },
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 18, marginBottom: 14 },
  button: { backgroundColor: '#846B46', minHeight: 48, padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 18 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});
