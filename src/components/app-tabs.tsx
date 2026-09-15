import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { Spacing } from "@/constants/theme";

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.tabBar}>
        <Link href="/" asChild>
          <TabButton isFocused={pathname === "/"}>Inicio</TabButton>
        </Link>
        <Link href="/explore" asChild>
          <TabButton isFocused={pathname === "/explore"}>Explorar</TabButton>
        </Link>
      </ThemedView>
    </View>
  );
}

function TabButton({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  return (
    <Pressable style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? "backgroundSelected" : "backgroundElement"}
        style={styles.tabButton}
      >
        <ThemedText themeColor={isFocused ? "text" : "textSecondary"}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    padding: Spacing.three,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.five,
  },
  tabButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
