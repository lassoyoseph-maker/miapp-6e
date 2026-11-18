import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type ArticuloVitrina,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

export default function Registros() {
  const router = useRouter();
  const [articulos, setArticulos] = useState<ArticuloVitrina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const cargarDatos = useCallback(async (refrescar = false) => {
    if (refrescar) setActualizando(true);
    else setCargando(true);
    setMensajeError("");

    if (!supabase) {
      setMensajeError(supabaseConfigError);
      setCargando(false);
      setActualizando(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("articulos_vitrina")
        .select("id, nombre, categoria, precio, epoca, imagen_url, created_at")
        .order("id", { ascending: false });

      if (error) setMensajeError(error.message);
      else setArticulos(data ?? []);
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No se pudieron consultar los registros de Supabase.",
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#846B46" />
          <Text style={styles.loadingText}>
            Consultando inventario en Supabase...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={articulos}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => void cargarDatos(true)}
            tintColor="#846B46"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyMark}>◇</Text>
            <Text style={styles.emptyTitle}>
              {mensajeError ? "No se pudieron cargar" : "Aún no hay artículos"}
            </Text>
            <Text style={styles.emptyText}>
              {mensajeError ||
                "Registra la primera pieza para iniciar el inventario en Supabase."}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/formulario")}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Registrar nuevo artículo</Text>
            </Pressable>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LA VITRINA · INVENTARIO</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Artículos registrados</Text>
              <Text style={styles.count}>{articulos.length}</Text>
            </View>
            <Text style={styles.subtitle}>
              Piezas guardadas permanentemente en PostgreSQL.
            </Text>
            {mensajeError && articulos.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {mensajeError}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imagen_url ? (
              <Image source={{ uri: item.imagen_url }} style={styles.image} />
            ) : null}
            <View style={styles.cardContent}>
              <Text style={styles.category}>{item.categoria.toUpperCase()}</Text>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.period}>{item.epoca}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{formatearPrecio(item.precio)}</Text>
                <Text style={styles.recordNumber}>#{item.id}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  listContent: { paddingHorizontal: 18, paddingBottom: 28, flexGrow: 1 },
  header: { paddingTop: 14, paddingBottom: 14 },
  eyebrow: {
    color: "#9B7650",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  title: { color: "#2B2218", fontSize: 27, fontWeight: "900", flexShrink: 1 },
  count: {
    minWidth: 28,
    textAlign: "center",
    overflow: "hidden",
    backgroundColor: "#E9DFD1",
    color: "#846B46",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "800",
  },
  subtitle: { color: "#685B4F", fontSize: 14, lineHeight: 20, marginTop: 5 },
  error: { color: "#9C3434", fontSize: 13, lineHeight: 19, marginTop: 10 },
  card: {
    backgroundColor: "#FFFAF4",
    borderColor: "#D7C7A8",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14,
  },
  image: { width: "100%", height: 190, backgroundColor: "#E9DFD1" },
  cardContent: { padding: 16 },
  category: {
    color: "#A27B4E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  name: { color: "#382B16", fontSize: 18, fontWeight: "800", marginTop: 5 },
  period: { color: "#756B5D", fontSize: 13, marginTop: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  price: { color: "#563D1B", fontSize: 17, fontWeight: "800" },
  recordNumber: { color: "#8B7457", fontSize: 12, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#685B4F", fontSize: 14 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 28,
    paddingHorizontal: 16,
  },
  emptyMark: { color: "#846B46", fontSize: 38 },
  emptyTitle: {
    color: "#382B16",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: {
    color: "#756B5D",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 5,
  },
  retryButton: {
    minHeight: 42,
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 5,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
