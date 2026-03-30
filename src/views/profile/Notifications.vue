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
    console.error("Ошибка при загрузке уведомлений", e);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchNotifications);
</script>
<template>
  <div class="notifications-page">
    <h2 class="page-title">Уведомления</h2>
    <div v-if="isLoading" class="loader">Загрузка...</div>
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
}

.notification-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee; /* Линия как на скрине */
}

.notification-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.notification-text {
  font-size: 14px;
  color: #666;
}

.notification-meta {
  text-align: right;
  font-size: 12px;
  color: #999;
  min-width: 80px;
}
</style>
