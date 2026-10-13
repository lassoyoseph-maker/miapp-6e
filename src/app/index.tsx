import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { connectionError, createProduct, loadProducts, requestPurchase, type Category, type Product } from '@/lib/vitrina';
import { notify } from '@/lib/notify';
import { ScreenModal } from '@/components/screen-modal';
import { useAuth } from '@/lib/auth-context';
import { authError, signOut } from '@/lib/auth';
import { useRegistration } from '@/lib/registration-context';

const categories: Category[] = ['Todos', 'Muebles', 'Arte', 'Relojes', 'Decoración'];

export default function Inicio() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { setRegistration } = useRegistration();
  const [signingOut, setSigningOut] = useState(false);
  const logoutRef = useRef(false);

  async function logout() {
    if (!session || logoutRef.current) return;
    logoutRef.current = true;
    setSigningOut(true);
    try {
      await signOut();
      setRegistration(null);
      closePurchase();
      setShowSellForm(false);
      setNewName(''); setNewPrice('');
    } catch (error) { notify('Cerrar sesión', authError(error)); }
    finally { logoutRef.current = false; setSigningOut(false); }
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function refreshProducts() {
    setLoading(true);
    setLoadError('');
    try { setProducts(await loadProducts()); }
    catch (error) { setLoadError(connectionError(error)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refreshProducts(); }, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSellForm, setShowSellForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const userId = session?.user.id;
  useEffect(() => {
    setSelectedProduct(null); setShowSellForm(false);
    setBuyerName(''); setBuyerPhone(''); setNewName(''); setNewPrice('');
  }, [userId]);

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
    if (savingRef.current) return;
    setSelectedProduct(null);
    setBuyerName("");
    setBuyerPhone("");
  }

  async function confirmPurchase() {
    if (savingRef.current || !selectedProduct) return;
    if (!buyerName.trim() || !/^[+\d][\d\s()-]{6,19}$/.test(buyerPhone.trim())) {
      notify('Datos incompletos', 'Escribe tu nombre y un teléfono válido.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await requestPurchase(selectedProduct.id, buyerName, buyerPhone);
      setSelectedProduct(null);
      setBuyerName('');
      setBuyerPhone('');
      notify('Solicitud enviada', 'Tu solicitud quedó guardada. Te contactaremos pronto.');
    } catch (error) { notify('No se pudo enviar', connectionError(error)); }
    finally { savingRef.current = false; setSaving(false); }
  }

  async function publishProduct() {
    if (savingRef.current) return;
    const price = Number(newPrice.trim());
    if (!newName.trim() || !/^\d+$/.test(newPrice.trim()) || !Number.isSafeInteger(price) || price <= 0 || price > 1000000000) {
      notify('Datos incompletos', 'Escribe el nombre y un precio entero positivo en pesos, sin separadores de miles.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const product = await createProduct(newName, price);
      setProducts(current => [product, ...current]);
      setNewName('');
      setNewPrice('');
      setShowSellForm(false);
      notify('Artículo publicado', 'El artículo quedó guardado en el catálogo.');
    } catch (error) { notify('No se pudo publicar', connectionError(error)); }
    finally { savingRef.current = false; setSaving(false); }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>COMPRA Y VENDE CON HISTORIA</Text>
            <Text style={styles.title}>La Vitrina</Text>
            <Text style={styles.subtitle}>
              Artículos antiguos para nuevos hogares.
            </Text>
          </View>
          <Pressable
            style={styles.sellButton}
            accessibilityRole="button"
            onPress={() => setShowSellForm(true)}
          >
            <Text style={styles.sellButtonText}>+ Vender</Text>
          </Pressable>
        </View>

        <Text style={styles.accountCaption}>{authLoading ? 'Comprobando sesión...' : session ? 'Sesión iniciada' : 'Navegas como invitado'}</Text>
        <View style={styles.accountActions}>
          <Pressable accessibilityRole="button" style={styles.accountButton} onPress={() => router.push('/usuario')}>
            <Text style={styles.linkButtonText}>Ver usuario</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !session || signingOut || authLoading || saving }} disabled={!session || signingOut || authLoading || saving} onPress={logout} style={[styles.accountButton, (!session || signingOut || saving) && styles.pressed]}>
            <Text style={styles.linkButtonText}>{signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o época..."
          placeholderTextColor="#958A7E"
        />
        <View style={styles.filters}>
          {categories.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
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
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artículos disponibles</Text>
          <Text style={styles.count}>{visibleProducts.length}</Text>
        </View>
        {loading && <ActivityIndicator accessibilityLabel="Cargando catálogo" color="#846B46" />}
        {!!loadError && <View><Text accessibilityRole="alert" style={styles.empty}>{loadError}</Text>
          <Pressable onPress={refreshProducts}><Text style={styles.period}>Reintentar conexión</Text></Pressable></View>}
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
                    accessibilityRole="button"
                    onPress={() => setSelectedProduct(product)}
                  >
                    <Text style={styles.buyText}>Comprar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
        {!loading && !loadError && visibleProducts.length === 0 && (
          <Text style={styles.empty}>No hay artículos para esa búsqueda.</Text>
        )}

        <View style={styles.linksRow}>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            onPress={() => router.push("/formulario")}
          >
            <Text style={styles.linkButtonText}>Formulario</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            onPress={() => router.push("/imagenes")}
          >
            <Text style={styles.linkButtonText}>Galería</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            onPress={() => router.push("/contacto")}
          >
            <Text style={styles.linkButtonText}>Contacto</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ScreenModal visible={selectedProduct !== null} onClose={closePurchase} title="Solicitar compra" closeLabel="Cerrar compra" disabled={saving} footer={
        <Pressable accessibilityRole="button" style={[styles.primaryButton, saving && styles.pressed]} disabled={saving} onPress={confirmPurchase}>
          <Text style={styles.primaryButtonText}>{saving ? 'Enviando...' : 'Enviar solicitud'}</Text>
        </Pressable>
      }>
            <Text style={styles.selectedName}>{selectedProduct?.name}</Text>
            <Text style={styles.selectedPrice}>{selectedProduct?.price}</Text>
            <Text style={styles.label}>Tu nombre</Text>
            <TextInput
              maxLength={120}
              editable={!saving}
              style={styles.input}
              value={buyerName}
              onChangeText={setBuyerName}
              placeholder="Nombre completo"
            />
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              maxLength={20}
              editable={!saving}
              style={styles.input}
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              placeholder="300 000 0000"
              keyboardType="phone-pad"
            />
      </ScreenModal>

      <ScreenModal visible={showSellForm} onClose={() => { if (!savingRef.current) setShowSellForm(false); }} title="Publicar artículo" closeLabel="Cerrar publicación" disabled={saving} footer={
        <Pressable accessibilityRole="button" style={[styles.primaryButton, saving && styles.pressed]} disabled={saving} onPress={publishProduct}>
          <Text style={styles.primaryButtonText}>{saving ? 'Guardando...' : 'Publicar'}</Text>
        </Pressable>
      }>
            <Text style={styles.label}>Nombre del artículo</Text>
            <TextInput
              maxLength={120}
              editable={!saving}
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej. Lámpara vintage"
            />
            <Text style={styles.label}>Precio</Text>
            <TextInput
              maxLength={13}
              editable={!saving}
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="450000"
              keyboardType="numeric"
            />
      </ScreenModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { padding: 20, gap: 16, width: '100%', maxWidth: 900, alignSelf: 'center' },
  headerCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 220, minWidth: 0 },
  accountCaption: { color: '#685B4F' },
  accountActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  accountButton: { flexGrow: 1, flexShrink: 1, flexBasis: 130, minHeight: 48, backgroundColor: '#846B46', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
    minHeight: 48,
    justifyContent: "center",
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
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E9DFD1",
  },
  filterActive: { backgroundColor: "#846B46" },
  filterText: { color: "#685B4F", fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  sectionHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
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
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  price: { flexShrink: 1, color: "#563D1B", fontSize: 17, fontWeight: "800" },
  buyButton: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  buyText: { color: "#FFFFFF", fontWeight: "800" },
  empty: { color: "#756B5D", textAlign: "center", padding: 20 },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    marginHorizontal: 4,
    paddingVertical: 4,
    alignSelf: "stretch",
  },
  linkButton: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 100,
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
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: { textAlign: "center", color: "#FFFFFF", fontWeight: "800" },
});
