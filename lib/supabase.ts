import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

export type CategoriaArticulo = "Muebles" | "Arte" | "Relojes" | "Decoración";

export type ArticuloVitrina = {
  id: number;
  nombre: string;
  categoria: CategoriaArticulo;
  precio: number;
  epoca: string;
  imagen_url: string | null;
  created_at: string;
};

export type PerfilUsuario = {
  id: string;
  nombre_completo: string;
  telefono: string;
  ciudad: string;
  created_at: string;
};

type ArticuloVitrinaInsert = Omit<ArticuloVitrina, "id" | "created_at">;

type Database = {
  public: {
    Tables: {
      articulos_vitrina: {
        Row: ArticuloVitrina;
        Insert: ArticuloVitrinaInsert &
          Partial<Pick<ArticuloVitrina, "id" | "created_at">>;
        Update: Partial<ArticuloVitrinaInsert>;
        Relationships: [];
      };
      perfiles_usuario: {
        Row: PerfilUsuario;
        Insert: Omit<PerfilUsuario, "created_at"> &
          Partial<Pick<PerfilUsuario, "created_at">>;
        Update: Partial<Omit<PerfilUsuario, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "https://bprerqyiorgovbponcdw.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const authStorage =
  Platform.OS === "web"
    ? {
        getItem: async (key: string) =>
          typeof window === "undefined"
            ? null
            : window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => {
          if (typeof window !== "undefined")
            window.localStorage.setItem(key, value);
        },
        removeItem: async (key: string) => {
          if (typeof window !== "undefined")
            window.localStorage.removeItem(key);
        },
      }
    : AsyncStorage;

export const supabaseConfigError = !supabaseUrl
  ? "Falta EXPO_PUBLIC_SUPABASE_URL en .env.local."
  : !supabaseAnonKey
    ? "Falta la clave pública de Supabase en esta compilación. En desarrollo usa EXPO_PUBLIC_SUPABASE_ANON_KEY en .env.local; para un APK crea esa variable en EAS y vuelve a compilar."
    : "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: authStorage,
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
