import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBi3wlB19ePnlncTKVab7cXaWzV9ksfdNg",
  authDomain: "matreshka-28074.firebaseapp.com",
  projectId: "matreshka-28074",
  storageBucket: "matreshka-28074.firebasestorage.app",
  messagingSenderId: "788752225889",
  appId: "1:788752225889:web:4c3f06ba5a20ec67583c20"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = 'BLK0fPBbaxWUASW4VSNIWR9ziseyrncDvgd1VIEI9RdyMdEdzIY3IYUkfE-9EkkzGcy1i1gv-WI1h_4lsWdnkjE';

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