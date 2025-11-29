// public/sw.js

self.addEventListener('install', (event) => {
  console.log('Service Worker Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker Activated');
  event.waitUntil(self.clients.claim());
});

// সার্ভার থেকে পুশ রিসিভ করার লজিক
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png', // আইকন পাথ চেক করুন
      image: data.image, // যদি কোনো ছবি থাকে
      badge: '/icons/badge.png', // স্ট্যাটাস বারের ছোট আইকন
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

// নোটিফিকেশনে ক্লিক করলে পেজ খোলার লজিক
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data.url) {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      );
  }
});