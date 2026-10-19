import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegistration } from '@/lib/registration-context';

export default function Resultado() {
  const router = useRouter();
  const { registration, setRegistration } = useRegistration();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const saved = registration && registration.id === id ? registration : null;
  const { nombre, correo, telefono, ciudad } = saved ?? {};

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{saved ? 'Información registrada' : 'Sin registro reciente'}</Text>
        <Text style={styles.subtitle}>
          {saved ? 'Datos guardados en la base de datos.' : 'Completa el formulario para registrar tus datos.'}
        </Text>
        <View style={styles.card}>
          <Dato label="Registro" value={saved?.id} />
          <Dato label="Mueble favorito" value={saved?.mueble_favorito} />
          <Dato label="Material preferido" value={saved?.material_preferido} />
          <Dato label="Nombre" value={nombre} />
          <Dato label="Correo" value={correo} />
          <Dato label="Teléfono" value={telefono} />
          <Dato label="Ciudad" value={ciudad} />
        </View>
        <Pressable style={[styles.button, { marginBottom: 12 }]} onPress={() => router.push('/registros')}><Text style={styles.buttonText}>Ver mis registros</Text></Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => { setRegistration(null); router.replace('/'); }}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dato({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Sin información"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F3EC" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20, width: "100%", maxWidth: 640, alignSelf: "center" },
  title: {
    color: "#544633",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#756B5E",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD4C7",
    marginBottom: 18,
  },
  dataRow: { marginBottom: 13 },
  label: { color: "#776548", fontSize: 13, fontWeight: "700" },
  value: { color: "#544633", fontSize: 17, fontWeight: "600", marginTop: 3 },
  button: {
    backgroundColor: "#846B46",
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
