import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Contacto() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Contacto</Text>
        <Text style={styles.subtitle}>
          Información general de la aplicación.
        </Text>
        <View style={styles.card}>
          <Dato label="Universidad" value="Universidad CESMAG" />
          <Dato label="Programa" value="Ingeniería de Sistemas" />
          <Dato label="Asignatura" value="Desarrollo Móvil" />
          <Dato label="Correo" value="contacto@ejemplo.com" />
          <Dato label="Ciudad" value="Pasto" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  },
  dataRow: { marginBottom: 15 },
  label: { color: "#A06C80", fontSize: 13, fontWeight: "700" },
  value: { color: "#563C46", fontSize: 17, fontWeight: "600", marginTop: 3 },
});
