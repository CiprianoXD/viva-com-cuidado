/* Service worker: e o que faz o app abrir mesmo sem internet.
   Mexeu em algum arquivo? Suba o numero da VERSAO abaixo — e so isso.
   O celular troca os arquivos velhos pelos novos sozinho. */

const VERSAO = "viva-4";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./demonstracao.html",
  "./manifest.json",
  "./config.js",
  "./css/estilo.css",
  "./js/figuras.js",
  "./js/dados.js",
  "./js/telas.js",
  "./icones/icone-192.png",
  "./icones/icone-512.png"
];

self.addEventListener("install", evento => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", evento => {
  const url = new URL(evento.request.url);

  // O Firebase precisa falar com a rede de verdade — nunca responder do cache.
  if (url.origin !== location.origin) return;
  if (evento.request.method !== "GET") return;
  // O servidor da casa (servidor.js) também: dado de agora, nunca de antes.
  if (url.pathname.includes("/api/")) return;

  evento.respondWith(
    caches.match(evento.request).then(guardado => {
      // Serve o que está guardado na hora e busca a versão nova por baixo.
      const rede = fetch(evento.request).then(resposta => {
        if (resposta && resposta.status === 200) {
          const copia = resposta.clone();
          caches.open(VERSAO).then(cache => cache.put(evento.request, copia));
        }
        return resposta;
      }).catch(() => guardado);
      return guardado || rede;
    })
  );
});

// Toque na notificação: traz o app para a frente em vez de abrir outra aba.
self.addEventListener("notificationclick", evento => {
  evento.notification.close();
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(abas => {
      for (const aba of abas) if ("focus" in aba) return aba.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./index.html");
    })
  );
});
