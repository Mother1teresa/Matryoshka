// importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// firebase.initializeApp({
//   apiKey: "__FIREBASE_API_KEY__",
//   authDomain: "matreshka-28074.firebaseapp.com",
//   projectId: "matreshka-28074",
//   storageBucket: "matreshka-28074.firebasestorage.app",
//   messagingSenderId: "788752225889",
//   appId: "1:788752225889:web:4c3f06ba5a20ec67583c20"
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   const { title, body, image } = payload.notification || {};
//   const data = payload.data || {};

//   self.registration.showNotification(title || 'Уведомление', {
//     body: body || '',
//     icon: '/icon-192x192.png',
//     badge: '/icon-96x96.png',
//     image: image || undefined,
//     tag: data.tag || 'general',
//     renotify: false,
//     requireInteraction: false,
//     data: {
//       url: data.url || data.click_action || '/notifications',
//       messageId: data.messageId || payload.messageId,
//     },
//   });
// });

// self.addEventListener('push', (event) => {
//   if (!event.data) return;
//   const payload = event.data.json();
//   const { title, body } = payload.notification || {};
//   event.waitUntil(
//     self.registration.showNotification(title || 'Уведомление', {
//       body: body || '',
//       icon: '/icon-192x192.png',
//       data: { url: payload.data?.url || '/notifications' },
//     })
//   );
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   const targetUrl = event.notification.data?.url || '/notifications';

//   event.waitUntil(
//     clients
//       .matchAll({ type: 'window', includeUncontrolled: true })
//       .then((windowClients) => {
//         for (const client of windowClients) {
//           if (client.url.includes(targetUrl) && 'focus' in client) {
//             return client.focus();
//           }
//         }
//         for (const client of windowClients) {
//           const clientOrigin = new URL(client.url).origin;
//           if (clientOrigin === self.location.origin && 'navigate' in client) {
//             return client.navigate(targetUrl).then((c) => c.focus());
//           }
//         }
//         if (clients.openWindow) return clients.openWindow(targetUrl);
//       })
//       .catch((err) => {
//         console.error('[SW] Notification click error:', err);
//         if (clients.openWindow) return clients.openWindow('/');
//       })
//   );
// });

// self.addEventListener('install', () => self.skipWaiting());
// self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBi3wlB19ePnlncTKVab7cXaWzV9ksfdNg",
  authDomain: "matreshka-28074.firebaseapp.com",
  projectId: "matreshka-28074",
  storageBucket: "matreshka-28074.firebasestorage.app",
  messagingSenderId: "788752225889",
  appId: "1:788752225889:web:4c3f06ba5a20ec67583c20"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Уведомление', {
    body: body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    data: { url: payload.data?.url || '/notifications' },
    requireInteraction: true
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));