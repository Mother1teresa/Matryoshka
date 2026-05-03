<script setup>
import { ref, watch, computed } from 'vue';
import { notify } from "/src/utils/notify";
import { useAuthStore } from "/src/stores/authStore.js";

const auth = useAuthStore();
const notifications = computed(() => auth.allNotifications);
const isLoading = computed(() => auth.isNotificationsLoading);

watch(
  () => auth.user?.id,
  (newId) => {
    if (newId) {
      // auth.fetchUserNotifications();
    } else {
      auth.allNotifications = [];
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="general-container notifications-container">
    <h2 class="page-title">Уведомления</h2>
    <div v-if="isLoading" class="loading-state">Загрузка...</div>
    <div v-else class="notifications-list">
      <div 
        v-for="item in notifications" 
        :key="item.id" 
        class="notification-card"
        :class="{ 'unread': !item.is_read }">
        <div class="notification-content">
          <h3 class="notification-title">{{ item.title }}</h3>
          <p class="notification-text">{{ item.message }}</p>
          <p v-if="item.reason" class="reason">
            Причина: {{ item.reason }}
          </p>
        </div>
        
        <div class="notification-meta">
          <span class="date">{{ item.date }}</span>
          <span class="time">{{ item.time }}</span>
        </div>
      </div>
      <div v-if="notifications.length === 0" class="empty-state">
        У вас пока нет уведомлений
      </div>
    </div>
  </div>
</template>
<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  border: 1px solid #D0D0D0;
  background-color: #F5F5F5;
}

.notification-card {
  background: #fff;
  border-radius: 1.25rem;
  padding: 0.75rem 1.25rem 1.25rem 1.25rem;
  display: grid;
  gap: 0.469rem;
}

.notification-title {
  font-weight: 400;
  margin-bottom: 0.469rem;
}

.notification-text {
  font-size: 0.875rem;
  color: #7C7C7C;
}

.notification-meta {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  min-width: 80px;
}
.reason{
font-size: 0.875rem;
margin-top: .3rem;
}
</style>
