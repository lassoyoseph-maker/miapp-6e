import {
    CameraView,
    useCameraPermissions,
    type BarcodeScanningResult,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase, supabaseConfigError } from "@/lib/supabase";

export default function Escaner() {
  const router = useRouter();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const procesando = useRef(false);

  async function leerQR({ data }: BarcodeScanningResult) {
    if (procesando.current) return;

    procesando.current = true;
    setEscaneado(true);
    setConsultando(true);
    setMensaje("");

    const contenidoQr = data.trim();
    let registroQr: {
      v?: number;
      codigo?: string;
      titulo?: string;
      descripcion?: string;
      detalle?: string;
      precio?: number | null;
      imagen?: string;
    } | null = null;

    try {
      const valor = JSON.parse(contenidoQr) as typeof registroQr;
      if (valor?.v === 1) registroQr = valor;
    } catch {
      // Los códigos antiguos contienen solo ANT-00X.
    }

    const codigo = registroQr?.codigo ?? contenidoQr;
    if (!/^ANT-\d{3}$/.test(codigo)) {
      setMensaje("El QR no contiene un código de colección válido.");
      setConsultando(false);
      return;
    }

    if (registroQr) {
      if (
        !registroQr.titulo ||
        !registroQr.descripcion ||
        !registroQr.detalle ||
        registroQr.imagen !== `${codigo}.jpg` ||
        (registroQr.precio !== null && typeof registroQr.precio !== "number")
      ) {
        setMensaje("La información de este QR está incompleta o dañada.");
        setConsultando(false);
        return;
      }

      router.replace({
        pathname: "/detalle",
        params: {
          codigo,
          titulo: registroQr.titulo,
          descripcion: registroQr.descripcion,
          detalle: registroQr.detalle,
          precio: String(registroQr.precio ?? ""),
        },
      });
      setConsultando(false);
      return;
    }

    if (!supabase) {
      setMensaje(supabaseConfigError);
      setConsultando(false);
      return;
    }

    try {
      const { data: coleccion, error } = await supabase
        .from("vitrina_catalogo")
        .select("codigo")
        .eq("codigo", codigo)
        .maybeSingle();

      if (error) throw error;
      if (!coleccion) {
        setMensaje(`No existe una colección con el código ${codigo}.`);
        return;
      }

      router.replace({
        pathname: "/detalle",
        params: { codigo: coleccion.codigo },
      });
    } catch (error) {
      console.error("Error al consultar el código QR:", error);
      setMensaje("No se pudo consultar Supabase. Intenta escanear de nuevo.");
    } finally {
      setConsultando(false);
    }
  }

  function escanearDeNuevo() {
    procesando.current = false;
    setEscaneado(false);
    setMensaje("");
  }

  if (!permiso) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#846B46" />
          <Text style={styles.bodyText}>Verificando permiso de cámara…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permiso.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.state}>
          <Text style={styles.title}>Se necesita la cámara</Text>
          <Text style={styles.bodyText}>
            Permite el acceso a la cámara para leer el código de una colección.
          </Text>
          {permiso.canAskAgain ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void solicitarPermiso()}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Permitir cámara</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openSettings()}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Abrir ajustes</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Escanear código QR</Text>
        <Text style={styles.bodyText}>
          Enfoca el código impreso o mostrado en otra pantalla.
        </Text>

        <View style={styles.cameraFrame}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={escaneado ? undefined : leerQR}
          />
          {consultando ? (
            <View style={styles.cameraStatus}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.cameraStatusText}>Leyendo producto…</Text>
            </View>
          ) : null}
        </View>

        {mensaje ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {mensaje}
          </Text>
        ) : null}

        {escaneado ? (
          <Pressable
            accessibilityRole="button"
            onPress={escanearDeNuevo}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Escanear de nuevo</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3EC" },
  container: { flex: 1, padding: 20 },
  state: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#382B16",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  bodyText: {
    color: "#756B5D",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  cameraFrame: {
    backgroundColor: "#2B2218",
    borderRadius: 18,
    flex: 1,
    marginTop: 18,
    maxHeight: 560,
    minHeight: 280,
    overflow: "hidden",
  },
  camera: { flex: 1 },
  cameraStatus: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(43, 34, 24, 0.82)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
    top: 16,
  },
  cameraStatusText: { color: "#FFFFFF", fontWeight: "700" },
  error: {
    color: "#A23E32",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#846B46",
    borderRadius: 11,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 18,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
