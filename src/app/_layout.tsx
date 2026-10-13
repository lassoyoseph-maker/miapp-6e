import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { RegistrationProvider } from '@/lib/registration-context';
import { AuthProvider } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <RegistrationProvider>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#C96A8B",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#FFF7FA",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Inicio" }} />
        <Stack.Screen name="formulario" options={{ title: "Formulario" }} />
        <Stack.Screen
          name="resultado"
          options={{ title: "Datos registrados" }}
        />
        <Stack.Screen name="imagenes" options={{ title: "Galería" }} />
        <Stack.Screen name="contacto" options={{ title: "Contacto" }} />
        <Stack.Screen name="usuario" options={{ title: "Mi usuario" }} />
      </Stack>
      </RegistrationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
