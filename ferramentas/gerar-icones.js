/* Gera os icones do app (PNG) sem depender de nada instalado.
   Rode com:  node ferramentas/gerar-icones.js
   Mexeu nas cores? Rode de novo e os PNG sao regravados. */

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const FUNDO = [0x15, 0x65, 0xd8];   // o mesmo --azul do app
const CLARO = [0xff, 0xff, 0xff];   // metade branca da capsula
const VIVO = [0xe8, 0x44, 0x3c];   // metade vermelha da capsula

// ---------- PNG cru ----------
const TABELA = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABELA[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length, 0);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo), 0);
  return Buffer.concat([tamanho, corpo, crc]);
}

function png(largura, altura, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;    // 8 bits por canal
  ihdr[9] = 6;    // RGBA
  // linhas com o byte de filtro 0 na frente
  const linhas = Buffer.alloc(altura * (largura * 4 + 1));
  for (let y = 0; y < altura; y++) {
    linhas[y * (largura * 4 + 1)] = 0;
    rgba.copy(linhas, y * (largura * 4 + 1) + 1, y * largura * 4, (y + 1) * largura * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(linhas, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ---------- o desenho: uma capsula na diagonal ----------
// Distancia de um ponto ao segmento que forma o eixo da capsula.
function distanciaAoEixo(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const cx = ax + t * dx, cy = ay + t * dy;
  return { d: Math.hypot(px - cx, py - cy), t };
}

function desenhar(s) {
  const rgba = Buffer.alloc(s * s * 4);
  const amostras = 3;                       // 3x3 por pixel, para a borda sair lisa
  const ax = s * 0.33, ay = s * 0.67;       // ponta de baixo
  const bx = s * 0.67, by = s * 0.33;       // ponta de cima
  const raio = s * 0.125;

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      let somaR = 0, somaG = 0, somaB = 0;
      for (let sy = 0; sy < amostras; sy++) {
        for (let sx = 0; sx < amostras; sx++) {
          const px = x + (sx + 0.5) / amostras;
          const py = y + (sy + 0.5) / amostras;
          const { d, t } = distanciaAoEixo(px, py, ax, ay, bx, by);
          const cor = d <= raio ? (t < 0.5 ? VIVO : CLARO) : FUNDO;
          somaR += cor[0]; somaG += cor[1]; somaB += cor[2];
        }
      }
      const n = amostras * amostras;
      const i = (y * s + x) * 4;
      rgba[i] = Math.round(somaR / n);
      rgba[i + 1] = Math.round(somaG / n);
      rgba[i + 2] = Math.round(somaB / n);
      rgba[i + 3] = 255;                    // fundo cheio: o Android recorta o formato que quiser
    }
  }
  return png(s, s, rgba);
}

const destino = path.join(__dirname, "..", "icones");
fs.mkdirSync(destino, { recursive: true });
[192, 512].forEach(s => {
  const arquivo = path.join(destino, `icone-${s}.png`);
  fs.writeFileSync(arquivo, desenhar(s));
  console.log("gravado:", arquivo);
});
