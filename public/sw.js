// public/sw.js

const CACHE_NAME = 'bumbas-kitchen-static-v1';
const IMAGE_CACHE_NAME = 'bumbas-kitchen-images-v1';

// ১. ইনস্টল ইভেন্ট
self.addEventListener('install', (event) => {
  console.log('Service Worker Installed');
  self.skipWaiting();
});

// ২. অ্যাক্টিভেট ইভেন্ট
self.addEventListener('activate', (event) => {
  console.log('Service Worker Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // পুরনো ক্যাশ ক্লিন করা (যদি ভার্সন বদলায়)
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ৩. ★★★ ইমেজ ক্যাশিং লজিক (Network First, then Cache) ★★★
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // শুধুমাত্র Cloudinary ইমেজগুলোর জন্য
  if (url.hostname === 'res.cloudinary.com' && event.request.method === 'GET') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // যদি ক্যাশে থাকে, তবে সেখান থেকেই দাও
          if (cachedResponse) {
            return cachedResponse;
          }

          // না থাকলে নেটওয়ার্ক থেকে আনো এবং ক্যাশে সেভ করো
          return fetch(event.request).then((networkResponse) => {
            // রেসপন্স ক্লোন করতে হবে কারণ এটি একবারই পড়া যায়
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});

// ৪. পুশ নোটিফিকেশন লজিক (আগের মতোই থাকবে)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      image: data.image,
      badge: '/icons/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/'
      },
      actions: [{ action: 'explore', title: 'View Details' }]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});