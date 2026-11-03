import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type VitrinaContenido,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

export default function Detalle() {
  const router = useRouter();
  const { codigo: parametroCodigo } = useLocalSearchParams<{
    codigo?: string | string[];
  }>();
  const codigo = Array.isArray(parametroCodigo)
    ? parametroCodigo[0]
    : parametroCodigo;
  const [contenido, setContenido] = useState<VitrinaContenido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;

    async function cargarDetalle() {
      setCargando(true);
      setError("");
      setContenido(null);

      if (!codigo) {
        setError("No se recibió el código de la colección.");
        setCargando(false);
        return;
      }

      if (!supabase) {
        setError(supabaseConfigError);
        setCargando(false);
        return;
      }

      try {
        const { data, error: consultaError } = await supabase
          .from("vitrina_contenidos")
          .select("codigo, titulo, descripcion, detalle")
          .eq("codigo", codigo)
          .maybeSingle();

        if (!vigente) return;
        if (consultaError) setError(consultaError.message);
        else if (!data) setError("No encontramos esa colección en el catálogo.");
        else setContenido(data);
      } catch (consultaError) {
        if (!vigente) return;
        setError(
          consultaError instanceof Error
            ? consultaError.message
            : "No se pudo cargar el detalle de la colección.",
        );
      } finally {
        if (vigente) setCargando(false);
      }
    }

    void cargarDetalle();
    return () => {
      vigente = false;
    };
  }, [codigo]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {cargando ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color="#846B46" />
            <Text style={styles.stateText}>Cargando detalle…</Text>
          </View>
        ) : error ? (
          <View style={styles.state}>
            <Text style={styles.errorTitle}>No se pudo mostrar el detalle</Text>
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : contenido ? (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>COLECCIÓN · {contenido.codigo}</Text>
            <Text style={styles.title}>{contenido.titulo}</Text>
            <Text style={styles.description}>{contenido.descripcion}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>Acerca de esta colección</Text>
            <Text style={styles.detail}>{contenido.detalle}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/catálogo")}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Volver al catálogo</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E5D9C6",
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
  },
  eyebrow: { color: "#A27B4E", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  title: { color: "#382B16", fontSize: 28, fontWeight: "800", marginTop: 9 },
  description: { color: "#756B5D", fontSize: 16, lineHeight: 24, marginTop: 12 },
  divider: { backgroundColor: "#E5D9C6", height: 1, marginVertical: 20 },
  detailLabel: { color: "#563D1B", fontSize: 14, fontWeight: "800" },
  detail: { color: "#5F574A", fontSize: 15, lineHeight: 24, marginTop: 8 },
  state: { alignItems: "center", padding: 24 },
  stateText: { color: "#756B5D", marginTop: 10, textAlign: "center" },
  errorTitle: { color: "#382B16", fontSize: 18, fontWeight: "800", textAlign: "center" },
  errorText: { color: "#A23E32", lineHeight: 21, marginTop: 8, textAlign: "center" },
  button: {
    alignItems: "center",
    backgroundColor: "#846B46",
    borderRadius: 10,
    marginTop: 18,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
