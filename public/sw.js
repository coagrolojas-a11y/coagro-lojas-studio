/**
 * Service Worker Oficial — Coagro Agro Studio (PWA Offline Cache)
 * Versão do Cache: injetada no build por scripts/version-sw.mjs
 * (formato: coagro-studio-<hash do index.html>)
 *
 * Estratégia híbrida:
 * - HTML / Navegação: NetworkFirst com fallback para cache raiz (garante F5 offline sem tela branca)
 * - Assets locais (/assets/): CacheFirst com background revalidation
 * - Expurgo estrito de versões antigas no activate (CACHE_NAME muda a cada build)
 */

// Valor inicial; o build grava `coagro-studio-<hash>` em dist/sw.js.
const CACHE_NAME = 'coagro-studio-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon.jpg',
  '/tenant.config.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pré-cache parcial:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP(S)
  if (!url.protocol.startsWith('http')) return;

  // Não intercepta chamadas de CDN externa de modelos pesados (staticimgly.com)
  if (url.origin !== self.location.origin) return;

  // Navegação SPA -> NetworkFirst com fallback para index.html em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // caches.match devolve Promise: precisa de .then para saber se achou.
          caches.match('/index.html').then((r) => r || caches.match('/'))
        )
    );
    return;
  }

  // Assets locais (/assets/) -> CacheFirst com revalidação
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Só GET é cacheável. Deixar POST (ex.: /api/generate-content) cair aqui
  // fazia o .catch devolver caches.match(POST) = undefined -> rejeição confusa
  // para o fetch da IA quando offline.
  if (request.method !== 'GET') return;

  // Requisições gerais do app -> Network com fallback para Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok && request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
