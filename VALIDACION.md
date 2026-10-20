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
- `npm test`: 12 pruebas pasan, con respuestas simuladas de Supabase: 6 de catálogo/formularios y 6 de autenticación. Incluye rechazo de precios decimales porque la columna real es integer.
- `npx expo install --check`: dependencias compatibles con SDK 57.
- `npx expo export --platform all --max-workers 2`: web, Android e iOS compilados después de la corrección de precios. La ejecución en dispositivos Android/iOS no se probó.

## Avisos pendientes

Security Advisor: 0 errores y 7 advertencias tras volver a ejecutar el análisis:

- INSERT público con `WITH CHECK (true)` en `articulos_vitrina`, `clientes_cafe`, `vitrina_registros` y `vitrina_solicitudes_compra`. Las dos tablas nuevas funcionan deliberadamente como formularios públicos: restricciones de campos y permisos por columna, sin lectura ni modificación pública. No hay control de abuso o autenticación en estos formularios.
- Dos avisos de permisos de ejecución sobre la función SECURITY DEFINER existente `crear_perfil_usuario()`. La función y sus permisos no se modificaron en esta integración.
- Protección contra contraseñas filtradas desactivada en Auth. El nuevo flujo de inicio de sesión conserva la configuración actual del servidor; este aviso continúa pendiente.

`npm audit fix` corrigió el aviso crítico de shell-quote y otro aviso alto. Quedan 29 entradas (18 altas, 11 moderadas), incluyendo dependencias transitivas de Expo/Metro. No se aplicaron las propuestas de cambios incompatibles de `npm audit fix --force`.

El conector administrativo sigue conectado a otro proyecto; se utilizó el SQL Editor de la sesión del usuario para completar el trabajo. Consultar [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para configuración y funcionamiento de los formularios.

La revisión de visibilidad de botones y las opciones de usuario/sesión se describen en [VALIDACION_INTERFAZ.md](VALIDACION_INTERFAZ.md).

## Validación académica de muebles — 19 de octubre de 2026
15 pruebas automatizadas aprobadas y exportación Android/iOS/web correcta. Migración `20261019214345_furniture_customer_preferences.sql` aplicada en el proyecto real tras autorización. Prueba SQL transaccional de INSERT y SELECT propios frente a otro UID superada; rollback al terminar. `check:connections` incluye la nueva tabla privada y confirma denegación anónima. Las pruebas de navegador con login y formulario exitosos usaron un simulador local y no se presentan como evidencia de usuarios reales ni de instalación Android. Véase `ENTREGA_FINAL.md`.

EAS finalizó correctamente el build Android `04e3586c-e69b-4e7f-a04f-3ded0df71522`; APK descargado y estructura comprobada (AndroidManifest.xml y classes.dex). El paso expo-doctor advirtió cinco parches más recientes de paquetes de SDK 57 (20/21 comprobaciones aprobadas); la compilación nativa concluyó. La instalación y las pruebas físicas en Android permanecen pendientes. En ENTREGA_FINAL.md están el enlace al APK, su SHA-256 y la captura de EAS.

### Registro de correo existente — 19 de octubre de 2026
La creación de cuenta traduce `user_already_exists`, `email_exists` y el mensaje anterior `User already registered` a **Correo registrado. Inicia sesión con tu cuenta.** También detecta la respuesta ofuscada con `identities: []` que Supabase puede devolver al repetir un correo confirmado, y evita presentarla como una cuenta nueva. Los correos se normalizan con trim y minúsculas antes de enviarlos; Supabase Auth conserva la unicidad de la cuenta. Para una cuenta pendiente de confirmación se muestra **Correo registrado. Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.**, sin afirmar que se creó otra cuenta.

Validación: TypeScript correcto, 18 pruebas aprobadas (incluidas las respuestas de duplicado mediante el SDK real con HTTP simulado) y conexiones reales correctas. No se crearon usuarios de producción ni se enviaron correos de prueba. Referencia: https://supabase.com/docs/reference/javascript/auth-signup. El APK generado anteriormente no incluye esta revisión del registro ni las nuevas etiquetas del resumen; requiere nueva compilación para incorporarlas.

### Corrección de versiones de Expo SDK 57 — 19 de octubre de 2026
Se alinearon las dependencias y package-lock.json con Expo: @expo/ui 57.0.25, expo 57.0.30, expo-constants 57.0.22, expo-linking 57.0.13 y expo-router 57.0.28. `expo install --check` informa dependencias actualizadas y `npx -y expo-doctor` ahora aprueba **21/21 comprobaciones, sin problemas detectados**. TypeScript y las 18 pruebas también pasan. No se agregaron exclusiones para ocultar el chequeo. El APK anterior conserva las versiones antiguas; para incorporar estos parches, las etiquetas del formulario y el aviso de correo registrado hay que compilar una nueva APK desde esta revisión.
Exportación posterior a la actualización: Android, iOS y web completadas correctamente con las versiones nuevas.

### Validación de acceso sin confirmación — 20 de octubre de 2026
Se revisó el ciclo de alta y acceso con el SDK real y respuestas HTTP simuladas: alta con sesión inmediata, rechazo del mismo correo con espacios/mayúsculas, rechazo de contraseña incorrecta y acceso posterior con la misma identidad, conservando una sola cuenta en el servidor de prueba. Se ajustó la detección de respuesta ofuscada para no rechazar una sesión válida por una lista de identidades vacía. TypeScript y 20 pruebas pasan.

La API real `/auth/v1/settings` devolvió `mailer_autoconfirm: false`: al momento de esta revisión, Confirm email sigue activado. El panel de Supabase no terminó de cargar, por lo que este informe no afirma que se haya desactivado ni que se haya probado un alta real sin confirmación. Pendiente abrir el panel y guardar el cambio solicitado; después comprobar `mailer_autoconfirm: true` y auditar duplicados/pending de las cuentas reales. Los registros de preferencias pueden repetirse por usuario porque representan distintas preferencias, no cuentas duplicadas.
