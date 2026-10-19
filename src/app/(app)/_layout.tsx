import { Stack } from 'expo-router';
export default function AppLayout() { return <Stack screenOptions={{ headerStyle: { backgroundColor: '#846B46' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#F7F3EC' } }}>
{[['index','La Vitrina · Muebles'],['formulario','Preferencias'],['resultado','Registro guardado'],['registros','Mis registros'],['imagenes','Galería de muebles'],['contacto','Contacto'],['usuario','Mi usuario']].map(([name,title]) => <Stack.Screen key={name} name={name} options={{ title }} />)}
</Stack>; }
