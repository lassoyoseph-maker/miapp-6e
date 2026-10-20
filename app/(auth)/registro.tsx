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

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [registroCompleto, setRegistroCompleto] = useState(false);

  async function crearCuenta() {
    const email = correo.trim().toLowerCase();
    const numeroTelefono = telefono.replace(/\D/g, "");

    if (nombre.trim().length < 2) {
      setMensaje("Escribe tu nombre completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensaje("Escribe un correo electrónico válido.");
      return;
    }
    if (numeroTelefono.length < 7 || numeroTelefono.length > 15) {
      setMensaje("Escribe un teléfono válido, con entre 7 y 15 dígitos.");
      return;
    }
    if (ciudad.trim().length < 2) {
      setMensaje("Escribe tu ciudad.");
      return;
    }
    if (
      contrasena.length < 8 ||
      !/[a-z]/.test(contrasena) ||
      !/[A-Z]/.test(contrasena) ||
      !/\d/.test(contrasena)
    ) {
      setMensaje(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      );
      return;
    }
    if (contrasena !== confirmacion) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }
    if (!supabase) {
      setMensaje("Falta la configuración de Supabase en .env.local.");
      return;
    }

    setMensaje("");
    setRegistrando(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        options: {
          data: {
            nombre_completo: nombre.trim(),
            telefono: numeroTelefono,
            ciudad: ciudad.trim(),
          },
        },
      });

      if (error) throw error;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setRegistroCompleto(true);
      setMensaje(
        data.session
          ? "Cuenta creada. Ahora inicia sesión con tu correo y contraseña."
          : "Cuenta creada. Si Supabase solicita confirmación, revisa tu correo y luego inicia sesión.",
      );
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta. Intenta de nuevo.",
      );
    } finally {
      setRegistrando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.backLink}
        >
          <Text style={styles.backText}>← Volver al inicio de sesión</Text>
        </Pressable>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>V</Text>
          </View>
          <Text style={styles.brandName}>LA VITRINA</Text>
        </View>
        <Text style={styles.eyebrow}>UNA CUENTA PARA TUS HALLAZGOS</Text>
        <Text style={styles.title}>Crea tu cuenta.</Text>
        <Text style={styles.subtitle}>
          Registra tus datos para entrar a La Vitrina.
        </Text>

        <View style={styles.form}>
          <Campo
            label="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej. Ana María López"
            autoComplete="name"
          />
          <Campo
            label="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            placeholder="nombre@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Campo
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3001234567"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Campo
            label="Ciudad"
            value={ciudad}
            onChangeText={setCiudad}
            placeholder="Ej. Pasto"
          />
          <Campo
            label="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            autoComplete="new-password"
          />
          <Campo
            label="Confirmar contraseña"
            value={confirmacion}
            onChangeText={setConfirmacion}
            placeholder="Escribe de nuevo la contraseña"
            secureTextEntry
            autoComplete="new-password"
          />
          {mensaje ? (
            <Text
              accessibilityRole={registroCompleto ? "text" : "alert"}
              style={registroCompleto ? styles.success : styles.error}
            >
              {mensaje}
            </Text>
          ) : null}
          {registroCompleto && !registrando ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/login")}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={registrando}
              onPress={() => void crearCuenta()}
              style={({ pressed }) => [
                styles.button,
                (pressed || registrando) && styles.pressed,
              ]}
            >
              {registrando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Crear cuenta</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Campo(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
  autoComplete?: "name" | "email" | "tel" | "new-password";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#958A7E"
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
        value={props.value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  backLink: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
  },
  backText: { color: "#846B46", fontSize: 13, fontWeight: "700" },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  brandMark: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 17,
  },
  brandMarkText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  brandName: {
    color: "#846B46",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  eyebrow: {
    color: "#9B7650",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 22,
  },
  title: { color: "#2B2218", fontSize: 31, fontWeight: "900", marginTop: 6 },
  subtitle: {
    color: "#685B4F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    marginBottom: 17,
  },
  form: {
    backgroundColor: "#FFFAF4",
    borderColor: "#D7C7A8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  field: { marginBottom: 8 },
  label: { color: "#6D665C", fontSize: 12, fontWeight: "700", marginBottom: 5 },
  input: {
    minHeight: 43,
    backgroundColor: "#FFFFFF",
    borderColor: "#D7C8B4",
    borderWidth: 1,
    borderRadius: 5,
    color: "#2B2218",
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  error: { color: "#9C3434", fontSize: 13, lineHeight: 19, marginTop: 6 },
  success: { color: "#52643A", fontSize: 13, lineHeight: 19, marginTop: 6 },
  button: {
    minHeight: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#846B46",
    borderRadius: 5,
    marginTop: 13,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
