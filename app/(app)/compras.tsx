import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
  type VitrinaSolicitudCompra,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

function formatearPrecio(precio: number) {
  return `$${Number(precio).toLocaleString("es-CO")}`;
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Compras() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<VitrinaSolicitudCompra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarSolicitudes = useCallback(async (refrescar = false) => {
    if (refrescar) setActualizando(true);
    else setCargando(true);
    setError("");

    try {
      if (!supabase) throw new Error(supabaseConfigError);

      const { data: sesionData, error: sesionError } =
        await supabase.auth.getSession();
      if (sesionError) throw sesionError;
      const usuarioId = sesionData.session?.user.id;
      if (!usuarioId) {
        throw new Error("Inicia sesión para consultar tus solicitudes de compra.");
      }

      const { data, error: consultaError } = await supabase
        .from("vitrina_solicitudes_compra")
        .select(
          "id, articulo_id, articulo_nombre, articulo_categoria, articulo_precio, articulo_epoca, usuario_id, comprador_nombre, comprador_telefono, created_at",
        )
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false });

      if (consultaError) throw consultaError;
      setSolicitudes(data ?? []);
    } catch (consultaError) {
      setError(
        consultaError instanceof Error
          ? consultaError.message
          : "No se pudieron cargar tus compras.",
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarSolicitudes();
    }, [cargarSolicitudes]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={solicitudes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => void cargarSolicitudes(true)}
            tintColor="#846B46"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LA VITRINA</Text>
            <Text style={styles.title}>Mis compras</Text>
            <Text style={styles.subtitle}>
              Aquí aparecen los artículos para los que enviaste una solicitud.
            </Text>
            {error && solicitudes.length > 0 ? (
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
                <Text style={styles.emptyText}>Cargando tus solicitudes…</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>
                  {error ? "No se pudieron cargar" : "Todavía no tienes compras"}
                </Text>
                <Text accessibilityRole={error ? "alert" : undefined} style={styles.emptyText}>
                  {error ||
                    "Cuando completes y envíes una solicitud con el botón Comprar, el artículo aparecerá aquí."}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    error ? void cargarSolicitudes() : router.replace("/inicio")
                  }
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {error ? "Intentar de nuevo" : "Explorar artículos"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.category}>{item.articulo_categoria}</Text>
              <Text style={styles.price}>
                {formatearPrecio(item.articulo_precio)}
              </Text>
            </View>
            <Text style={styles.productName}>{item.articulo_nombre}</Text>
            <Text style={styles.period}>{item.articulo_epoca}</Text>
            <View style={styles.divider} />
            <Text style={styles.requestLabel}>Solicitud enviada</Text>
            <Text style={styles.date}>{formatearFecha(item.created_at)}</Text>
          </View>
        )}
        ListFooterComponent={
          solicitudes.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/inicio")}
              style={({ pressed }) => [
                styles.actionButton,
                styles.footerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionButtonText}>Seguir explorando</Text>
            </Pressable>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  listContent: { padding: 20, paddingBottom: 28, flexGrow: 1 },
  header: { marginBottom: 18 },
  eyebrow: {
    color: "#A27B4E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: "#382B16", fontSize: 28, fontWeight: "800", marginTop: 7 },
  subtitle: { color: "#756B5D", fontSize: 15, lineHeight: 22, marginTop: 6 },
  error: { color: "#A23E32", fontSize: 13, lineHeight: 20, marginTop: 12 },
  card: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E5D9C6",
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 13,
    padding: 17,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: { color: "#A27B4E", fontSize: 12, fontWeight: "800" },
  price: { color: "#563D1B", fontSize: 16, fontWeight: "800" },
  productName: {
    color: "#382B16",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 8,
  },
  period: { color: "#756B5D", fontSize: 14, marginTop: 5 },
  divider: { backgroundColor: "#E5D9C6", height: 1, marginVertical: 14 },
  requestLabel: { color: "#563D1B", fontSize: 13, fontWeight: "700" },
  date: { color: "#756B5D", fontSize: 13, marginTop: 4 },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#382B16",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: { color: "#756B5D", lineHeight: 21, marginTop: 10, textAlign: "center" },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#846B46",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  actionButtonText: { color: "#FFFFFF", fontWeight: "800" },
  footerButton: { marginTop: 4 },
  pressed: { opacity: 0.78 },
});
