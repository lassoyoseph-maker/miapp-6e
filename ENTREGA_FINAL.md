# Revisión final — La Vitrina Muebles

Revisión del 19 de octubre de 2026 contra las cinco guías suministradas. Se conserva el mismo proyecto Expo y el mismo Supabase. Las instrucciones de Coffee App se toman como requisitos académicos de referencia y se adaptan a la tienda de muebles; no se copian la marca, los colores ni los datos de café.

| Guía | Requisito | Implementación / evidencia pendiente |
|---|---|---|
| Componentes, formulario y eventos | View, Text, TextInput, Pressable, ScrollView, StyleSheet, useState, onChangeText, onPress | Inicio, `FurniturePreview`, formulario y pantallas existentes |
| Componentes, formulario y eventos | Marca propia, dos elementos, dos imágenes pertinentes, tres campos, validación y resultado en la misma pantalla | La Vitrina Muebles; ilustraciones locales de sofá y comedor; borrador de solicitud con nombre, mueble y cantidad; validación 1–99 y resultado dentro de Inicio |
| Expo Router | Inicio → formulario → resultado; galería y contacto; navegación de regreso | Grupo `(app)`; rutas correspondientes y botones de Inicio |
| Expo Router | router.push, router.replace y useLocalSearchParams | Se pasa el ID del registro al resultado; los datos personales permanecen en contexto, fuera de la URL |
| Supabase | Cliente con clave pública, INSERT real, resultado del servidor y SELECT con FlatList | `saveFurnitureRegistration`, `loadFurnitureRegistrations`, `registros.tsx`; resultado utiliza UUID devuelto por el servidor |
| Supabase | Nombre, correo, teléfono, ciudad y café favorito; agregar tipo de preparación | Seis campos: nombre, correo, teléfono, ciudad, **mueble favorito** y **material preferido**; ambos últimos aparecen en resultado y lista |
| Supabase | Tres registros y evidencia en tabla | Deben ser tres registros reales de demostración desde la app; no se presentan datos simulados como evidencia de producción |
| Login y rutas protegidas | Registro y login, AuthContext, getSession, onAuthStateChange, AsyncStorage | Cliente y contexto existentes; pantallas públicas `/login` y `/registro` |
| Login y rutas protegidas | Grupos `(auth)` y `(app)`, Stack.Protected, bloqueo al salir | Implementado para todas las pantallas privadas; pantalla de usuario y cierre de sesión en Home |
| Login y rutas protegidas | Dos usuarios, contraseña incorrecta, persistencia tras cerrar y reabrir | Pruebas automáticas y simulador separados de las evidencias que deben obtenerse con cuentas reales y dispositivo |
| APK / EAS | Nombre propio, package Android, proyecto EAS, perfil preview con buildType apk | `app.json`, `eas.json`; proyecto @lassoyoseph/miapp-6e enlazado |
| APK / EAS | Build exitoso, archivo APK, instalación y registro desde Android | APK generado correctamente en EAS; pendiente instalarlo y obtener evidencias desde Android. Exportar JS no equivale a generar ni instalar un APK |

## Adaptaciones deliberadas

- `clientes_cafe` y los registros anteriores permanecen intactos. El formulario de la tienda usa `vitrina_preferencias`, con mueble/material y propietario derivado de `auth.uid()`.
- La consulta se limita a los registros de la cuenta autenticada mediante RLS. El ejemplo académico publicaba datos de todos los clientes: no se replica esa exposición de correos y teléfonos.
- Se mantiene la confirmación de correo configurada en Supabase. No se desactiva automáticamente una protección porque la guía de práctica lo sugiera. Si Supabase no devuelve sesión al registrarse, se muestra el mensaje para confirmar el correo.
- Las imágenes locales de muebles son ilustraciones del proyecto y se incluyen en el APK; la galería utiliza fotografías remotas y necesita internet.
- La cantidad de Inicio pertenece a un borrador local; la solicitud de compra se guarda solo al usar Comprar. No se anuncia una reserva ni un pago que la app no haya realizado.

## Guion para la sustentación y capturas

