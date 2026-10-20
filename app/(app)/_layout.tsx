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
      <Stack.Screen name="index" options={{ title: "La Vitrina" }} />
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
      <Stack.Screen name="contacto" options={{ title: "Contacto" }} />
      <Stack.Screen name="explore" options={{ title: "Explorar" }} />
    </Stack>
  );
}
