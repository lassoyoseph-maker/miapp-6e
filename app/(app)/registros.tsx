import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  type ClienteCafe,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

export default function Registros() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ tab?: string }>();

  // Tab actual: 'articulo' o 'cafe'
  const [tab, setTab] = useState<"articulo" | "cafe">(
    searchParams.tab === "cafe" ? "cafe" : "articulo",
  );

  const [articulos, setArticulos] = useState<ArticuloVitrina[]>([]);
  const [clientesCafe, setClientesCafe] = useState<ClienteCafe[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function cargarDatos(refrescar = false) {
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
      if (tab === "articulo") {
        const { data, error } = await supabase
          .from("articulos_vitrina")
          .select("id, nombre, categoria, precio, epoca, imagen_url, created_at")
          .order("id", { ascending: false });

        if (error) setMensajeError(error.message);
        else setArticulos(data ?? []);
      } else {
        const { data, error } = await supabase
          .from("clientes_cafe")
          .select("*")
          .order("id", { ascending: false });

        if (error) setMensajeError(error.message);
        else setClientesCafe((data as ClienteCafe[]) ?? []);
      }
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
  }

  useEffect(() => {
    void cargarDatos();
  }, [tab]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {/* Selector de pestañas */}
      <View style={styles.tabsContainer}>
        <Pressable
          onPress={() => setTab("articulo")}
          style={[styles.tabButton, tab === "articulo" && styles.tabButtonActive]}
        >
          <Text
            style={[
              styles.tabButtonText,
              tab === "articulo" && styles.tabButtonTextActive,
            ]}
          >
            Artículos La Vitrina
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("cafe")}
          style={[styles.tabButton, tab === "cafe" && styles.tabButtonActive]}
        >
          <Text
            style={[
              styles.tabButtonText,
              tab === "cafe" && styles.tabButtonTextActive,
            ]}
          >
            ☕ Coffee Lovers (Lab 2)
          </Text>
        </Pressable>
      </View>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#846B46" />
          <Text style={styles.loadingText}>
            {tab === "articulo"
              ? "Consultando inventario en Supabase..."
              : "Consultando Coffee Lovers en Supabase..."}
          </Text>
        </View>
      ) : tab === "articulo" ? (
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
                onPress={() =>
                  router.push({
                    pathname: "/formulario",
                    params: { tab: "articulo" },
                  })
                }
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
                <Text style={styles.category}>
                  {item.categoria.toUpperCase()}
                </Text>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.period}>{item.epoca}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>
                    {formatearPrecio(item.precio)}
                  </Text>
                  <Text style={styles.recordNumber}>#{item.id}</Text>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={clientesCafe}
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
              <Text style={styles.emptyMark}>☕</Text>
              <Text style={styles.emptyTitle}>
                {mensajeError
                  ? "No se pudieron cargar"
                  : "Aún no hay Coffee Lovers"}
              </Text>
              <Text style={styles.emptyText}>
                {mensajeError ||
                  "Añade personas al registro con su café favorito y tipo de preparación."}
              </Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/formulario",
                    params: { tab: "cafe" },
                  })
                }
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Registrar Coffee Lover</Text>
              </Pressable>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                LABORATORIO 2 · PERSISTENCIA SUPABASE
              </Text>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Coffee Lovers</Text>
                <Text style={styles.count}>{clientesCafe.length}</Text>
              </View>
              <Text style={styles.subtitle}>
                Registros almacenados en la tabla clientes_cafe.
              </Text>
              {mensajeError && clientesCafe.length > 0 ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {mensajeError}
                </Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardCafe}>
              <View style={styles.cardCafeHeader}>
                <Text style={styles.cafeNombre}>{item.nombre}</Text>
                <Text style={styles.recordNumber}>#{item.id}</Text>
              </View>
              <Text style={styles.cafeDetalle}>✉ {item.correo}</Text>
              <Text style={styles.cafeDetalle}>
                📞 {item.telefono} · 📍 {item.ciudad}
              </Text>
              <View style={styles.cafeBadgeRow}>
                <View style={styles.badgeCafe}>
                  <Text style={styles.badgeCafeText}>
                    ☕ {item.cafe_favorito}
                  </Text>
                </View>
                <View style={styles.badgeMetodo}>
                  <Text style={styles.badgeMetodoText}>
                    🌱 {item.tipo_preparacion || "Filtrado"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#EFE6D8",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#846B46",
  },
  tabButtonText: {
    color: "#685B4F",
    fontSize: 13,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 28 },
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
  cardCafe: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5C4CF",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardCafeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cafeNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B4234",
  },
  cafeDetalle: {
    color: "#685B4F",
    fontSize: 13,
    marginBottom: 3,
  },
  cafeBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  badgeCafe: {
    backgroundColor: "#FCEEE9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeCafeText: {
    color: "#844C36",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeMetodo: {
    backgroundColor: "#F3EFE6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeMetodoText: {
    color: "#6B5838",
    fontSize: 12,
    fontWeight: "700",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#685B4F", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 28, paddingHorizontal: 16 },
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
