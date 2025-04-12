const CACHE_NAME = 'jkft-cache-v1.9';
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
  './carddata15.js',
  './carddata16.js',
  './carddata17.js',
  './carddata18.js',
  './carddata19.js',
  './carddata20.js',
  './carddata21.js',
  './carddata22.js',
  './carddata23.js',
  './carddata24.js',
  //'./carddata21.js',
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
  // Vérifier si la requête concerne une image
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/)) {
    // Pour les images, utiliser le réseau sans mise en cache
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // En cas d'échec (hors ligne), essayer de servir depuis le cache si disponible
          return caches.match(event.request);
        })
    );
  } else {
    // Pour tout le reste (HTML, JS, CSS, etc.), utiliser la stratégie "Cache first, then network"
    event.respondWith(
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
  }
});