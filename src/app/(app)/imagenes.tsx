import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const imagenes = [
  { id: 1, titulo: "Salas y sofás", uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000" },
  { id: 2, titulo: "Comedores de madera", uri: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1000" },
  { id: 3, titulo: "Espacios para tu hogar", uri: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000" },
];

export default function Imagenes() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Galería</Text>
        <Text style={styles.subtitle}>Inspiración para amoblar tu hogar.</Text>
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
  safeArea: { flex: 1, backgroundColor: "#F7F3EC" },
  container: { padding: 20, width: "100%", maxWidth: 900, alignSelf: "center" },
  title: {
    color: "#544633",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#756B5E",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD4C7",
    marginBottom: 18,
  },
  image: { width: "100%", height: 210 },
  description: { color: "#684552", fontWeight: "700", padding: 14 },
});
