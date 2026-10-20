import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type CategoriaArticulo,
  supabase,
  supabaseConfigError,
} from "@/lib/supabase";

const categorias: CategoriaArticulo[] = [
  "Muebles",
  "Arte",
  "Relojes",
  "Decoración",
];

const preparacionesCafe = [
  "Espresso",
  "Filtrado",
  "Prensa francesa",
  "Cold Brew",
  "Otro",
];

const imagenesPorCategoria: Record<CategoriaArticulo, string> = {
  Muebles: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900",
  Arte: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900",
  Relojes: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900",
  Decoración:
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900",
};

export default function Formulario() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ tab?: string }>();

  // Modo: 'articulo' (La Vitrina) o 'cafe' (Coffee App - Lab 2)
  const [modo, setModo] = useState<"articulo" | "cafe">(
    searchParams.tab === "cafe" ? "cafe" : "articulo",
  );

  // Estados para Artículo (La Vitrina)
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<CategoriaArticulo>("Muebles");
  const [precio, setPrecio] = useState("");
  const [epoca, setEpoca] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  // Estados para Coffee Lover (Laboratorio 2)
  const [nombreCafe, setNombreCafe] = useState("");
  const [correoCafe, setCorreoCafe] = useState("");
  const [telefonoCafe, setTelefonoCafe] = useState("");
  const [ciudadCafe, setCiudadCafe] = useState("");
  const [cafeFavorito, setCafeFavorito] = useState("");
  const [tipoPreparacion, setTipoPreparacion] = useState("Filtrado");

  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function guardarArticulo() {
    const precioNumerico = Number(precio.replace(/[.,\s]/g, ""));
    if (!nombre.trim() || !precio.trim() || !epoca.trim()) {
      setMensajeError("Completa el nombre, el precio y la época del artículo.");
      return;
    }
    if (!Number.isSafeInteger(precioNumerico) || precioNumerico <= 0) {
      setMensajeError("Escribe un precio válido en pesos, sin decimales.");
      return;
    }
    const imagen = imagenUrl.trim();
    if (
      imagen &&
      !imagen.startsWith("https://") &&
      !imagen.startsWith("http://")
    ) {
      setMensajeError(
        "La imagen debe tener una dirección que empiece por https://",
      );
      return;
    }
    if (!supabase) {
      setMensajeError(supabaseConfigError);
      return;
    }

    setMensajeError("");
    setGuardando(true);
    try {
      const { data, error } = await supabase
        .from("articulos_vitrina")
        .insert({
          nombre: nombre.trim(),
          categoria,
          precio: precioNumerico,
          epoca: epoca.trim(),
          imagen_url: imagen || imagenesPorCategoria[categoria],
        })
        .select("id, nombre, categoria, precio, epoca, imagen_url")
        .single();

      if (error) throw error;
      router.push({
        pathname: "/resultado",
        params: {
          tipo: "articulo",
          id: String(data.id),
          nombre: data.nombre,
          categoria: data.categoria,
          precio: String(data.precio),
          epoca: data.epoca,
          imagenUrl: data.imagen_url ?? "",
        },
      });
    } catch (error) {
      const errorMessage = obtenerMensajeError(error);
      setMensajeError(
        errorMessage.includes("articulos_vitrina") &&
          errorMessage.toLowerCase().includes("schema cache")
          ? "Falta crear la tabla articulos_vitrina en Supabase. Ejecuta el contenido de supabase/schema.sql en SQL Editor y vuelve a intentar."
          : errorMessage,
      );
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCoffeeLover() {
    if (
      !nombreCafe.trim() ||
      !correoCafe.trim() ||
      !telefonoCafe.trim() ||
      !ciudadCafe.trim() ||
      !cafeFavorito.trim() ||
      !tipoPreparacion.trim()
    ) {
      setMensajeError("Todos los campos de Coffee Lover son obligatorios.");
      return;
    }
    if (!supabase) {
      setMensajeError(supabaseConfigError);
      return;
    }

    setMensajeError("");
    setGuardando(true);
    try {
      const { data, error } = await supabase
        .from("clientes_cafe")
        .insert({
          nombre: nombreCafe.trim(),
          correo: correoCafe.trim().toLowerCase(),
          telefono: telefonoCafe.trim(),
          ciudad: ciudadCafe.trim(),
          cafe_favorito: cafeFavorito.trim(),
          tipo_preparacion: tipoPreparacion.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      router.push({
        pathname: "/resultado",
        params: {
          tipo: "cafe",
          id: String(data.id),
          nombre: data.nombre,
          correo: data.correo,
          telefono: data.telefono,
          ciudad: data.ciudad,
          cafeFavorito: data.cafe_favorito,
          tipoPreparacion: data.tipo_preparacion,
        },
      });
    } catch (error) {
      const errorMessage = obtenerMensajeError(error);
      setMensajeError(
        errorMessage.includes("clientes_cafe") &&
          errorMessage.toLowerCase().includes("schema cache")
          ? "Falta crear la tabla clientes_cafe en Supabase. Ejecuta el contenido de supabase/schema.sql en SQL Editor y vuelve a intentar."
          : errorMessage,
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>
          {modo === "articulo"
            ? "LA VITRINA · NUEVO ARTÍCULO"
            : "LABORATORIO 2 · COFFEE APP"}
        </Text>
        <Text style={styles.title}>
          {modo === "articulo"
            ? "Registrar artículo"
            : "Registrar Coffee Lover"}
        </Text>
        <Text style={styles.subtitle}>
          {modo === "articulo"
            ? "Guarda una pieza del catálogo en la base de datos de Supabase."
            : "Persiste en Supabase nombre, café favorito y tipo de preparación."}
        </Text>

        {/* Selector de modo */}
        <View style={styles.modeTabs}>
          <Pressable
            onPress={() => {
              setModo("articulo");
              setMensajeError("");
            }}
            style={[
              styles.modeTab,
              modo === "articulo" && styles.modeTabSelected,
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                modo === "articulo" && styles.modeTabTextSelected,
              ]}
            >
              Artículo (La Vitrina)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setModo("cafe");
              setMensajeError("");
            }}
            style={[styles.modeTab, modo === "cafe" && styles.modeTabSelected]}
          >
            <Text
              style={[
                styles.modeTabText,
                modo === "cafe" && styles.modeTabTextSelected,
              ]}
            >
              ☕ Coffee Lover (Lab 2)
            </Text>
          </Pressable>
        </View>

        {modo === "articulo" ? (
          <View style={styles.form}>
            <Campo
              label="Nombre del artículo"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Sillón francés de terciopelo"
            />
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.options}>
              {categorias.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: categoria === item }}
                  key={item}
                  onPress={() => setCategoria(item)}
                  style={[
                    styles.option,
                    categoria === item && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      categoria === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Campo
              label="Precio (COP)"
              value={precio}
              onChangeText={setPrecio}
              placeholder="1280000"
              keyboardType="numeric"
            />
            <Campo
              label="Época o antigüedad"
              value={epoca}
              onChangeText={setEpoca}
              placeholder="Ej. Años 50 o Siglo XIX"
            />
            <Campo
              label="URL de imagen (opcional)"
              value={imagenUrl}
              onChangeText={setImagenUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />
            {mensajeError ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {mensajeError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={guardando}
              onPress={() => void guardarArticulo()}
              style={({ pressed }) => [
                styles.button,
                (pressed || guardando) && styles.buttonPressed,
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Guardar en Supabase</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Campo
              label="Nombre"
              value={nombreCafe}
              onChangeText={setNombreCafe}
              placeholder="Ej: Laura Gómez"
            />
            <Campo
              label="Correo"
              value={correoCafe}
              onChangeText={setCorreoCafe}
              placeholder="Ej: laura@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Campo
              label="Teléfono"
              value={telefonoCafe}
              onChangeText={setTelefonoCafe}
              placeholder="Ej: 3001234567"
              keyboardType="phone-pad"
            />
            <Campo
              label="Ciudad"
              value={ciudadCafe}
              onChangeText={setCiudadCafe}
              placeholder="Ej: Pasto"
            />
            <Campo
              label="Café favorito"
              value={cafeFavorito}
              onChangeText={setCafeFavorito}
              placeholder="Ej: Cappuccino"
            />
            <Text style={styles.label}>
              Tipo de preparación (Actividad Final)
            </Text>
            <View style={styles.options}>
              {preparacionesCafe.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: tipoPreparacion === item }}
                  key={item}
                  onPress={() => setTipoPreparacion(item)}
                  style={[
                    styles.option,
                    tipoPreparacion === item && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tipoPreparacion === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
            {mensajeError ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {mensajeError}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={guardando}
              onPress={() => void guardarCoffeeLover()}
              style={({ pressed }) => [
                styles.button,
                (pressed || guardando) && styles.buttonPressed,
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Guardar Coffee Lover en Supabase
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function obtenerMensajeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "No se pudo guardar la información. Revisa la conexión y las políticas de Supabase.";
}

function Campo(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        autoCapitalize={props.autoCapitalize}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#958A7E"
        style={styles.input}
        value={props.value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { padding: 20, paddingBottom: 36 },
  eyebrow: {
    color: "#9B7650",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 8,
  },
  title: { color: "#2B2218", fontSize: 30, fontWeight: "900", marginTop: 7 },
  subtitle: {
    color: "#685B4F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    marginBottom: 16,
  },
  modeTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#EFE6D8",
    alignItems: "center",
  },
  modeTabSelected: {
    backgroundColor: "#846B46",
  },
  modeTabText: {
    color: "#685B4F",
    fontSize: 13,
    fontWeight: "700",
  },
  modeTabTextSelected: {
    color: "#FFFFFF",
  },
  form: {
    backgroundColor: "#FFFAF4",
    borderColor: "#D7C7A8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
  },
  field: { marginBottom: 12 },
  label: { color: "#6D665C", fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: {
    minHeight: 46,
    backgroundColor: "#FFFFFF",
    borderColor: "#D7C8B4",
    borderWidth: 1,
    borderRadius: 5,
    color: "#2B2218",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  option: {
    minHeight: 38,
    justifyContent: "center",
    borderColor: "#D7C8B4",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 11,
  },
  optionSelected: { backgroundColor: "#846B46", borderColor: "#846B46" },
  optionText: { color: "#685B4F", fontSize: 12, fontWeight: "700" },
  optionTextSelected: { color: "#FFFFFF" },
  error: { color: "#9C3434", fontSize: 13, lineHeight: 19, marginTop: 4 },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 5,
    marginTop: 13,
    paddingHorizontal: 16,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  buttonPressed: { opacity: 0.72 },
});
