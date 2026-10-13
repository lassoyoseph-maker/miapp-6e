# Conexión de La Vitrina

El proyecto ejecutable está en la raíz. `miapp-6e/` y los archivos `(2)` son copias antiguas; se excluyen del análisis TypeScript.

## Configuración

```sh
npm ci
# Copiar .env.example a .env.local
npm run typecheck
npm test
npm run check:connections
npm run web
```

Expo utiliza `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Las variables `VITE_` no se incluyen en esta aplicación. La clave del ejemplo es pública; nunca introducir claves secretas ni service_role en el frontend. Reiniciar Expo al cambiar la configuración.

## Base de datos

Se comprobó la lectura y publicación en `articulos_vitrina`, incluyendo los campos `id`, `nombre`, `categoria`, `precio`, `epoca` e `imagen_url`. La columna `precio` es entera: la aplicación acepta pesos enteros positivos y los presenta en formato colombiano. Las publicaciones usan el ID devuelto por la base de datos.

La migración `supabase/migrations/20261013221054_vitrina_forms.sql` **ya fue aplicada el 13 de octubre de 2026** en el proyecto **bprerqyiorgovbponcdw**, desde el SQL Editor de la sesión de Chrome y con autorización del usuario. Para otra instancia, aplicarla mediante el SQL Editor o el flujo de migraciones de Supabase. Puede repetirse en un esquema compatible sin eliminar filas; su repetición se verificó en el proyecto. Crea:

- `vitrina_registros`: datos de contacto del formulario. No crea cuentas de autenticación.
- `vitrina_solicitudes_compra`: solicitudes vinculadas a un artículo existente. No procesa pagos.

Ambas tablas permiten INSERT desde la aplicación; no permiten SELECT, UPDATE ni DELETE a roles públicos. RLS está habilitado. Los administradores pueden consultar las solicitudes en Supabase. No se alteran los permisos de `perfiles_usuario`, que exige autenticación.

La migración no modifica `articulos_vitrina`. Sus políticas actuales permiten SELECT e INSERT para anon y authenticated; ambas operaciones se verificaron. No desactivar RLS para resolver errores. Los formularios son entradas públicas deliberadas, protegidas por validación de campos y permisos de columna; no requieren iniciar sesión y no incorporan un sistema de prevención de abuso.

## Usuario y sesión

Inicio incluye **Ver usuario** y **Cerrar sesión**. Ver usuario abre `/usuario`: sin sesión permite iniciar sesión o crear una cuenta; con sesión muestra el correo y el perfil del usuario actual en `perfiles_usuario`. La consulta se restringe a su ID y respeta las políticas RLS existentes.

Supabase Auth conserva la sesión entre recargas: almacenamiento del navegador en web y AsyncStorage en Android/iOS. Se renueva el token cuando corresponde y se detiene su renovación cuando la aplicación nativa está en segundo plano. No se guarda la contraseña en el código ni en el almacenamiento de la aplicación.

Cerrar sesión usa `scope: local`: cierra el acceso en este dispositivo, conserva las sesiones de otros dispositivos y limpia el perfil, el registro reciente y los formularios abiertos. El botón se deshabilita mientras no hay sesión. Si la revocación remota falla, el SDK elimina las credenciales locales y la interfaz informa de que no pudo confirmar el cierre en el servidor.

Crear cuenta utiliza la configuración de confirmación de correo de Supabase. Cuando el servidor no devuelve una sesión, la aplicación solicita confirmar el correo antes de entrar. El nombre en los metadatos se utiliza solo para mostrarlo, nunca para autorizar acceso a datos.

La persistencia, perfil y cierre de sesión se probaron en Chrome con un servidor Auth simulado localmente; el endpoint real se comprobó con credenciales inválidas. No se crearon usuarios ni se enviaron correos reales durante estas pruebas. Detalles en [VALIDACION_INTERFAZ.md](VALIDACION_INTERFAZ.md).

## Estado de la validación remota

Auth y lectura de catálogo responden HTTP 200 con la clave pública. Publicaciones, registros y solicitudes responden HTTP 201 y persisten en sus tablas. Se probaron mediante la API y desde la interfaz web compilada. Las filas temporales de ambas pruebas fueron retiradas con una credencial de servidor, utilizada solo en memoria. Ninguna clave secreta se incluye en el código ni en Git.

El conector administrativo continúa asociado a otra cuenta; el acceso necesario para ejecutar y revisar SQL se obtuvo desde la sesión existente de Chrome. Security Advisor muestra 0 errores y 7 advertencias, detalladas en [VALIDACION.md](VALIDACION.md).

`check:connections` es una comprobación de lectura: verifica Auth, columnas del catálogo y existencia/protección de las tablas privadas. No prueba INSERT. Las respuestas HTTP 401 / 42501 de las tablas privadas son esperadas y confirman que la lectura pública está denegada. Los tests del servicio verifican peticiones, validación de precios y propagación de errores con respuestas simuladas. Las pruebas reales de INSERT y privacidad ya se completaron; repetirlas cuando cambien esquema o permisos.

La interfaz solo confirma una operación cuando Supabase la acepta. Conserva los campos si falla, bloquea envíos simultáneos y permite reintentar la carga del catálogo. Los datos del formulario no viajan en la URL.
