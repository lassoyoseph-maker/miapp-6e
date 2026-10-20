# Supabase para La Vitrina

La app principal sigue siendo **La Vitrina**. El módulo de actividad registra artículos del mismo catálogo (muebles, arte, relojes y decoración) en Supabase y los consulta en **Registros de artículos**. El SQL crea una tabla nueva llamada `articulos_vitrina`; no borra ni modifica tablas existentes.

La primera pantalla es el inicio de sesión. El registro crea el usuario con Supabase Auth y un trigger guarda nombre, teléfono y ciudad en `perfiles_usuario`. La contraseña solo la administra Auth y no se almacena en esa tabla.

## 1. Abrir el proyecto existente

1. Entra a [Supabase](https://supabase.com/dashboard) e inicia sesión.
2. Abre el proyecto con ID `bprerqyiorgovbponcdw`. No crees un proyecto Expo ni otro proyecto Supabase.

## 2. Crear las tablas

1. En el panel abre **SQL Editor → New query**.
2. Abre `supabase/schema.sql` en este repositorio y copia todo el contenido al editor.
3. Pulsa **Run**. El script crea de forma segura e idempotente:
   - `clientes_cafe`: con las columnas `id`, `nombre`, `correo`, `telefono`, `ciudad`, `cafe_favorito`, `tipo_preparacion` (Actividad Final Lab 2) y sus políticas RLS.
   - `articulos_vitrina`: con `id`, `nombre`, `categoria`, `precio`, `epoca`, `imagen_url`, `created_at` y RLS.
   - `perfiles_usuario`: vinculado a `auth.users` mediante triggers y RLS por usuario.
4. En **Table Editor**, comprueba que las tres tablas aparezcan.
5. Si deseas cargar datos de prueba para Coffee Lovers (mínimo 3 registros requeridos en la actividad):
   - Abre **SQL Editor → New query**.
   - Copia y corre el contenido de `supabase/seed_clientes_cafe.sql`.

## 3. Completar la conexión de la app

1. Abre **Project Settings → API Keys** (en algunas versiones aparece como **Project Settings → API**).
2. Copia la clave pública **Publishable**; si el proyecto muestra el formato heredado, copia la clave pública `anon`.
3. Abre `.env.local` en la raíz del proyecto. La URL debe ser `https://bprerqyiorgovbponcdw.supabase.co`.
4. Pega la clave pública después del signo `=` en `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Estas variables deben empezar por `EXPO_PUBLIC_`; Expo no incorpora variables `NEXT_PUBLIC_` al bundle móvil. No uses `service_role` ni una clave `secret`.
5. Guarda y reinicia Metro:

```powershell
npx expo start --clear
```

`.env.local` está ignorado por Git. Expo incorpora las variables `EXPO_PUBLIC_` al bundle, así que solo deben contener valores públicos protegidos mediante RLS.

### Si instalas un APK creado con EAS

El archivo `.env.local` de tu computadora no se copia al teléfono ni se sube automáticamente a EAS. El código ya tiene como respaldo la URL pública del proyecto; falta añadir la clave pública al entorno de compilación. En **Expo dashboard → proyecto → Environment variables**, crea `EXPO_PUBLIC_SUPABASE_ANON_KEY` en el entorno `preview` (el perfil `preview` de `eas.json` usa ese entorno). Usa como valor la clave `sb_publishable_...` o la clave `anon` heredada.

Puedes crearla también con EAS CLI; el comando te pedirá el valor en tu terminal, sin que tengas que compartirlo en el chat:

```powershell
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "TU_CLAVE_PUBLICA" --visibility plaintext
```

Después genera e instala un APK nuevo:

```powershell
eas build --profile preview --platform android
```

La compilación instalada actualmente no puede recibir cambios de `.env.local`. La clave `publishable`/`anon` es pública para clientes; nunca uses `service_role` ni una clave `secret`.

## 4. Crear una cuenta e iniciar sesión

Antes de probar el flujo del laboratorio, en el mismo proyecto de Supabase abre **Authentication → Sign In / Providers → User Signups** y configura **Allow new users to sign up** activado, **Allow manual linking** desactivado, **Allow anonymous sign-ins** desactivado y **Confirm email** desactivado. Pulsa **Save changes**. Esta configuración del dashboard no se puede cambiar desde el código de la app. Si decides mantener la confirmación por correo activada, confirma el correo antes de iniciar sesión.

1. Inicia Expo con `npx expo start --clear` y abre la app.
2. En **Iniciar sesión** elige **Crear cuenta** y completa nombre, correo, teléfono, ciudad, contraseña y confirmación.
3. La contraseña requiere al menos 8 caracteres, una mayúscula, una minúscula y un número; se conserva la validación de La Vitrina, que es más estricta que el mínimo de 6 caracteres del ejemplo del laboratorio.
4. Tras crear la cuenta, la app cierra la sesión y muestra el acceso para iniciar sesión. Si Supabase tiene habilitada la confirmación de correo, primero abre el mensaje que envía Supabase y confirma la dirección.
5. En **Authentication → Users** aparecerá el usuario y en **Table Editor → perfiles_usuario** su perfil.

## 5. Probar el registro de artículos

1. Desde La Vitrina abre **La Vitrina · Registros de artículos**.
2. Pulsa el acceso a registrar artículo y completa nombre, categoría, precio en pesos y época. La URL de imagen es opcional; si se deja vacía se utiliza una imagen de muestra correspondiente a la categoría.
3. Guarda el artículo. La app inserta la fila, muestra el ID generado y permite abrir **Artículos registrados**.
4. Confirma la fila en **Supabase → Table Editor → articulos_vitrina**.
5. Registra tres piezas con categorías y épocas distintas y refresca la lista.

### Cargar siete artículos de demostración

Para llenar el inventario inicial, abre **SQL Editor → New query**, copia `supabase/seed_articulos_vitrina.sql` y pulsa **Run**. El script agrega siete piezas de La Vitrina y evita volver a insertar una pieza con el mismo nombre si se ejecuta otra vez. Después vuelve a la app y actualiza **Artículos registrados**.

## 6. Para qué sirve cada operación

1. `.from("articulos_vitrina")` elige la tabla sobre la cual operar.
2. `.insert(...)` crea el artículo; `.select(...)` solicita que Supabase devuelva las columnas creadas.
3. `data` contiene el registro guardado y `error` explica un fallo; se comprueban ambos para no mostrar una confirmación falsa.
4. RLS aplica las políticas de lectura e inserción a nivel de fila.
5. `useState` guarda datos temporalmente en memoria; PostgreSQL mediante Supabase persiste el artículo para consultarlo de nuevo.

## Seguridad

Las políticas abiertas para `anon` son para la práctica. En producción, restringe las operaciones mediante autenticación, separa permisos de lectura y escritura, y limita las columnas expuestas. Nunca incluyas una clave `service_role` o `secret` en una app móvil o web.
