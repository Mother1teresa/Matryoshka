importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

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
  console.log('[SW] Background:', payload);
  
  const { title, body } = payload.notification || {};
  
  self.registration.showNotification(title || 'Уведомление', {
    body: body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    data: { url: payload.data?.url || '/notifications' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});