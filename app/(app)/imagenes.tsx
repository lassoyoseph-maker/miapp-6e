import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const imagenes = [
  { id: 1, titulo: "Diseño móvil", uri: "https://picsum.photos/700/420?1" },
  { id: 2, titulo: "Inspiración", uri: "https://picsum.photos/700/420?2" },
  { id: 3, titulo: "Tecnología", uri: "https://picsum.photos/700/420?3" },
];

export default function Imagenes() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Galería</Text>
        <Text style={styles.subtitle}>Imágenes cargadas desde internet.</Text>
        {imagenes.map((item) => (
          <View style={styles.card} key={item.id}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <Text style={styles.description}>{item.titulo}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF7FA" },
  container: { padding: 20 },
  title: {
    color: "#6C4051",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#8A727C",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F2D5E0",
    marginBottom: 18,
  },
  image: { width: "100%", height: 210 },
  description: { color: "#684552", fontWeight: "700", padding: 14 },
});
