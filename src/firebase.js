import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function getFCMToken() {
  try {
    if (!('Notification' in window)) {
      return { token: null, status: 'unsupported' };
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
      return { token: null, status: 'denied' };
    }

    if (permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        return { token: null, status: result };
      }
    }

    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      return { token: null, status: 'no-token' };
    }

    return { token, status: 'granted' };
  } catch (err) {
    console.error('[FCM] Ошибка:', err);
    return { token: null, status: 'error' };
  }
}

export function listenToMessages(callback) {
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message:', payload);
    callback(payload);
  });
}