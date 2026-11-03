import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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

export default function Catalogo() {
  const router = useRouter();
  const [contenidos, setContenidos] = useState<VitrinaContenido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarContenidos = useCallback(async (refrescar = false) => {
    if (refrescar) setActualizando(true);
    else setCargando(true);
    setError("");

    if (!supabase) {
      setError(supabaseConfigError);
      setCargando(false);
      setActualizando(false);
      return;
    }

    try {
      const { data, error: consultaError } = await supabase
        .from("vitrina_contenidos")
        .select("codigo, titulo, descripcion, detalle")
        .order("codigo", { ascending: true });

      if (consultaError) setError(consultaError.message);
      else setContenidos(data ?? []);
    } catch (consultaError) {
      setError(
        consultaError instanceof Error
          ? consultaError.message
          : "No se pudo consultar el catálogo.",
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    void cargarContenidos();
  }, [cargarContenidos]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={contenidos}
        keyExtractor={(item) => item.codigo}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => void cargarContenidos(true)}
            tintColor="#846B46"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LA VITRINA · COLECCIONES</Text>
            <Text style={styles.title}>Catálogo</Text>
            <Text style={styles.subtitle}>
              Explora las colecciones y descubre la historia detrás de cada una.
            </Text>
            {error && contenidos.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {cargando ? (
              <>
                <ActivityIndicator size="large" color="#846B46" />
                <Text style={styles.emptyText}>Cargando el catálogo…</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>
                  {error ? "No se pudo cargar el catálogo" : "Catálogo vacío"}
                </Text>
                <Text accessibilityRole={error ? "alert" : undefined} style={styles.emptyText}>
                  {error || "Todavía no hay colecciones disponibles."}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void cargarContenidos()}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.retryText}>Intentar de nuevo</Text>
                </Pressable>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${item.titulo}`}
            onPress={() =>
              router.push({ pathname: "/detalle", params: { codigo: item.codigo } })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardTop}>
              <Text style={styles.code}>{item.codigo}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.description}>{item.descripcion}</Text>
            <Text style={styles.more}>Ver detalle</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  listContent: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  header: { marginBottom: 18 },
  eyebrow: {
    color: "#A27B4E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: "#382B16", fontSize: 30, fontWeight: "800", marginTop: 6 },
  subtitle: { color: "#756B5D", fontSize: 15, lineHeight: 22, marginTop: 6 },
  error: { color: "#A23E32", fontSize: 13, marginTop: 12 },
  card: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E5D9C6",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  code: { color: "#A27B4E", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  arrow: { color: "#846B46", fontSize: 28, lineHeight: 30 },
  cardTitle: { color: "#382B16", fontSize: 19, fontWeight: "800", marginTop: 5 },
  description: { color: "#756B5D", fontSize: 14, lineHeight: 21, marginTop: 7 },
  more: { color: "#846B46", fontSize: 13, fontWeight: "800", marginTop: 14 },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: { color: "#382B16", fontSize: 18, fontWeight: "800", textAlign: "center" },
  emptyText: { color: "#756B5D", lineHeight: 21, marginTop: 10, textAlign: "center" },
  retryButton: {
    backgroundColor: "#846B46",
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
