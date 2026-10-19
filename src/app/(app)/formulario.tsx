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

import { connectionError, saveFurnitureRegistration } from '@/lib/vitrina';
import { notify } from '@/lib/notify';
import { useRegistration } from '@/lib/registration-context';

export default function Formulario() {
  const router = useRouter();
  const { setRegistration } = useRegistration();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [mueble, setMueble] = useState("");
  const [material, setMaterial] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function enviar() {
    if (savingRef.current) return;
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !telefono.trim() ||
      !ciudad.trim() || !mueble.trim() || !material.trim()
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
      const values = { nombre: nombre.trim(), correo: correo.trim().toLowerCase(), telefono: telefono.trim(), ciudad: ciudad.trim(), mueble_favorito: mueble.trim(), material_preferido: material.trim() };
      const saved = await saveFurnitureRegistration(values);
      setRegistration(saved);
      router.replace({ pathname: '/resultado', params: { id: saved.id } });
    } catch (error) { notify('No se pudo guardar', connectionError(error)); }
    finally { savingRef.current = false; setSaving(false); }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <Text style={styles.title}>Preferencias de muebles</Text>
        <Text style={styles.subtitle}>
          Cuéntanos qué mueble y material buscas para tu hogar.
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
          <Text style={styles.label}>Mueble favorito</Text>
          <TextInput accessibilityLabel="Mueble favorito" maxLength={120} editable={!saving} style={styles.input} placeholder="Ej: sofá, mesa o armario" value={mueble} onChangeText={setMueble} />
          <Text style={styles.label}>Material preferido</Text>
          <TextInput accessibilityLabel="Material preferido" maxLength={120} editable={!saving} style={styles.input} placeholder="Ej: madera, metal o tapizado" value={material} onChangeText={setMaterial} />
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
  safeArea: { flex: 1, backgroundColor: "#F7F3EC" },
  container: { padding: 20, flexGrow: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  title: {
    color: "#544633",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },
  subtitle: {
    color: "#756B5E",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD4C7",
  },
  label: {
    color: "#776548",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#DDD4C7",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: "#544633",
  },
  button: {
    backgroundColor: "#846B46",
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.75 },
});