1. Abrir sin sesión: se muestra Login. Intentar abrir `/formulario` o `/registros`: sigue bloqueado.
2. Crear dos cuentas propias desde Registro, confirmar los correos si se solicita y comprobarlas en Authentication → Users. No publicar contraseñas ni tokens en capturas.
3. Probar contraseña incorrecta y luego entrar correctamente. Mostrar Home, catálogo, Ver usuario y Cerrar sesión.
4. Diligenciar nombre/mueble/cantidad en Inicio; mostrar validación y resumen en la misma pantalla.
5. Abrir Formulario: completar los seis campos. Guardar; capturar Resultado con ID, mueble y material.
6. Crear tres preferencias de demostración. Abrir Mis registros, recargar y comprobar que permanecen; mostrar las tres filas de la propia cuenta en Supabase.
7. Abrir Galería y Contacto. Mostrar las ilustraciones locales y las fotografías relacionadas con muebles.
8. Cerrar completamente la app sin salir; reabrir y comprobar persistencia. Después Cerrar sesión; comprobar que las rutas privadas ya no abren.
9. Descargar el APK de un build terminado, instalarlo en Android, repetir el registro y comparar el ID con Supabase. Capturar instalación, Home, formulario y fila del servidor.

## Comandos

```powershell
npm ci
Copy-Item .env.example .env.local # solo si todavía no existe
npm run typecheck
npm test
npm run check:connections
npx expo start --clear
npx expo export --platform all --max-workers 2 --clear
eas whoami
eas build -p android --profile preview
eas build:list --platform android --limit 1
```

El perfil preview incluye únicamente URL y clave publicable. Nunca agregar claves secretas al cliente ni a capturas. La migración de la tabla nueva ya está aplicada en el proyecto real; el archivo incluido permite revisar su esquema y políticas.

## Preguntas de cierre: respuestas para estudiar

**Componentes:** View agrupa; Text muestra texto; TextInput captura entradas. useState conserva estado en memoria; onChangeText lo actualiza y onPress ejecuta la acción. La función del resumen valida y prepara el texto; trim elimina espacios de los extremos. El renderizado condicional muestra componentes solo si se cumple una condición. ScrollView permite recorrer contenido largo. Una imagen local usa require y viaja con la app; una remota usa uri y requiere acceso al servidor. StyleSheet organiza estilos reutilizables.

**Navegación:** Expo Router deriva las rutas del nombre de archivo; los paréntesis crean grupos sin cambiar la URL. push agrega una pantalla al historial; replace sustituye la actual. useLocalSearchParams recupera parámetros de la ruta. En Resultado se usa solo el ID, y el contexto transporta los datos del registro reciente.

**Datos:** from selecciona la tabla. insert guarda filas y select consulta/devuelve columnas. Hay que comprobar error y data antes de anunciar éxito porque una petición puede fallar o no devolver un registro. RLS controla qué filas puede operar cada identidad. useState se pierde al reiniciar; PostgreSQL conserva los datos. El formulario espera el INSERT, usa la fila devuelta y la lista vuelve a consultar Supabase.

**Autenticación:** signUp crea una cuenta; signInWithPassword inicia una sesión existente. La sesión contiene la identidad y los tokens necesarios para autenticarse. AsyncStorage conserva esa sesión en el dispositivo. onAuthStateChange comunica sus cambios al contexto. Una ruta pública admite usuarios sin sesión; una privada exige sesión. signOut elimina la sesión local y el guard bloquea las pantallas privadas. Proteger la navegación no sustituye RLS: un cliente puede llamar a la API sin usar la interfaz.

**APK:** APK permite instalación directa; AAB se utiliza normalmente para distribución en Google Play. EAS compila y firma con un keystore. `preview.android.buildType = apk` solicita el instalador. Un build fallido se corrige y se vuelve a ejecutar sin crear otro proyecto; un build terminado se recupera desde el historial.

## Validación realizada en esta revisión

- TypeScript: sin errores; 15 pruebas automatizadas aprobadas (Auth, precio, errores, INSERT/SELECT y campos de muebles).
- Exportación de producción: Android, iOS y web completadas. Son paquetes JavaScript, no evidencia de instalación Android.
- Conexiones reales: Auth 200, catálogo 200, SDK 200; las dos bandejas antiguas deniegan SELECT anónimo con 42501, como corresponde.
- Navegador con simulador local: acceso directo a Formulario sin sesión redirige a Login; login abre Inicio; seis campos llegan a Resultado con UUID del servidor simulado; Mis registros recupera la fila; recargar conserva la sesión; logout vuelve a Login. En 320 px la lista no presenta desbordamiento horizontal.
- Estas pruebas con servidor simulado no sustituyen crear dos cuentas reales, tres registros reales y probar el APK instalado. Esas evidencias se deben identificar como pendientes hasta realizarlas.
- Se reemplazó el primer intento EAS por una compilación de la revisión final, con icono cuadrado y navegación definitiva. Consultar el build más reciente del perfil preview.

