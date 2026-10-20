import { useRouter } from "expo-router";
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

import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function iniciarSesion() {
    const email = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensaje("Escribe un correo electrónico válido.");
      return;
    }
    if (contrasena.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!supabase) {
      setMensaje("Falta la configuración de Supabase en .env.local.");
      return;
    }

    setMensaje("");
    setEntrando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: contrasena,
      });
      if (error) {
        setMensaje(
          error.message.toLowerCase().includes("email not confirmed")
            ? "Confirma tu correo desde el mensaje de Supabase y vuelve a iniciar sesión."
            : "No pudimos iniciar sesión. Revisa el correo y la contraseña.",
        );
      }
    } catch {
      setMensaje(
        "No pudimos conectar con Supabase. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>V</Text>
          </View>
          <Text style={styles.brandName}>LA VITRINA</Text>
        </View>
        <Text style={styles.eyebrow}>PIEZAS CON HISTORIA</Text>
        <Text style={styles.title}>Bienvenido{`\n`}de nuevo.</Text>
        <Text style={styles.subtitle}>
          Ingresa para descubrir y compartir objetos únicos.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setCorreo}
            placeholder="nombre@correo.com"
            placeholderTextColor="#958A7E"
            style={styles.input}
            value={correo}
          />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="current-password"
            onChangeText={setContrasena}
            onSubmitEditing={() => void iniciarSesion()}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#958A7E"
            secureTextEntry
            style={styles.input}
            value={contrasena}
          />
          {mensaje ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {mensaje}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={entrando}
            onPress={() => void iniciarSesion()}
            style={({ pressed }) => [
              styles.button,
              (pressed || entrando) && styles.pressed,
            ]}
          >
            {entrando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>¿Aún no tienes cuenta?</Text>
          <Pressable onPress={() => router.push("/registro")}>
            <Text style={styles.registerLink}>Crear cuenta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 19,
  },
  brandMarkText: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  brandName: {
    color: "#846B46",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  eyebrow: {
    color: "#9B7650",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 38,
  },
  title: {
    color: "#2B2218",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46,
    marginTop: 8,
  },
  subtitle: {
    color: "#685B4F",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 24,
  },
  form: {
    backgroundColor: "#FFFAF4",
    borderColor: "#D7C7A8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
  },
  label: {
    color: "#6D665C",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderColor: "#D7C8B4",
    borderWidth: 1,
    borderRadius: 5,
    color: "#2B2218",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  error: { color: "#9C3434", fontSize: 13, lineHeight: 19, marginTop: 12 },
  button: {
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 5,
    marginTop: 18,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
  registerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 22,
  },
  registerPrompt: { color: "#685B4F", fontSize: 14 },
  registerLink: {
    color: "#75552E",
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
