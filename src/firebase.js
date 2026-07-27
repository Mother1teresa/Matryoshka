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
const messaging = getMessaging(app);

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function getFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Пользователь отказал в уведомлениях');
      return null;
    }
    
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      console.log('[FCM] Токен не получен');
      return null;
    }
    
    console.log('[FCM] Токен:', token);
    return token;
  } catch (err) {
    console.error('[FCM] Ошибка:', err);
    return null;
  }
}

export function listenToMessages(callback) {
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message:', payload);
    callback(payload);
  });
}