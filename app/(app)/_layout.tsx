import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#846B46" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#F8F3EC" },
      }}
    >
      <Stack.Screen name="inicio" options={{ title: "La Vitrina" }} />
      <Stack.Screen name="compras" options={{ title: "Mis compras" }} />
      <Stack.Screen
        name="formulario"
        options={{ title: "Registrar artículo" }}
      />
      <Stack.Screen
        name="resultado"
        options={{ title: "Artículo registrado" }}
      />
      <Stack.Screen
        name="registros"
        options={{ title: "Artículos de La Vitrina" }}
      />
      <Stack.Screen name="imagenes" options={{ title: "Galería" }} />
      <Stack.Screen name="catalogo" options={{ title: "Catálogo" }} />
      <Stack.Screen
        name="detalle"
        options={{ title: "Detalle del producto" }}
      />
      <Stack.Screen name="escaner" options={{ title: "Escanear QR" }} />
      <Stack.Screen name="contacto" options={{ title: "Contacto" }} />
      <Stack.Screen name="explore" options={{ title: "Explorar" }} />
    </Stack>
  );
}
