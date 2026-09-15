import { useRouter } from "expo-router";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const menuOptions = [
  {
    title: "Formulario",
    route: "/formulario" as const,
  },
  {
    title: "Galería",
    route: "/imagenes" as const,
  },
  {
    title: "Contacto",
    route: "/contacto" as const,
  },
];

function OpcionMenu({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}
    >
      <Text style={styles.menuTitle}>{title}</Text>
    </Pressable>
  );
}

export default function Inicio() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={require("@/assets/inicio.jpg")}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.eyebrow}>COFFEE APP</Text>
            <Text style={styles.heroTitle}>Coffee House</Text>
            <Text style={styles.heroSubtitle}>
              Descubre aromas, sabores y experiencias alrededor del café.
            </Text>
          </View>
        </View>

        <View style={styles.welcome}>
          <View>
            <Text style={styles.welcomeTitle}>Hola, amante del café</Text>
            <Text style={styles.welcomeText}>¿Qué deseas explorar hoy?</Text>
          </View>
          <Text style={styles.coffeeIcon}>☕</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>3</Text>
            <Text style={styles.summaryLabel}>Secciones</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>100%</Text>
            <Text style={styles.summaryLabel}>Experiencia</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Explora la aplicación</Text>
        <View style={styles.menuGrid}>
          {menuOptions.map((option) => (
            <OpcionMenu
              key={option.title}
              title={option.title}
              onPress={() => router.push(option.route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF7FA" },
  container: { padding: 20, gap: 16 },
  hero: { height: 240, overflow: "hidden", borderRadius: 22 },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    padding: 22,
    backgroundColor: "rgba(43, 24, 18, 0.42)",
  },
  eyebrow: {
    color: "#F7D9B5",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 5,
  },
  heroSubtitle: {
    color: "#FFF7F0",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  welcome: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F2D5E0",
  },
  welcomeTitle: { color: "#6C4051", fontSize: 18, fontWeight: "800" },
  welcomeText: { color: "#8A727C", marginTop: 5 },
  coffeeIcon: { fontSize: 34 },
  summary: {
    backgroundColor: "#F8E8EE",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: { alignItems: "center", minWidth: 110 },
  summaryNumber: { color: "#6C4051", fontSize: 22, fontWeight: "800" },
  summaryLabel: { color: "#8A727C", marginTop: 3 },
  divider: { width: 1, height: 34, backgroundColor: "#E0B8C6" },
  sectionTitle: {
    color: "#563C46",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch",
  },
  menuCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F2D5E0",
  },
  menuTitle: {
    color: "#563C46",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: { opacity: 0.72 },
});