Referencias técnicas consultadas: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [rutas protegidas](https://docs.expo.dev/router/advanced/protected/), [RLS en Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Base de datos validada después de la autorización
La migración de preferencias se aplicó correctamente en `bprerqyiorgovbponcdw`. Una prueba dentro de una transacción cambió al rol authenticated, insertó una preferencia bajo el UID de una cuenta existente, comprobó SELECT propio y cambió a otro UID para comprobar que no viera la fila. La transacción se revirtió para no dejar datos de prueba. El chequeo público de conexiones confirma que `vitrina_preferencias` existe y rechaza SELECT anónimo con HTTP 401 / 42501.

Verificación adicional real: RLS activo; dos políticas; SELECT anónimo deshabilitado; INSERT de campos de formulario habilitado para authenticated; cambiar `usuario_id` mediante INSERT deshabilitado; cero residuos de prueba. Supabase tiene dos cuentas existentes (no se afirma que hayan sido creadas durante esta revisión). El script reproducible está en `supabase/tests/preferences_rls.sql`.

Asesor de seguridad ejecutado después de la migración: **0 errores y 7 advertencias**, las mismas advertencias documentadas de las tablas y configuración anteriores. Evidencia de permisos: [captura de Supabase](./docs/validacion/supabase-permisos.png).

Build final solicitado con el código del commit `58bfca9`: [ver build APK en EAS](https://expo.dev/accounts/lassoyoseph/projects/miapp-6e/builds/04e3586c-e69b-4e7f-a04f-3ded0df71522).

Capturas de la versión web (no equivalen a instalación Android): [Login](./docs/validacion/login-web.png) · [Registro](./docs/validacion/registro-web.png). En el cliente de producción, Supabase rechazó correctamente un intento con credenciales inválidas; no se obtuvo sesión ni acceso a rutas privadas.

## APK generado

**EAS: FINISHED / Tuvo éxito.** [Descargar APK](https://expo.dev/artifacts/eas/AyzFYYNFwezACLYy-EkfcZ71OVhbvKRH_VvHnMQLM9A.apk) · [Ver build](https://expo.dev/accounts/lassoyoseph/projects/miapp-6e/builds/04e3586c-e69b-4e7f-a04f-3ded0df71522) · [Captura del build exitoso](./docs/validacion/eas-apk-exitoso.png).

Aplicación: La Vitrina Muebles 1.0.0 (1), paquete Android com.lassoyoseph.lavitrina. Tamaño: 104.709.259 bytes. Se descargó el archivo y se comprobó su estructura APK con AndroidManifest.xml y classes.dex. Esta comprobación no sustituye instalar y recorrer la app en un dispositivo.

SHA-256: 8B3A7208237D3DFC641480ACA2A442E8C888D83AA78CE147DA0001F8C8204884

El instalador también se guardó en Descargas como LaVitrina-Muebles-1.0.0-04e3586c.apk. EAS conserva este artefacto temporalmente: guardar una copia para la entrega.

En el build, expo-doctor aprobó 20 de 21 comprobaciones; advirtió cinco parches más recientes dentro de SDK 57: @expo/ui, expo, expo-constants, expo-linking y expo-router. La compilación nativa terminó correctamente con las versiones bloqueadas del proyecto. No se afirma que expo-doctor esté completamente limpio.

Pendientes de evidencia del estudiante: instalación en Android, tres preferencias creadas desde la APK y comparación de esas filas con Supabase, capturas del recorrido completo y persistencia al cerrar/reabrir la aplicación instalada. Las dos cuentas existentes se verificaron por conteo; aún debe obtenerse la captura de Authentication → Users para la entrega.

Las tres fotografías remotas de la galería respondieron HTTP 200 con Content-Type image/jpeg durante esta revisión.

## Documentos contrastados

- Guia_Laboratorio_1_React_Native_Componentes_Formulario_Eventos (6).docx
- Guia_Laboratorio_Expo_Router_App_Coffee (1).docx
- Laboratorio_Coffee_App_Supabase (3).docx
- Laboratorio_Coffee_App_Login_Rutas_Protegidas (1).docx
- Guia_Laboratorio_Generacion_APK_Expo_EAS (2).docx
