<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";

const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(true);
const chats = computed(() => auth.allChats);
let polling = null;

const loadChats = async (isSilent = false) => {
  if (!isSilent) isLoading.value = true;
  try {
    await auth.fetchUserChats();
  } catch (e) {
    if (!isSilent) notify("Ошибка обновления чатов");
  } finally {
    isLoading.value = false;
  }
};

const openChat = (chatId) => {
  router.push({ name: 'ChatDetail', params: { id: chatId } });
};

onMounted(() => {
  loadChats();
  polling = setInterval(() => loadChats(true), 10000);
});

onUnmounted(() => {
  clearInterval(polling);
});
</script>

<template>
  <div class="general-container messages-container">
    <h2 class="page-title">Сообщения</h2>
    <div v-if="isLoading" class="loading-state">Загрузка чатов...</div>
    <!-- Список чатов -->
    <div v-else-if="chats.length > 0" class="chats-list">
      <div v-for="chat in chats" :key="chat.id" class="chat-card" @click="openChat(chat.id)">
        <div class="chat-main-info">
          <div class="avatar-block">
            <img :src="chat.user.avatar || '/src/assets/img/mask-avatar.png'" class="user-avatar" />
            <span v-if="chat.user.isOnline" class="online-badge"></span>
          </div>
          
          <div class="chat-text-details">
            <div class="user-name">{{ chat.user.name }}</div>
            <div class="product-title">{{ chat.productName }}</div>
            <div class="last-message" :class="{ 'my-message': chat.lastMessage.isMine }">
              <span v-if="chat.lastMessage.isMine" class="you-label">Вы: </span>
              {{ chat.lastMessage.text || 'Сообщений нет'}}
            </div>
          </div>
        </div>
        <div class="chat-meta">
          <div class="price-info" v-if="chat.price">
            <span class="price">{{ chat.price }}</span>
            <img :src="chat.productImage" class="mini-product-thumb" />
          </div>
          <div class="status-time">
            <!-- <img v-if="chat.lastMessage.isRead" src="/src/assets/img/icons/double-check.svg" class="status-icon" /> -->
            <span class="time">{{ chat.lastMessage?.time || '' }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Пустое состояние -->
    <div v-else class="empty-messages">
      <div class="empty-icon">✉️</div>
      <h3>У вас пока нет сообщений</h3>
      <p>Когда вы напишете продавцу или кто-то откликнется на ваше объявление, диалог появится здесь.</p>
      <router-link to="/" class="btn go-to-ads-btn">Найти объявления</router-link>
    </div>
  </div>
</template>
<style scoped>
.chat-card {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  cursor: pointer;
}
.chat-card:hover { background: #fafafa;}
.you-label { color: #64a07a;font-weight: 500;}
</style>
