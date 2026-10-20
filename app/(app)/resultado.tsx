import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Resultado() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tipo?: string | string[];
    id?: string | string[];
    nombre?: string | string[];
    categoria?: string | string[];
    precio?: string | string[];
    epoca?: string | string[];
    imagenUrl?: string | string[];
    correo?: string | string[];
    telefono?: string | string[];
    ciudad?: string | string[];
    cafeFavorito?: string | string[];
    tipoPreparacion?: string | string[];
  }>();

  const esCafe =
    valor(params.tipo) === "cafe" || Boolean(valor(params.cafeFavorito));

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>
          {esCafe
            ? "LABORATORIO 2 · REGISTRO EXITOSO"
            : "LA VITRINA · REGISTRO GUARDADO"}
        </Text>
        <Text style={styles.title}>
          {esCafe ? "Coffee Lover registrado" : "Artículo registrado"}
        </Text>
        <Text style={styles.subtitle}>
          {esCafe
            ? "Los datos se guardaron permanentemente en PostgreSQL (Supabase)."
            : "La pieza ya está guardada en la base de datos de La Vitrina."}
        </Text>

        <View style={styles.card}>
          <Text style={styles.recordId}>Registro #{valor(params.id)}</Text>

          {esCafe ? (
            <>
              <Dato label="Nombre" value={valor(params.nombre)} />
              <Dato label="Correo" value={valor(params.correo)} />
              <Dato label="Teléfono" value={valor(params.telefono)} />
              <Dato label="Ciudad" value={valor(params.ciudad)} />
              <Dato label="Café favorito" value={valor(params.cafeFavorito)} />
              <Dato
                label="Tipo de preparación"
                value={valor(params.tipoPreparacion) || "Filtrado"}
              />
            </>
          ) : (
            <>
              <Dato label="Artículo" value={valor(params.nombre)} />
              <Dato label="Categoría" value={valor(params.categoria)} />
              <Dato
                label="Precio"
                value={formatearPrecio(valor(params.precio))}
              />
              <Dato label="Época" value={valor(params.epoca)} />
              <Dato
                label="Imagen"
                value={
                  valor(params.imagenUrl) ? "Imagen vinculada" : "Sin imagen"
                }
              />
            </>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/registros",
              params: esCafe ? { tab: "cafe" } : { tab: "articulo" },
            })
          }
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>
            {esCafe ? "Ver Coffee Lovers" : "Ver artículos registrados"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          style={styles.homeButton}
        >
          <Text style={styles.homeText}>Volver al inicio</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function valor(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function formatearPrecio(value: string) {
  const precio = Number(value);
  return Number.isFinite(precio)
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(precio)
    : "Sin información";
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Sin información"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { flex: 1, justifyContent: "center", padding: 20 },
  eyebrow: {
    color: "#9B7650",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  title: {
    color: "#2B2218",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#685B4F",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFAF4",
    borderColor: "#D7C7A8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    marginBottom: 16,
  },
  recordId: {
    color: "#846B46",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 14,
  },
  dataRow: { marginBottom: 11 },
  label: { color: "#8B7457", fontSize: 12, fontWeight: "700" },
  value: { color: "#382B16", fontSize: 15, fontWeight: "600", marginTop: 3 },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 5,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  homeButton: { alignItems: "center", padding: 14 },
  homeText: { color: "#846B46", fontWeight: "700" },
  pressed: { opacity: 0.72 },
});
