import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function FurniturePreview() {
  const [name, setName] = useState('');
  const [furniture, setFurniture] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState('');
  function preview() {
    if (!name.trim() || !furniture.trim() || !/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > 99) {
      setResult('Completa tu nombre, el mueble y una cantidad entera entre 1 y 99.'); return;
    }
    setResult(`Resumen para ${name.trim()}: ${quantity} unidad(es) de ${furniture.trim()}. Este borrador no reserva productos ni se guarda; usa Comprar para solicitar atención.`);
  }
  return <View style={styles.card}>
    <Text style={styles.title}>Inspira tu hogar</Text>
    <Image accessibilityLabel="Sofá para la sala" source={require('../../assets/muebles-sofa.jpg')} style={styles.image} />
    <Text style={styles.text}>Salas acogedoras</Text>
    <Image accessibilityLabel="Comedor de madera" source={require('../../assets/muebles-comedor.jpg')} style={styles.image} />
    <Text style={styles.text}>Comedores para compartir · Imágenes de inspiración</Text>
    <Text style={styles.title}>Prepara tu solicitud</Text>
    <Text style={styles.label}>Nombre</Text>
    <TextInput accessibilityLabel="Nombre para el resumen" maxLength={120} style={styles.input} placeholder="Tu nombre" value={name} onChangeText={setName} />
    <Text style={styles.label}>Mueble que buscas</Text>
    <TextInput accessibilityLabel="Mueble para el resumen" maxLength={120} style={styles.input} placeholder="Mueble que buscas" value={furniture} onChangeText={setFurniture} />
    <Text style={styles.label}>Cantidad (1 a 99)</Text>
    <TextInput accessibilityLabel="Cantidad" maxLength={2} keyboardType="number-pad" style={styles.input} placeholder="Cantidad (1 a 99)" value={quantity} onChangeText={setQuantity} />
    <Pressable accessibilityRole="button" style={styles.button} onPress={preview}><Text style={styles.buttonText}>Mostrar resumen</Text></Pressable>
    {!!result && <Text accessibilityRole="alert" style={styles.text}>{result}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', padding: 18, borderRadius: 18, gap: 12, marginVertical: 20 },
  title: { fontSize: 21, fontWeight: '700', color: '#544633' },
  image: { width: '100%', height: 180, resizeMode: 'cover', borderRadius: 12 },
  text: { color: '#655B4E', lineHeight: 22 },
  label: { color: '#544633', fontSize: 14, fontWeight: '700' },
  input: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: '#DAD1C5', borderRadius: 12 },
  button: { minHeight: 48, padding: 14, backgroundColor: '#846B46', alignItems: 'center', borderRadius: 12 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});
