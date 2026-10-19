import { getSupabase } from './supabase';

export type Category = 'Todos' | 'Muebles' | 'Arte' | 'Relojes' | 'Decoración';
export type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'Todos'>;
  price: string;
  period: string;
  image: string;
};

type ProductRow = {
  id: number;
  nombre: string;
  categoria: Product['category'];
  precio: number;
  epoca: string;
  imagen_url: string;
};

const columns = 'id,nombre,categoria,precio,epoca,imagen_url';
function toProduct(row: ProductRow): Product {
  return {
    id: row.id, name: row.nombre, category: row.categoria,
    price: `$${Number(row.precio).toLocaleString('es-CO')}`,
    period: row.epoca, image: row.imagen_url,
  };
}

export function connectionError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'PGRST205') return 'La base de datos requiere la migración de La Vitrina. Contacta al administrador.';
  if (code === '42501') return 'La base de datos no permite esta operación. Contacta al administrador.';
  if (error instanceof Error && error.message.startsWith('Falta configurar')) return error.message;
  return 'No se pudo completar la operación. Revisa tu conexión e inténtalo de nuevo.';
}

export async function loadProducts() {
  const { data, error } = await getSupabase().from('articulos_vitrina')
    .select(columns).order('id', { ascending: false });
  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}

export async function createProduct(name: string, price: number) {
  if (!name.trim() || name.trim().length > 120 || !Number.isSafeInteger(price) || price <= 0 || price > 1000000000) {
    throw new Error('Escribe un nombre y un precio entero positivo en pesos, sin separadores de miles.');
  }
  const { data, error } = await getSupabase().from('articulos_vitrina').insert({
    nombre: name.trim(), precio: price, categoria: 'Muebles', epoca: 'Mueble de segunda mano',
    imagen_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
  }).select(columns).single();
  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function requestPurchase(productId: number, name: string, phone: string) {
  const { error } = await getSupabase().from('vitrina_solicitudes_compra').insert({
    articulo_id: productId, nombre: name.trim(), telefono: phone.trim(),
  });
  if (error) throw error;
}

export async function registerContact(values: { nombre: string; correo: string; telefono: string; ciudad: string }) {
  const { error } = await getSupabase().from('vitrina_registros').insert(values);
  if (error) throw error;
}

export type FurnitureRegistration = {
  id: string; nombre: string; correo: string; telefono: string; ciudad: string;
  mueble_favorito: string; material_preferido: string; created_at: string;
};
export type FurnitureInput = Omit<FurnitureRegistration, 'id' | 'created_at'>;
const registrationColumns = 'id,nombre,correo,telefono,ciudad,mueble_favorito,material_preferido,created_at';
export async function saveFurnitureRegistration(values: FurnitureInput): Promise<FurnitureRegistration> {
  const { data, error } = await getSupabase().from('vitrina_preferencias').insert(values).select(registrationColumns).single();
  if (error) throw error;
  if (!data) throw new Error('El servidor no devolvió el registro.');
  return data as FurnitureRegistration;
}
export async function loadFurnitureRegistrations(): Promise<FurnitureRegistration[]> {
  const { data, error } = await getSupabase().from('vitrina_preferencias').select(registrationColumns).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FurnitureRegistration[];
}
