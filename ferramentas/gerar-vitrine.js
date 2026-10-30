/* Monta um arquivo unico com a demonstracao dos dois aparelhos,
   para publicar como link de visualizacao (Artifact do Claude).

   Nao existe codigo novo aqui: ele so junta os mesmos arquivos do
   app num HTML so. Mexeu no app? Rode de novo:

       node ferramentas/gerar-vitrine.js

   O que muda em relacao ao app:
     · sem Firebase (o visualizador bloqueia scripts de fora),
       entao a demonstracao roda na memoria do navegador — que e
       exatamente o que ela precisa;
     · sem service worker e sem manifest (nao se instala por ali). */

const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const ler = p => fs.readFileSync(path.join(raiz, p), "utf8");

let html = ler("demonstracao.html");
const css = ler("css/estilo.css");
const js = ["config.js", "js/figuras.js", "js/dados.js", "js/telas.js"].map(ler).join("\n\n");

// o script de arranque que já está na página
const arranque = (html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/) || [, ""])[1];

// só o miolo do body, sem os <script>
let corpo = (html.match(/<body>([\s\S]*?)<\/body>/) || [, ""])[1];
corpo = corpo.replace(/<script[\s\S]*?<\/script>/g, "").trim();

const saida = `<title>Viva com Cuidado</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Playfair+Display:wght@700;900&display=swap">

<style>
${css}
</style>

${corpo}

<script>
${js}
</script>

<script>
${arranque}
</script>
`;

const destino = path.join(raiz, "dist");
fs.mkdirSync(destino, { recursive: true });
const arquivo = path.join(destino, "vitrine.html");
fs.writeFileSync(arquivo, saida, "utf8");
console.log("gravado:", arquivo, "(" + Math.round(saida.length / 1024) + " KB)");
