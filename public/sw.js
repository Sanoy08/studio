// public/sw.js

const CACHE_NAME = 'bumbas-kitchen-images-v1';

// ১. ইনস্টল ইভেন্ট
self.addEventListener('install', (event) => {
  console.log('Service Worker Installed');
  self.skipWaiting();
});

// ২. অ্যাক্টিভেট ইভেন্ট (পুরনো ক্যাশ ক্লিন করা)
self.addEventListener('activate', (event) => {
  console.log('Service Worker Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ৩. ফেচ ইভেন্ট (ইমেজ ক্যাশ করা) - এটিই আসল কাজ করবে
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // শুধুমাত্র GET রিকোয়েস্ট এবং ইমেজ ফাইল চেক করা হচ্ছে
  // বিশেষ করে Cloudinary-র ছবিগুলো ক্যাশ করা হবে
  if (
    request.method === 'GET' && 
    (request.destination === 'image' || request.url.includes('res.cloudinary.com'))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // যদি ক্যাশে থাকে, তবে সেখান থেকেই দাও (ব্যান্ডউইথ বাঁচবে)
        if (cachedResponse) {
          return cachedResponse;
        }

        // যদি না থাকে, ইন্টারনেট থেকে আনো এবং ক্যাশে সেভ করো
        return fetch(request).then((networkResponse) => {
          // রেসপন্স ভ্যালিড কি না চেক করা
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // রেসপন্স ক্লোন করে ক্যাশে রাখা
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
  }
});

// ৪. পুশ নোটিফিকেশন লজিক (আগের মতো)
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
      actions: [
        { action: 'explore', title: 'View Details' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data.url) {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      );
  }
});