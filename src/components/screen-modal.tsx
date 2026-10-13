import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenModal({ visible, onClose, title, closeLabel, disabled, footer, children }: PropsWithChildren<{ visible: boolean; onClose: () => void; title: string; closeLabel: string; disabled?: boolean; footer: ReactNode }>) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        style={[styles.overlay, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} disabled={disabled} onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            {children}
          </ScrollView>
          <View style={styles.footer}>{footer}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 12, backgroundColor: 'rgba(43, 34, 22, 0.45)' },
  sheet: { width: '100%', maxWidth: 640, maxHeight: '100%', flexShrink: 1, alignSelf: 'center', borderRadius: 20, backgroundColor: '#FFFDF8', overflow: 'hidden' },
  scroll: { flexGrow: 0, flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, flexShrink: 0 },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: '#382B16' },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#846B46', fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, flexShrink: 0 },
});
