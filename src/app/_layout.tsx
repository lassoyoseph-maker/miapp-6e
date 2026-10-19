import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from 'react-native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { RegistrationProvider } from '@/lib/registration-context';
import { AuthProvider, useAuth } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { session, loading } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator accessibilityLabel="Comprobando sesión" color="#846B46" />
    </View>;
  }
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!session}><Stack.Screen name="(auth)" /></Stack.Protected>
    <Stack.Protected guard={!!session}><Stack.Screen name="(app)" /></Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <ThemeProvider value={DefaultTheme}>
    <AuthProvider>
      <RegistrationProvider><AnimatedSplashOverlay /><Navigator /></RegistrationProvider>
    </AuthProvider>
  </ThemeProvider>;
}
