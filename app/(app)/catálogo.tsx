import { useCallback, useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type VitrinaCatalogoItem,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

function formatearPrecio(precio: number | null) {
  if (precio === null) return null;
  return `$${Number(precio).toLocaleString("es-CO")}`;
}

async function consultarCatalogo() {
  if (!supabase) throw new Error(supabaseConfigError);

  const { data, error } = await supabase
    .from("vitrina_catalogo")
    .select("codigo, titulo, descripcion, detalle, precio")
    .order("codigo", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function mensajeDeError(error: unknown, respaldo: string) {
  return error instanceof Error ? error.message : respaldo;
}

export default function Catalogo() {
  const router = useRouter();
  const [contenidos, setContenidos] = useState<VitrinaCatalogoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarCatalogo = useCallback(async (refrescar = false) => {
    if (refrescar) setActualizando(true);
    else setCargando(true);
    setError("");

    try {
      setContenidos(await consultarCatalogo());
    } catch (consultaError) {
      setError(mensajeDeError(consultaError, "No se pudo consultar el catálogo."));
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;

    void consultarCatalogo()
      .then((data) => {
        if (vigente) setContenidos(data);
      })
      .catch((consultaError: unknown) => {
        if (vigente) {
          setError(
            mensajeDeError(consultaError, "No se pudo consultar el catálogo."),
          );
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={contenidos}
        keyExtractor={(item) => item.codigo}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => void cargarCatalogo(true)}
            tintColor="#846B46"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LA VITRINA · ANTIGÜEDADES</Text>
            <Text style={styles.title}>Explora nuestro catálogo</Text>
            <Text style={styles.subtitle}>
              Descubre colecciones con historia, carácter y detalles únicos.
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
                <Text
                  accessibilityRole={error ? "alert" : undefined}
                  style={styles.emptyText}
                >
                  {error || "Todavía no hay colecciones disponibles."}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void cargarCatalogo()}
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
        renderItem={({ item }) => {
          const precio = formatearPrecio(item.precio);

          return (
            <View style={styles.card}>
              <View style={styles.cardHeading}>
                <Text style={styles.code}>{item.codigo}</Text>
                {precio ? <Text style={styles.price}>{precio}</Text> : null}
              </View>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.description}>{item.descripcion}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalles de ${item.titulo}`}
                onPress={() =>
                  router.push({
                    pathname: "/detalle",
                    params: { codigo: item.codigo },
                  })
                }
                style={({ pressed }) => [
                  styles.detailsButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.detailsButtonText}>Ver detalles →</Text>
              </Pressable>
            </View>
          );
        }}
      />
      <Pressable
        accessibilityRole="button"
        disabled={actualizando}
        onPress={() => void cargarCatalogo(true)}
        style={({ pressed }) => [
          styles.refreshButton,
          pressed && styles.pressed,
          actualizando && styles.disabledButton,
        ]}
      >
        <Text style={styles.refreshButtonText}>
          {actualizando ? "Actualizando…" : "Actualizar catálogo"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

export function DetalleProducto() {
  const router = useRouter();
  const { codigo: parametroCodigo } = useLocalSearchParams<{
    codigo?: string | string[];
  }>();
  const codigo = Array.isArray(parametroCodigo)
    ? parametroCodigo[0]
    : parametroCodigo;
  const [contenido, setContenido] = useState<VitrinaCatalogoItem | null>(null);
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
          .from("vitrina_catalogo")
          .select("codigo, titulo, descripcion, detalle, precio")
          .eq("codigo", codigo)
          .maybeSingle();

        if (!vigente) return;
        if (consultaError) setError(consultaError.message);
        else if (!data) setError("No encontramos esta colección en el catálogo.");
        else setContenido(data);
      } catch (consultaError) {
        if (!vigente) return;
        setError(
          consultaError instanceof Error
            ? consultaError.message
            : "No se pudo cargar el detalle del producto.",
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
      <Stack.Screen options={{ title: "Detalle del producto" }} />
      <ScrollView contentContainerStyle={styles.detailContainer}>
        {cargando ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color="#846B46" />
            <Text style={styles.emptyText}>Cargando detalles…</Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No se pudo mostrar el detalle</Text>
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          </View>
        ) : contenido ? (
          <View style={styles.detailCard}>
            <Text style={styles.eyebrow}>COLECCIÓN · {contenido.codigo}</Text>
            <Text style={styles.detailTitle}>{contenido.titulo}</Text>

            <Text style={styles.detailLabel}>Descripción</Text>
            <Text style={styles.detailText}>{contenido.descripcion}</Text>

            <View style={styles.divider} />

            <Text style={styles.detailLabel}>Especificaciones</Text>
            <Text style={styles.detailText}>{contenido.detalle}</Text>

            {contenido.precio !== null ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.detailLabel}>Precio</Text>
                <Text style={styles.detailPrice}>
                  {formatearPrecio(contenido.precio)}
                </Text>
              </>
            ) : null}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/catálogo")}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Volver al catálogo</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  listContent: { padding: 20, paddingBottom: 18, flexGrow: 1 },
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
  cardHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  code: { color: "#A27B4E", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  cardTitle: { color: "#382B16", fontSize: 19, fontWeight: "800", marginTop: 7 },
  description: { color: "#756B5D", fontSize: 14, lineHeight: 21, marginTop: 6 },
  price: { color: "#563D1B", fontSize: 15, fontWeight: "800" },
  detailsButton: { alignSelf: "flex-start", marginTop: 12, paddingVertical: 4 },
  detailsButtonText: { color: "#846B46", fontSize: 14, fontWeight: "800" },
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
  refreshButton: {
    alignItems: "center",
    backgroundColor: "#846B46",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    minHeight: 48,
    borderRadius: 11,
  },
  refreshButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  disabledButton: { opacity: 0.7 },
  detailContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  detailCard: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E5D9C6",
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
  },
  detailTitle: { color: "#382B16", fontSize: 28, fontWeight: "800", marginTop: 9 },
  detailLabel: { color: "#563D1B", fontSize: 14, fontWeight: "800", marginTop: 20 },
  detailText: { color: "#5F574A", fontSize: 15, lineHeight: 24, marginTop: 7 },
  detailPrice: { color: "#846B46", fontSize: 22, fontWeight: "800", marginTop: 7 },
  divider: { backgroundColor: "#E5D9C6", height: 1, marginTop: 20 },
  backButton: {
    alignItems: "center",
    backgroundColor: "#846B46",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
