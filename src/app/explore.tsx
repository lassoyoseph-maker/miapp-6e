import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Explorar</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            Esta aplicación de inicio incluye ejemplos{"\n"}de código para
            ayudarte a comenzar.
          </ThemedText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">Documentación de Expo</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{
                    ios: "arrow.up.right.square",
                    android: "link",
                    web: "link",
                  }}
                  size={12}
                />
              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="Enrutamiento basado en archivos">
            <ThemedText type="small">
              Esta app tiene dos pantallas:{" "}
              <ThemedText type="code">src/app/index.tsx</ThemedText> y{" "}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              El archivo de diseño en{" "}
              <ThemedText type="code">src/app/_layout.tsx</ThemedText> configura
              el navegador de pestañas.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Más información</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Compatibilidad con Android, iOS y web">
            <ThemedView
              type="backgroundElement"
              style={styles.collapsibleContent}
            >
              <ThemedText type="small">
                Puedes abrir este proyecto en Android, iOS y la web. Para abrir
                la versión web, presiona{" "}
                <ThemedText type="smallBold">w</ThemedText> en la terminal donde
                se ejecuta este proyecto.
              </ThemedText>
              <Image
                source={require("@/assets/images/tutorial-web.png")}
                style={styles.imageTutorial}
              />
            </ThemedView>
          </Collapsible>

          <Collapsible title="Imágenes">
            <ThemedText type="small">
              Para imágenes estáticas, puedes usar los sufijos{" "}
              <ThemedText type="code">@2x</ThemedText> y{" "}
              <ThemedText type="code">@3x</ThemedText> para proporcionar
              archivos para diferentes densidades de pantalla.
            </ThemedText>
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.imageReact}
            />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Más información</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Componentes con modo claro y oscuro">
            <ThemedText type="small">
              Esta plantilla tiene soporte para modo claro y oscuro. El hook{" "}
              <ThemedText type="code">useColorScheme()</ThemedText> te permite
              inspeccionar el esquema de color actual del usuario y ajustar los
              colores de la interfaz en consecuencia.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Más información</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animaciones">
            <ThemedText type="small">
              Esta plantilla incluye un ejemplo de componente animado. El
              componente{" "}
              <ThemedText type="code">
                src/components/ui/collapsible.tsx
              </ThemedText>{" "}
              usa la poderosa biblioteca{" "}
              <ThemedText type="code">react-native-reanimated</ThemedText> para
              animar la apertura de esta pista.
            </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === "web" && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: "center",
    gap: Spacing.one,
    alignItems: "center",
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: "center",
  },
  imageTutorial: {
    width: "100%",
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
});
