# Validación del 13 de octubre de 2026

## Resultado

La integración del catálogo, publicaciones, registros y solicitudes de compra está activa en **bprerqyiorgovbponcdw**. La migración se ejecutó mediante la sesión de Chrome con autorización del usuario. Se verificó también su repetición sin eliminar filas.

## Pruebas reales de Supabase

| Operación con clave pública | Resultado |
| --- | --- |
| Endpoint de configuración de Auth | HTTP 200 |
| Lectura del catálogo, también mediante el SDK | HTTP 200 |
| Publicación de artículo | HTTP 201 y fila confirmada |
| Registro del formulario | HTTP 201 y fila confirmada |
| Solicitud de compra vinculada al artículo | HTTP 201 y fila confirmada |
| Lectura pública de registros y solicitudes | HTTP 401 / 42501: denegada |
| Modificación y eliminación pública de registros y solicitudes | HTTP 401 / 42501: denegadas |

SQL confirmó RLS habilitado en ambas tablas nuevas, permiso de INSERT sobre los campos del formulario y ausencia de permisos públicos SELECT, UPDATE y DELETE. Las políticas previas de catálogo y perfiles fueron inspeccionadas y conservadas.

Los datos sintéticos de ambas pruebas (API e interfaz) fueron identificados por un nombre único y retirados, eliminando primero las solicitudes y después sus artículos. No se modificaron registros de clientes existentes. La clave secreta se utilizó únicamente en memoria y no se guardó en archivos ni en Git. Debe revocarse tras haber sido compartida en el chat.

## Interfaz y compilación

- Web compilada abierta en Chrome: carga real del catálogo, publicación, búsqueda del nuevo artículo, filtro por categoría, solicitud de compra y formulario completados. Cada operación creó una fila confirmada en la base de datos.
- El resultado del formulario navega a `/resultado`, sin datos personales en parámetros de URL.
- Galería: las tres imágenes se cargaron en Chrome. Sus endpoints responden HTTP 200 / image/jpeg; una prueba HTTP inicial de la tercera imagen requirió reintento.
- `npm run check:connections`: todas las comprobaciones pasan; 401 es el resultado esperado para tablas privadas.
- `npm run typecheck`: sin errores.
- `npm test`: 6 pruebas pasan, con respuestas simuladas de Supabase; incluye rechazo de precios decimales porque la columna real es integer.
- `npx expo install --check`: dependencias compatibles con SDK 57.
- `npx expo export --platform all --max-workers 2`: web, Android e iOS compilados después de la corrección de precios. La ejecución en dispositivos Android/iOS no se probó.

## Avisos pendientes

Security Advisor: 0 errores y 7 advertencias tras volver a ejecutar el análisis:

- INSERT público con `WITH CHECK (true)` en `articulos_vitrina`, `clientes_cafe`, `vitrina_registros` y `vitrina_solicitudes_compra`. Las dos tablas nuevas funcionan deliberadamente como formularios públicos: restricciones de campos y permisos por columna, sin lectura ni modificación pública. No hay control de abuso o autenticación en estos formularios.
- Dos avisos de permisos de ejecución sobre la función SECURITY DEFINER existente `crear_perfil_usuario()`. La función y sus permisos no se modificaron en esta integración.
- Protección contra contraseñas filtradas desactivada en Auth. Este proyecto no implementa un flujo de inicio de sesión desde la aplicación.

`npm audit fix` corrigió el aviso crítico de shell-quote y otro aviso alto. Quedan 29 entradas (18 altas, 11 moderadas), incluyendo dependencias transitivas de Expo/Metro. No se aplicaron las propuestas de cambios incompatibles de `npm audit fix --force`.

El conector administrativo sigue conectado a otro proyecto; se utilizó el SQL Editor de la sesión del usuario para completar el trabajo. Consultar [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para configuración y funcionamiento de los formularios.
