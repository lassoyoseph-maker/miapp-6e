# Validación del 13 de octubre de 2026

## Comprobaciones completadas

- `npm run typecheck`: sin errores.
- `npm test`: 5 pruebas del servicio pasan, con respuestas simuladas de Supabase.
- `npx expo install --check`: dependencias compatibles con SDK 57.
- `npx expo export --platform all --max-workers 2`: compilación de web, Android e iOS completada después de los ajustes de dependencias. No equivale a ejecutar la app en un dispositivo.
- API Auth: HTTP 200 con la clave pública proporcionada.
- Lectura de columnas del catálogo `articulos_vitrina`: HTTP 200, también mediante `@supabase/supabase-js`.
- Las tres imágenes de la galería responden HTTP 200 y `image/jpeg`. La tercera requirió un reintento. La imagen usada para publicaciones responde HTTP 200.
- Se actualizaron las dependencias compatibles de Expo y el lockfile. `npm audit fix` corrigió el aviso crítico de `shell-quote` y otro aviso alto. La auditoría todavía reporta 29 entradas (18 altas, 11 moderadas), incluyendo dependencias transitivas de Expo/Metro. No se aplicaron las propuestas de cambios incompatibles de `npm audit fix --force`.

## Pendiente en el proyecto remoto

`vitrina_registros` y `vitrina_solicitudes_compra` todavía devuelven HTTP 404 / PGRST205. La migración está incluida, pero no se ha aplicado: el conector administrativo deniega acceso a `bprerqyiorgovbponcdw` y solo muestra DBCONTABILIDAD, otro proyecto.

La escritura real de publicaciones, formularios y solicitudes, las políticas completas del proyecto, los advisors y el recorrido de la interfaz en dispositivos deben comprobarse después de habilitar el acceso. La lectura correcta de catálogo y el endpoint de Auth no demuestran permisos de INSERT ni validan un flujo de inicio de sesión; esta aplicación no incorpora uno.

Consultar [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para aplicar la migración y verificar los registros. El comando `npm run check:connections` termina con error mientras falten las tablas; ese error es esperado y no debe ignorarse al activar los formularios.
