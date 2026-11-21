# Códigos QR de La Vitrina

Cada imagen contiene un JSON individual con el nombre, código, descripción, especificaciones, precio y el nombre del archivo de imagen del producto. El escáner integrado de La Vitrina lee esos datos y abre la ficha completa; la imagen se carga desde `assets/productos/` dentro de la app.

| Archivo | Registro | Uso |
| --- | --- | --- |
| `ANT-001.png` | Relojes de colección | Ficha con su imagen y datos propios |
| `ANT-002.png` | Mobiliario clásico | Ficha con su imagen y datos propios |
| `ANT-003.png` | Arte y pintura | Ficha con su imagen y datos propios |
| `ANT-004.png` | Porcelana decorativa | Ficha con su imagen y datos propios |
| `ANT-999.png` | Sin registro | Prueba de código inexistente |

Los cuatro QR se regeneran con `npm run qr:generate`. Escanéalos desde la opción «Escanear código QR» de La Vitrina para ver la ficha del producto.
