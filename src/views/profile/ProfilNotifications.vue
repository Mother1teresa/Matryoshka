<script setup>
import { ref, onMounted } from 'vue';
import { api } from '/src/api/api.js';

const notifications = ref([]);
const isLoading = ref(false);

const fetchNotifications = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/notifications'); // эндпоинт по вашему API
    notifications.value = response.data.notifications;
  } catch (e) {
    notify("Ошибка при загрузке уведомлений")
    console.error("Ошибка при загрузке уведомлений", e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchNotifications);
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
          
          <!-- Если это уведомление об отклонении, можно вывести причину ярче -->
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
  font-size: 12px;
  color: #999;
  min-width: 80px;
}
</style>
