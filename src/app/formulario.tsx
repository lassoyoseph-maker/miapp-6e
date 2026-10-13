import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { connectionError, registerContact } from '@/lib/vitrina';
import { notify } from '@/lib/notify';
import { useRegistration } from '@/lib/registration-context';

export default function Formulario() {
  const router = useRouter();
  const { setRegistration } = useRegistration();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function enviar() {
    if (savingRef.current) return;
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !telefono.trim() ||
      !ciudad.trim()
    ) {
      notify("Campos incompletos", "Todos los campos son obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) || !/^[+\d][\d\s()-]{6,19}$/.test(telefono.trim())) {
      notify('Datos inválidos', 'Escribe un correo y un teléfono válidos.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const values = { nombre: nombre.trim(), correo: correo.trim().toLowerCase(), telefono: telefono.trim(), ciudad: ciudad.trim() };
      await registerContact(values);
      setRegistration(values);
      router.replace('/resultado');
    } catch (error) { notify('No se pudo guardar', connectionError(error)); }
    finally { savingRef.current = false; setSaving(false); }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <Text style={styles.title}>Registro de usuario</Text>
        <Text style={styles.subtitle}>
          Completa la información para continuar.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            maxLength={120}
            editable={!saving}
            style={styles.input}
            placeholder="Ingrese su nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <Text style={styles.label}>Correo</Text>
          <TextInput
            maxLength={254}
            editable={!saving}
            style={styles.input}
            placeholder="correo@dominio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            maxLength={20}
            editable={!saving}
            style={styles.input}
            placeholder="3001234567"
            keyboardType="phone-pad"
            value={telefono}
            onChangeText={setTelefono}
          />
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            maxLength={120}
            editable={!saving}
            style={styles.input}
            placeholder="Ej: Pasto"
            value={ciudad}
            onChangeText={setCiudad}
          />
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            disabled={saving}
            onPress={enviar}
          >
            <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Enviar información'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF7FA" },
  container: { padding: 20, flexGrow: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  title: {
    color: "#6C4051",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },
  subtitle: {
    color: "#8A727C",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F2D5E0",
  },
  label: {
    color: "#A06C80",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFF9FB",
    borderWidth: 1,
    borderColor: "#E8C8D3",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: "#563C46",
  },
  button: {
    backgroundColor: "#C96A8B",
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
