/* ============================================================
   SERVIDOR DA CASA — liga os dois aparelhos sem Firebase.

   Roda neste computador e serve o app para os celulares que
   estiverem no MESMO Wi-Fi. Os dados de cada casa ficam aqui,
   em dados-servidor/casas.json, e cada mudança é avisada na
   hora para os outros aparelhos da mesma casa.

   Como rodar:   node servidor.js
   (precisa só do Node instalado — não tem pacote para baixar)

   Se o config.js tiver Firebase preenchido, o app usa o
   Firebase e ignora este servidor.
   ============================================================ */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORTA = Number(process.env.PORT) || 8080;
const RAIZ = __dirname;
const PASTA_DADOS = path.join(RAIZ, "dados-servidor");
const ARQUIVO_DADOS = path.join(PASTA_DADOS, "casas.json");
const LIMITE_CORPO = 1024 * 1024;          // 1 MB por envio é muito mais que o suficiente
const PARTES = ["cadastro", "registro"];
const CODIGO_VALIDO = /^[A-Z0-9]{4,6}$/;    // 6 no uso normal; "DEMO" na demonstração

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8"
};

// ---------- os dados ----------
let casas = {};
try { casas = JSON.parse(fs.readFileSync(ARQUIVO_DADOS, "utf8")); } catch (e) { casas = {}; }

// Junta as gravações em disco: no máximo uma a cada meio segundo.
let gravacaoMarcada = null;
function gravarDisco() {
  if (gravacaoMarcada) return;
  gravacaoMarcada = setTimeout(() => {
    gravacaoMarcada = null;
    fs.mkdirSync(PASTA_DADOS, { recursive: true });
    const temp = ARQUIVO_DADOS + ".tmp";
    fs.writeFileSync(temp, JSON.stringify(casas));
    fs.renameSync(temp, ARQUIVO_DADOS);
  }, 500);
}

// ---------- quem está escutando cada casa ----------
const ouvintes = {};   // codigo -> Set de respostas abertas

function avisarCasa(codigo, parte) {
  const valor = (casas[codigo] && casas[codigo][parte]) || null;
  const msg = "data: " + JSON.stringify({ parte, valor }) + "\n\n";
  (ouvintes[codigo] || []).forEach(res => res.write(msg));
}

// ---------- respostas ----------
function responderJson(res, status, corpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(corpo));
}

function servirArquivo(req, res, caminhoUrl) {
  let relativo = decodeURIComponent(caminhoUrl);
  if (relativo === "/" || relativo === "") relativo = "/index.html";
  const absoluto = path.normalize(path.join(RAIZ, relativo));

  // Nada fora da pasta do app, e nada da pasta de dados.
  if (!absoluto.startsWith(RAIZ + path.sep) || absoluto.startsWith(PASTA_DADOS)) {
    return responderJson(res, 403, { erro: "proibido" });
  }

  fs.readFile(absoluto, (erro, conteudo) => {
    if (erro) return responderJson(res, 404, { erro: "não encontrado" });
    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(absoluto).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(conteudo);
  });
}

function lerCorpo(req, pronto) {
  let tamanho = 0;
  const pedacos = [];
  req.on("data", p => {
    tamanho += p.length;
    if (tamanho > LIMITE_CORPO) { pronto(new Error("grande demais")); req.destroy(); return; }
    pedacos.push(p);
  });
  req.on("end", () => {
    try { pronto(null, JSON.parse(Buffer.concat(pedacos).toString("utf8"))); }
    catch (e) { pronto(e); }
  });
}

// ---------- rotas ----------
//   GET  /api/ping                      o app pergunta se este servidor existe
//   GET  /api/casas/CODIGO/eventos      fica aberto: manda o estado e cada mudança
//   PUT  /api/casas/CODIGO/cadastro     grava o cadastro (quem cuida)
//   PUT  /api/casas/CODIGO/registro     grava o registro (quem é cuidado)
function tratarApi(req, res, partes) {
  if (partes[0] === "ping" && partes.length === 1) return responderJson(res, 200, { ok: true });

  if (partes[0] !== "casas" || partes.length !== 3) return responderJson(res, 404, { erro: "rota desconhecida" });

  const codigo = partes[1].toUpperCase();
  if (!CODIGO_VALIDO.test(codigo)) return responderJson(res, 400, { erro: "código inválido" });

  if (partes[2] === "eventos" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "Connection": "keep-alive"
    });
    res.write("retry: 3000\n\n");
    (ouvintes[codigo] = ouvintes[codigo] || new Set()).add(res);
    PARTES.forEach(parte => {
      const valor = (casas[codigo] && casas[codigo][parte]) || null;
      res.write("data: " + JSON.stringify({ parte, valor }) + "\n\n");
    });
    // Mantém a conexão viva através de roteadores que derrubam conexão parada.
    const batida = setInterval(() => res.write(": ainda aqui\n\n"), 25000);
    req.on("close", () => { clearInterval(batida); ouvintes[codigo].delete(res); });
    return;
  }

  if (PARTES.includes(partes[2]) && req.method === "PUT") {
    return lerCorpo(req, (erro, valor) => {
      if (erro || !valor || typeof valor !== "object") return responderJson(res, 400, { erro: "conteúdo inválido" });
      casas[codigo] = casas[codigo] || {};
      casas[codigo][partes[2]] = valor;
      gravarDisco();
      avisarCasa(codigo, partes[2]);
      responderJson(res, 200, { ok: true });
    });
  }

  responderJson(res, 405, { erro: "método não aceito" });
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    return tratarApi(req, res, url.pathname.slice(5).split("/").filter(Boolean));
  }
  if (req.method !== "GET" && req.method !== "HEAD") return responderJson(res, 405, { erro: "método não aceito" });
  servirArquivo(req, res, url.pathname);
});

servidor.listen(PORTA, "0.0.0.0", () => {
  console.log("\nViva com Cuidado no ar.\n");
  console.log("  Neste computador:   http://localhost:" + PORTA);
  const enderecos = [];
  Object.values(os.networkInterfaces()).forEach(lista => (lista || []).forEach(i => {
    if (i.family === "IPv4" && !i.internal) enderecos.push(i.address);
  }));
  enderecos.forEach(ip => console.log("  Nos celulares:      http://" + ip + ":" + PORTA));
  console.log("\nOs celulares precisam estar no mesmo Wi-Fi deste computador.");
  console.log("Para desligar: Ctrl+C\n");
});
