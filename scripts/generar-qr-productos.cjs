const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { toQR } = require("toqr");

const productos = [
  {
    v: 1,
    codigo: "ANT-001",
    titulo: "Relojes de colección",
    descripcion: "Piezas mecánicas que reúnen precisión, historia y diseño.",
    detalle:
      "Explora relojes de bolsillo y de sobremesa elaborados entre los siglos XIX y XX.",
    precio: 780000,
    imagen: "ANT-001.jpg",
  },
  {
    v: 1,
    codigo: "ANT-002",
    titulo: "Mobiliario clásico",
    descripcion:
      "Muebles antiguos restaurados con cuidado y materiales tradicionales.",
    detalle:
      "La colección incluye sillas, cómodas y mesas con acabados y herrajes de época.",
    precio: 1280000,
    imagen: "ANT-002.jpg",
  },
  {
    v: 1,
    codigo: "ANT-003",
    titulo: "Arte y pintura",
    descripcion: "Obras decorativas y piezas artísticas de distintas épocas.",
    detalle:
      "Cada obra reúne la información disponible sobre su técnica, procedencia y conservación.",
    precio: 620000,
    imagen: "ANT-003.jpg",
  },
  {
    v: 1,
    codigo: "ANT-004",
    titulo: "Porcelana decorativa",
    descripcion:
      "Objetos de porcelana y cerámica seleccionados por su valor estético e histórico.",
    detalle:
      "Encuentra jarrones, vajillas y figuras ornamentales con detalles artesanales.",
    precio: 460000,
    imagen: "ANT-004.jpg",
  },
];

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(name, data) {
  const type = Buffer.from(name, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, checksum]);
}

function qrPng(matrix, scale = 9, quietZone = 4) {
  const side = Math.sqrt(matrix.length);
  const modules = side + quietZone * 2;
  const width = modules * scale;
  const scanlines = Buffer.alloc((width * 4 + 1) * width, 255);
  for (let y = 0; y < width; y++) {
    const rowOffset = y * (width * 4 + 1);
    scanlines[rowOffset] = 0;
    const moduleY = Math.floor(y / scale) - quietZone;
    for (let x = 0; x < width; x++) {
      const moduleX = Math.floor(x / scale) - quietZone;
      const inside =
        moduleX >= 0 &&
        moduleX < side &&
        moduleY >= 0 &&
        moduleY < side;
      if (inside && matrix[moduleY * side + moduleX]) {
        const pixelOffset = rowOffset + 1 + x * 4;
        scanlines[pixelOffset] = 0;
        scanlines[pixelOffset + 1] = 0;
        scanlines[pixelOffset + 2] = 0;
      }
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(width, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(scanlines)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outputDir = path.join(__dirname, "..", "assets", "qr");
fs.mkdirSync(outputDir, { recursive: true });
for (const producto of productos) {
  const matrix = toQR(JSON.stringify(producto));
  const filePath = path.join(outputDir, `${producto.codigo}.png`);
  fs.writeFileSync(filePath, qrPng(matrix));
  console.log(`Generado ${filePath}`);
}
