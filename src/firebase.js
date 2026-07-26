import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "ТВОЙ_apiKey",
  authDomain: "matreshka-28074.firebaseapp.com",
  projectId: "matreshka-28074",
  storageBucket: "matreshka-28074.appspot.com",
  messagingSenderId: "ТВОЙ_messagingSenderId",
  appId: "ТВОЙ_appId"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = 'ТВОЙ_VAPID_ПУБЛИЧНЫЙ_КЛЮЧ';

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