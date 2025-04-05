const CACHE_NAME = 'jkft-cache-v1.1';
const urlsToCache = [
  './',
  './index.html',
  './carddata1.js',
  './carddata2.js',
  './carddata3.js',
  './carddata4.js',
  './carddata5.js',
  './carddata6.js',
  './carddata7.js',
  './carddata8.js',
  './carddata9.js',
  './carddata10.js',
  './carddata11.js',
  './carddata12.js',
  './carddata13.js',
  './carddata14.js',
  './alarm.wav'
  // Ajoutez tous vos fichiers JS et autres ressources
];

// Installation du service worker
self.addEventListener('install', (event) => {
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  // Prend le contrôle immédiatement
  event.waitUntil(self.clients.claim());

   // Nettoie les anciens caches
   event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Stratégie "Cache first, then network"
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Si trouvé dans le cache, retourne directement
        }
        
        // Sinon, va chercher sur le réseau
        return fetch(event.request).then(
          (networkResponse) => {
            // Ne pas mettre en cache si la réponse n'est pas valide
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          }
        );
      })
  );
});