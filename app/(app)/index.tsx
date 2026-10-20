import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Category = "Todos" | "Muebles" | "Arte" | "Relojes" | "Decoración";
type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "Todos">;
  price: string;
  period: string;
  image: string;
};

const categories: Category[] = [
  "Todos",
  "Muebles",
  "Arte",
  "Relojes",
  "Decoración",
];
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Sillón francés de terciopelo",
    category: "Muebles",
    price: "$1.280.000",
    period: "Años 50",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900",
  },
  {
    id: 2,
    name: "Reloj de bolsillo mecánico",
    category: "Relojes",
    price: "$780.000",
    period: "Años 20",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900",
  },
  {
    id: 3,
    name: "Jarrón cerámico artesanal",
    category: "Decoración",
    price: "$460.000",
    period: "Años 70",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900",
  },
  {
    id: 4,
    name: "Grabado botánico enmarcado",
    category: "Arte",
    price: "$620.000",
    period: "Siglo XIX",
    image: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900",
  },
];

export default function Inicio() {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSellForm, setShowSellForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const visibleProducts = useMemo(() => {
    const text = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const matchesSearch =
        !text ||
        `${product.name} ${product.period}`.toLowerCase().includes(text);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  function closePurchase() {
    setSelectedProduct(null);
    setBuyerName("");
    setBuyerPhone("");
  }

  async function confirmPurchase() {
    if (!selectedProduct) return;

    const nombre = buyerName.trim();
    const telefono = buyerPhone.trim();
    const precio = Number(selectedProduct.price.replace(/[^\d]/g, ""));

    if (!nombre || !telefono) {
      Alert.alert("Datos incompletos", "Escribe tu nombre y teléfono.");
      return;
    }
    if (!/^[+0-9][0-9 ()-]{6,19}$/.test(telefono)) {
      Alert.alert("Teléfono no válido", "Revisa el número e inténtalo de nuevo.");
      return;
    }
    if (!Number.isSafeInteger(precio) || precio <= 0) {
      Alert.alert("Artículo no válido", "No se pudo leer el precio del artículo.");
      return;
    }
    if (!supabase) {
      Alert.alert("Sin conexión", "No está configurada la conexión con Supabase.");
      return;
    }

    setEnviandoSolicitud(true);
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { error } = await supabase.from("vitrina_solicitudes_compra").insert({
        articulo_id: null,
        articulo_nombre: selectedProduct.name,
        articulo_categoria: selectedProduct.category,
        articulo_precio: precio,
        articulo_epoca: selectedProduct.period,
        usuario_id: sessionData.session?.user.id ?? null,
        comprador_nombre: nombre,
        comprador_telefono: telefono,
      });
      if (error) throw error;

      Alert.alert(
        "Solicitud enviada",
        "Gracias, " + nombre + ". Te contactaremos pronto.",
      );
      closePurchase();
    } catch (error) {
      Alert.alert(
        "No se pudo guardar la solicitud",
        error instanceof Error
          ? error.message
          : "Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  async function publishProduct() {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert("Datos incompletos", "Escribe el nombre y el precio.");
      return;
    }
    const cleanPrice = Number(newPrice.replace(/[^\d]/g, "")) || 450000;
    const defaultImage =
      "https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900";

    if (supabase) {
      try {
        await supabase.from("articulos_vitrina").insert({
          nombre: newName.trim(),
          categoria: "Decoración",
          precio: cleanPrice,
          epoca: "Por verificar",
          imagen_url: defaultImage,
        });
      } catch (err) {
        console.log("Error guardando en Supabase:", err);
      }
    }

    setProducts((current) => [
      {
        id: Date.now(),
        name: newName.trim(),
        category: "Decoración",
        price: `$${cleanPrice.toLocaleString("es-CO")}`,
        period: "Por verificar",
        image: defaultImage,
      },
      ...current,
    ]);
    setNewName("");
    setNewPrice("");
    setShowSellForm(false);
    Alert.alert(
      "Artículo publicado",
      "El artículo se guardó en Supabase y ya aparece en el catálogo.",
    );
  }

  async function cerrarSesion() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("No se pudo cerrar sesión", error.message);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>COMPRA Y VENDE CON HISTORIA</Text>
            <Text style={styles.title}>La Vitrina</Text>
            <Text style={styles.subtitle}>
              Artículos antiguos para nuevos hogares.
            </Text>
          </View>
          <Pressable
            style={styles.sellButton}
            onPress={() => setShowSellForm(true)}
          >
            <Text style={styles.sellButtonText}>+ Vender</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o época..."
          placeholderTextColor="#958A7E"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.filter, category === item && styles.filterActive]}
            >
              <Text
                style={[
                  styles.filterText,
                  category === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artículos disponibles</Text>
          <Text style={styles.count}>{visibleProducts.length}</Text>
        </View>
        <View style={styles.grid}>
          {visibleProducts.map((product) => (
            <View key={product.id} style={styles.card}>
              <Image source={{ uri: product.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.category}>
                  {product.category.toUpperCase()}
                </Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.period}>{product.period}</Text>
                <View style={styles.footer}>
                  <Text style={styles.price}>{product.price}</Text>
                  <Pressable
                    style={styles.buyButton}
                    onPress={() => setSelectedProduct(product)}
                  >
                    <Text style={styles.buyText}>Comprar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
        {visibleProducts.length === 0 && (
          <Text style={styles.empty}>No hay artículos para esa búsqueda.</Text>
        )}

        <View style={styles.linksRow}>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/formulario")}
          >
            <Text style={styles.linkButtonText}>Registrar artículo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/imagenes")}
          >
            <Text style={styles.linkButtonText}>Galería</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/contacto")}
          >
            <Text style={styles.linkButtonText}>Contacto</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.vitrinaLink,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/registros")}
        >
          <Text style={styles.vitrinaLinkText}>
            La Vitrina · Registros de artículos
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.coffeeLink,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push({
              pathname: "/registros",
              params: { tab: "cafe" },
            })
          }
        >
          <Text style={styles.coffeeLinkText}>
            ☕ Coffee Lovers (Laboratorio 2)
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => void cerrarSesion()}
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={selectedProduct !== null}
        transparent
        animationType="slide"
        onRequestClose={closePurchase}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar compra</Text>
              <Pressable onPress={closePurchase}>
                <Text style={styles.close}>X</Text>
              </Pressable>
            </View>
            <Text style={styles.selectedName}>{selectedProduct?.name}</Text>
            <Text style={styles.selectedPrice}>{selectedProduct?.price}</Text>
            <Text style={styles.label}>Tu nombre</Text>
            <TextInput
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Nombre completo"
            />
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              placeholder="300 000 0000"
              keyboardType="phone-pad"
            />
            <Pressable
              disabled={enviandoSolicitud}
              style={styles.primaryButton}
              onPress={() => void confirmPurchase()}
            >
              <Text style={styles.primaryButtonText}>
                {enviandoSolicitud ? "Guardando solicitud..." : "Enviar solicitud"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSellForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSellForm(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publicar artículo</Text>
              <Pressable onPress={() => setShowSellForm(false)}>
                <Text style={styles.close}>X</Text>
              </Pressable>
            </View>
            <Text style={styles.label}>Nombre del artículo</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej. Lámpara vintage"
            />
            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="450000"
              keyboardType="numeric"
            />
            <Pressable style={styles.primaryButton} onPress={publishProduct}>
              <Text style={styles.primaryButtonText}>Publicar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    color: "#9B7650",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: { color: "#2B2218", fontSize: 36, fontWeight: "800", marginTop: 4 },
  subtitle: { color: "#685B4F", fontSize: 15, marginTop: 3 },
  sellButton: {
    backgroundColor: "#846B46",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  sellButtonText: { color: "#FFFFFF", fontWeight: "800" },
  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D7C8B4",
    color: "#221C14",
  },
  filters: { gap: 8 },
  filter: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E9DFD1",
  },
  filterActive: { backgroundColor: "#846B46" },
  filterText: { color: "#685B4F", fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { color: "#382B16", fontSize: 20, fontWeight: "800" },
  count: { color: "#846B46", fontWeight: "800" },
  grid: { gap: 14 },
  card: {
    backgroundColor: "#FFFAF4",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D7C7A8",
  },
  image: { width: "100%", height: 190 },
  cardContent: { padding: 15 },
  category: {
    color: "#A27B4E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  productName: {
    color: "#382B16",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
  },
  period: { color: "#756B5D", marginTop: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  price: { color: "#563D1B", fontSize: 17, fontWeight: "800" },
  buyButton: {
    backgroundColor: "#846B46",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  buyText: { color: "#FFFFFF", fontWeight: "800" },
  empty: { color: "#756B5D", textAlign: "center", padding: 20 },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginHorizontal: 4,
    paddingVertical: 4,
    alignSelf: "stretch",
  },
  linkButton: {
    flex: 1,
    flexBasis: 0,
    minHeight: 44,
    backgroundColor: "#846B46",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  vitrinaLink: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7C7A8",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  vitrinaLinkText: { color: "#563D1B", fontSize: 13, fontWeight: "700" },
  coffeeLink: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCEEE9",
    borderWidth: 1,
    borderColor: "#E5C4CF",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  coffeeLinkText: { color: "#844C36", fontSize: 13, fontWeight: "700" },
  signOut: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D7C7A8",
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  signOutText: { color: "#563D1B", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43, 34, 22, 0.45)",
  },
  modal: {
    backgroundColor: "#FFFDF8",
    padding: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    gap: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { color: "#382B16", fontSize: 22, fontWeight: "800" },
  close: { color: "#846B46", fontSize: 18, fontWeight: "800", padding: 5 },
  selectedName: {
    color: "#563D1B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  selectedPrice: { color: "#846B46", fontWeight: "800", marginBottom: 8 },
  label: { color: "#6D665C", fontSize: 13, fontWeight: "700", marginTop: 7 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7C8B4",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  primaryButton: {
    backgroundColor: "#846B46",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800" },
});
