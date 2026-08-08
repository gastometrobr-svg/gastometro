const CACHE_NAME = 'gastometro-v6';
const urlsToCache = [
  '/gastometro/manifest.json'
  // index.html NÃO entra no cache — sempre busca do servidor
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // ativa imediatamente sem esperar fechar abas antigas
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // toma controle de todas as abas abertas
  );
  // Recarrega todos os clientes abertos quando nova versão ativa
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.navigate(client.url));
  });
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // index.html: sempre busca do servidor (nunca cache)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Outros recursos: rede primeiro, cache como fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
