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

Se comprobó la lectura de `articulos_vitrina`, incluyendo los campos `id`, `nombre`, `categoria`, `precio`, `epoca` e `imagen_url`. Los precios se guardan como números y se presentan en pesos colombianos. Las publicaciones usan el ID devuelto por la base de datos.

Aplicar `supabase/migrations/20261013221054_vitrina_forms.sql` en el proyecto **bprerqyiorgovbponcdw** mediante el SQL Editor o el flujo de migraciones de Supabase. La migración crea:

- `vitrina_registros`: datos de contacto del formulario. No crea cuentas de autenticación.
- `vitrina_solicitudes_compra`: solicitudes vinculadas a un artículo existente. No procesa pagos.

Ambas tablas permiten INSERT desde la aplicación; no permiten SELECT, UPDATE ni DELETE a roles públicos. RLS está habilitado. Los administradores pueden consultar las solicitudes en Supabase. No se alteran los permisos de `perfiles_usuario`, que exige autenticación.

La migración no modifica `articulos_vitrina`. Antes de activar publicaciones, comprobar que sus políticas permiten SELECT e INSERT según el modelo de acceso previsto. No desactivar RLS para resolver errores. Para un servicio público, añadir autenticación o controles de abuso según el volumen de solicitudes esperado.

## Estado de la validación remota

Auth y lectura de catálogo responden HTTP 200 con la clave facilitada. Las tablas nuevas todavía no existen (PGRST205). El conector administrativo solo muestra otro proyecto (`DBCONTABILIDAD`); deniega acceso a **bprerqyiorgovbponcdw**, por lo que no se pudo aplicar la migración ni revisar sus políticas o advisors.

`check:connections` es una comprobación de lectura: verifica Auth, columnas del catálogo y existencia/protección de las tablas privadas. No prueba INSERT. Los tests del servicio verifican las peticiones y la propagación de errores con respuestas simuladas. Después de aplicar la migración, realizar un registro, una publicación y una solicitud de compra desde la interfaz; confirmar los registros en el SQL Editor y retirarlos allí si son datos de prueba. Comprobar también que clientes anónimos no pueden leer las tablas privadas.

La interfaz solo confirma una operación cuando Supabase la acepta. Conserva los campos si falla, bloquea envíos simultáneos y permite reintentar la carga del catálogo. Los datos del formulario no viajan en la URL.
