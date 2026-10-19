import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Contacto() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Contacto</Text>
        <Text style={styles.subtitle}>
          La Vitrina · Tienda de muebles
        </Text>
        <View style={styles.card}>
          <Dato label="Tienda" value="La Vitrina · Muebles y complementos" />
          <Dato label="Universidad" value="Universidad CESMAG" />
          <Dato label="Programa" value="Ingeniería de Sistemas" />
          <Dato label="Asignatura" value="Desarrollo Móvil" />
          <Dato label="Atención" value="Envía tus datos desde Preferencias o solicita la compra de un mueble desde Inicio." />
          <Dato label="Ciudad" value="Pasto" />
        </View>
      </ScrollView>
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
  },
  dataRow: { marginBottom: 15 },
  label: { color: "#776548", fontSize: 13, fontWeight: "700" },
  value: { color: "#544633", fontSize: 17, fontWeight: "600", marginTop: 3 },
});
