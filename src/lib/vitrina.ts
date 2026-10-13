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
  const { data, error } = await getSupabase().from('articulos_vitrina').insert({
    nombre: name.trim(), precio: price, categoria: 'Decoración', epoca: 'Por verificar',
    imagen_url: 'https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900',
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
