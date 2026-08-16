import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { notify } from '/src/utils/notify';
let swRegistration = null;

const firebaseConfig = {
  apiKey: "AIzaSyBi3wlB19ePnlncTKVab7cXaWzV9ksfdNg",
  authDomain: "matreshka-28074.firebaseapp.com",
  projectId: "matreshka-28074",
  storageBucket: "matreshka-28074.firebasestorage.app",
  messagingSenderId: "788752225889",
  appId: "1:788752225889:web:4c3f06ba5a20ec67583c20",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function getFCMToken(registration) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, status: permission }; 
    }
    const swReg = registration || await navigator.serviceWorker.ready;
    
    console.log('[FCM] SW scope:', swReg.scope);
    console.log('[FCM] SW state:', swReg.active?.state);

    // ⬇️ ХАРДКОД для теста
    const vapidKey = "BLK0fPBbaxWUASW4VSNIWR9ziseyrncDvgd1VIEI9RdyMdEdzIY3IYUkfE-9EkkzGcy1i1gv-WI1h_4lsWdnkjE";
    console.log('[FCM] VAPID key length:', vapidKey.length);

    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swReg,
    });
    console.log('[FCM] getToken returned:', token ? 'token exists' : 'NULL');

    if (!token) {
      return { token: null, status: 'no-token' };
    }
    return { token, status: 'granted' };
  } catch (err) {
    console.error('[FCM] getToken error:', err);
    return { token: null, status: 'error', error: err.message };
  }
}

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// export async function registerServiceWorker() {
//   if (swRegistration) return swRegistration;
//   if (!('serviceWorker' in navigator)) {
//     throw new Error('Service Worker не поддерживается браузером');
//   }
//   swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
//     scope: '/',
//   });
//   await navigator.serviceWorker.ready;
//   return swRegistration;
// }

// export async function getFCMToken(registration) {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       return { token: null, status: permission }; 
//     }
//     const swReg = registration || await navigator.serviceWorker.ready;
//     console.log('[FCM] SW scope:', swReg.scope);
//     console.log('[FCM] SW state:', swReg.active?.state);
//     console.log('[FCM] VAPID key present:', !!import.meta.env.VITE_FIREBASE_VAPID_KEY);
//     console.log('[FCM] VAPID key length:', import.meta.env.VITE_FIREBASE_VAPID_KEY?.length);

//     const token = await getToken(messaging, {
//       vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
//       serviceWorkerRegistration: swReg,
//     });
//     console.log('[FCM] getToken returned:', token ? 'token exists' : 'NULL');

//     if (!token) {
//       return { token: null, status: 'no-token' };
//     }
//     return { token, status: 'granted' };
//   } catch (err) {
//     console.error('[FCM] getToken error:', err);
//     return { token: null, status: 'error', error: err.message };
//   }
// }

// export function listenToMessages(callback) {
//   return onMessage(messaging, (payload) => {
//     console.log('[FCM] Foreground message:', payload);
//     callback(payload);
//     const { title, body } = payload.notification || {};
//     if (title) notify(body || title, 'info');
//   });
// }
// export async function removeFCMToken() {
//   try {
//     await deleteToken(messaging);
//     return true;
//   } catch (e) {
//     console.error('[FCM] deleteToken error:', e);
//     return false;
//   }
// }