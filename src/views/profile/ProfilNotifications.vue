<script setup>
import { computed, watch } from 'vue';
import { useAuthStore } from '/src/stores/authStore.js';

const auth = useAuthStore();
const notifications = computed(() => auth.allNotifications);
const isLoading = computed(() => auth.isNotificationsLoading);
const fcmMissing = computed(() => auth.isAuthenticated && !auth.fcmToken);

watch(
  () => auth.user?.id,
  (id) => {
    if (id) auth.fetchUserNotifications();
    else auth.allNotifications = [];
  },
  { immediate: true }
);

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU');
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};
const enableNotifications = async () => {
  await auth.initFCM();
  if (auth.fcmToken) {
    auth.fetchUserNotifications();
  }
};
</script>
<template>
  <div class="general-container notifications-container">
    <h2 class="page-title">Уведомления</h2>
    <div v-if="fcmMissing" class="fcm-alert">
      <p>Уведомления в браузере отключены.</p>
      <button class="btn enable-btn" @click="enableNotifications">
        Включить уведомления
      </button>
    </div>
    <div v-else-if="permissionStatus === 'sw-missing'" class="fcm-alert error">
      <p>⚠️ Service Worker не найден.</p>
      <p>Создайте файл <code>public/firebase-messaging-sw.js</code> и перезапустите dev-сервер.</p>
    </div>
    <div v-if="isLoading" class="loading-state">Загрузка...</div>
    <div v-else class="notifications-list">
      <div v-for="item in notifications" :key="item.id" class="notification-card">
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
.enable-btn {margin-top: 0.5rem;background: var(--btn-bg);color: white;border: none;padding: 0.5rem 1rem;border-radius: 0.5rem;cursor: pointer;}
.empty-messages {text-align: center;padding: 4rem 1rem;background: #fff;border-radius: 1.25rem;}
.empty-messages h3 {font-size: 1.0625rem;color: #888;font-weight: 500;}
</style>