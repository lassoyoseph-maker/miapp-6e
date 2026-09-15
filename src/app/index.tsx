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

  function confirmPurchase() {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      Alert.alert("Datos incompletos", "Escribe tu nombre y teléfono.");
      return;
    }
    Alert.alert(
      "Solicitud enviada",
      `Gracias, ${buyerName.trim()}. Te contactaremos pronto.`,
    );
    closePurchase();
  }

  function publishProduct() {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert("Datos incompletos", "Escribe el nombre y el precio.");
      return;
    }
    setProducts((current) => [
      {
        id: Date.now(),
        name: newName.trim(),
        category: "Decoración",
        price: `$${newPrice.trim()}`,
        period: "Por verificar",
        image:
          "https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900",
      },
      ...current,
    ]);
    setNewName("");
    setNewPrice("");
    setShowSellForm(false);
    Alert.alert("Artículo publicado", "El artículo ya aparece en el catálogo.");
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
            <Text style={styles.linkButtonText}>Formulario</Text>
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
            <Pressable style={styles.primaryButton} onPress={confirmPurchase}>
              <Text style={styles.primaryButtonText}>Enviar solicitud</Text>
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
