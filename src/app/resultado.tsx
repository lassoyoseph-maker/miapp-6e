import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Resultado() {
  const router = useRouter();
  const { nombre, correo, telefono, ciudad } = useLocalSearchParams<{
    nombre?: string;
    correo?: string;
    telefono?: string;
    ciudad?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Información registrada</Text>
        <Text style={styles.subtitle}>
          Datos recibidos desde el formulario.
        </Text>
        <View style={styles.card}>
          <Dato label="Nombre" value={nombre} />
          <Dato label="Correo" value={correo} />
          <Dato label="Teléfono" value={telefono} />
          <Dato label="Ciudad" value={ciudad} />
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </Pressable>
      </View>
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
  safeArea: { flex: 1, backgroundColor: "#FFF7FA" },
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    color: "#6C4051",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#8A727C",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F2D5E0",
    marginBottom: 18,
  },
  dataRow: { marginBottom: 13 },
  label: { color: "#A06C80", fontSize: 13, fontWeight: "700" },
  value: { color: "#563C46", fontSize: 17, fontWeight: "600", marginTop: 3 },
  button: {
    backgroundColor: "#C96A8B",
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
