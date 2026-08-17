<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import { useAuthStore } from '/src/stores/authStore.js';

const auth = useAuthStore();
const notifications = computed(() => auth.allNotifications);
const isLoading = computed(() => auth.isNotificationsLoading);
const error = computed(() => auth.notificationsError);

const browserPermission = ref('default');
const isInitializing = ref(false);

const syncPermission = async () => {
  if (!('Notification' in window)) {
    browserPermission.value = 'no-support';
    return;
  }
  browserPermission.value = Notification.permission;
  if (browserPermission.value === 'granted' && !auth.fcmToken && auth.user?.id) {
    isInitializing.value = true;
    try {
      await auth.initFCM();
    } catch (e) {
      console.error('[Notifications] Auto-init FCM error:', e);
    } finally {
      isInitializing.value = false;
    }
  }
};

onMounted(syncPermission);

watch(
  () => auth.user?.id,
  (id) => {
    if (id) {
      auth.fetchUserNotifications();
      syncPermission();
    } else {
      auth.allNotifications = [];
    }
  },
  { immediate: true }
);

const enableNotifications = async () => {
  if (isInitializing.value) return;
  isInitializing.value = true;
  try {
    const result = await auth.initFCM();
    browserPermission.value = Notification.permission;
    if (result?.status === 'granted' && auth.fcmToken) {
      auth.fetchUserNotifications();
    }
  } catch (e) {
    console.error('[Notifications] FCM init error:', e);
  } finally {
    isInitializing.value = false;
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU');
};

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};
</script>
<template>
  <div class="general-container notifications-container">
    <h2 class="page-title">Уведомления</h2>
    <div v-if="browserPermission === 'no-support'" class="fcm-alert error">
      <p>⚠️ Браузер не поддерживает push-уведомления.</p>
    </div>
    <div v-else-if="browserPermission === 'denied'" class="fcm-alert error">
      <p>
        ⚠️ Уведомления заблокированы в настройках браузера.<br />
        Разблокируйте их для этого сайта и перезагрузите страницу.
      </p>
    </div>
    <div v-else-if="auth.fcmToken" class="fcm-alert success">
      <p>✅ Уведомления включены.</p>
    </div>
    <div v-else class="fcm-alert">
      <p>Получайте мгновенные уведомления о сообщениях, заказах и ответах.</p>
      <button class="btn enable-btn" @click="enableNotifications" :disabled="isInitializing">
        {{ isInitializing ? 'Инициализация пушей…' : 'Включить уведомления' }}
      </button>
    </div>

    <div v-if="error" class="fcm-alert error">
      <p>⚠️ {{ error }}</p>
      <button class="btn enable-btn" @click="auth.fetchUserNotifications()">Повторить</button>
    </div>

    <div v-if="isLoading" class="loading-state">Загрузка уведомлений…</div>

    <div v-else class="notifications-list">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification-card"
        :class="{ unread: !item.is_read }"
      >
        <div class="notification-content">
          <p class="notification-text">{{ item.message }}</p>
        </div>
        <div class="notification-meta">
          <span class="date">{{ formatDate(item.createdAt) }}</span>
          <span class="time">{{ formatTime(item.createdAt) }}</span>
        </div>
      </div>
      <div v-if="notifications.length === 0" class="empty-messages">
        <h3>У вас пока нет уведомлений</h3>
      </div>
    </div>
  </div>
</template>
<style scoped>
.notifications-list {display: flex;flex-direction: column;gap: 1.25rem;margin-top: 2.5rem;}
.notification-card {background: #fff;border-radius: 1.25rem;padding: 1.25rem 1.5rem;display: flex;justify-content: space-between;gap: 1rem;}
.notification-content {flex: 1;}
.notification-text {font-size: 1rem;color: #111;margin: 0;}
.notification-meta {text-align: right;font-size: 0.875rem;color: #8e8c8c;white-space: nowrap;}
.date,.time {display: block;}
.fcm-alert {background: #fef3c7;border: 1px solid #f59e0b;border-radius: 0.75rem;padding: 1rem;margin-top: 1.25rem;color: #92400e;font-size: 0.875rem;}
.fcm-alert.error {background: #fee2e2;border-color: #ef4444;color: #991b1b;}
.enable-btn {margin-top: 0.5rem;background: var(--btn-bg);color: white;border: none;padding: 0.5rem 1rem;border-radius: 0.5rem;cursor: pointer;}
.empty-messages {text-align: center;padding: 4rem 1rem;background: #fff;border-radius: 1.25rem;}
.empty-messages h3 {font-size: 1.0625rem;color: #888;font-weight: 500;}
.loading-state {text-align: center;padding: 2rem;color: #888;}
</style>