<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";

const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(true);

// Ссылка на чаты из Pinia
const chats = computed(() => auth.allChats);

const unreadCount = computed(() =>
  chats.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
);

const loadChats = async (isSilent = false) => {
  if (!isSilent) isLoading.value = true;
  try {
    await auth.fetchUserChats();
  } catch (e) {
    if (!isSilent) notify("Ошибка обновления чатов", "error");
  } finally {
    isLoading.value = false;
  }
};

const openChat = (chatId) => {
  router.push({ name: 'ChatDetail', params: { id: chatId } });
};

// --- STOMP & Polling Logic ---
let stompClient = null;
let userSubscription = null;
let pollInterval = null;

// Единый метод для безопасного старта фоллбек-поллинга
const startPolling = () => {
  if (pollInterval) return; // Если уже запущен — игнорируем
  console.log('[MessagesList] Activation of fallback polling');
  pollInterval = setInterval(() => {
    loadChats(true);
  }, 15000);
};

// Единый метод очистки таймеров
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

const handleNewMessage = (msg) => {
  // Находим индекс чата для обновления
  const chatIndex = auth.allChats.findIndex(c => c.id === msg.roomId);
  
  if (chatIndex !== -1) {
    // Создаем глубокую копию объекта, чтобы Vue зафиксировал изменения (реактивность)
    const updatedChat = { ...auth.allChats[chatIndex] };
    
    updatedChat.lastMessage = {
      text: msg.message,
      isMine: msg.senderId === auth.user?.id,
      isRead: msg.senderId === auth.user?.id,
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    };

    if (msg.senderId !== auth.user?.id) {
      updatedChat.unreadCount = (updatedChat.unreadCount || 0) + 1;
    }

    // Обновляем массив в Pinia реактивно через замену элемента
    auth.allChats[chatIndex] = updatedChat;
  } else {
    // Новый чат, которого не было в списке — запрашиваем список заново
    loadChats(true);
  }
};

const handleChatUpdate = (data) => {
  if (data.type === 'update_chats') {
    loadChats(true);
  } else if (data.type === 'new_message') {
    handleNewMessage(data);
  } else {
    loadChats(true);
  }
};

const connectStomp = async () => {
  try {
    stompClient = await auth.initSocket();
    if (!stompClient) {
      startPolling();
      return;
    }

    const subscribeTopic = () => {
      userSubscription = stompClient.subscribe(
        `/topic/user/${auth.user?.id}`,
        (message) => {
          const data = JSON.parse(message.body);
          handleChatUpdate(data);
        }
      );
      // Успешно подписались по веб-сокетам — отключаем фоновый поллинг бэкенда
      stopPolling();
    };

    if (stompClient.connected) {
      subscribeTopic();
    } else {
      // Вместо деструктивной перезаписи onConnect, запускаем таймер проверки статуса
      let attempts = 0;
      const checkConnection = setInterval(() => {
        attempts++;
        if (stompClient?.connected) {
          subscribeTopic();
          clearInterval(checkConnection);
        }
        // Если за 5 секунд сокет не завелся — включаем поллинг
        if (attempts > 50) { 
          clearInterval(checkConnection);
          startPolling();
        }
      }, 100);
    }
  } catch (err) {
    console.error('[MessagesList] STOMP error, fallback to polling:', err);
    startPolling();
  }
};
const TARGET_USER_ID = "322451797836";
const createTestRoom = async () => {
  try {
    isLoading.value = true;
    await auth.fetchUserChats();
    const existingChat = auth.allChats.find(c => String(c.user?.id) === TARGET_USER_ID);
    if (existingChat) {
      console.log('[createTestRoom] Найдена существующая комната с пользователем:', TARGET_USER_ID);
      router.push({ name: 'ChatDetail', params: { id: existingChat.id } });
      return;
    }
    const roomId = await auth.createTestRoom(TARGET_USER_ID);
    if (roomId) {
      notify("Чат успешно создан!", "success");
      router.push({ name: 'ChatDetail', params: { id: roomId } });
    }
  } catch (e) {
    if (e.response?.status === 409) {
      notify("Чат уже существует, открываю...", "success");
      await auth.fetchUserChats();
      const existingChat = auth.allChats.find(c => String(c.user?.id) === TARGET_USER_ID);
      if (existingChat) {
        router.push({ name: 'ChatDetail', params: { id: existingChat.id } });
      } else {
        if (auth.allChats.length > 0) {
          router.push({ name: 'ChatDetail', params: { id: auth.allChats[0].id } });
        }
      }
    } else {
      notify("Не удалось создать чат: " + (e.response?.data?.message || e.message), "error");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadChats();
  await connectStomp();
});

onUnmounted(() => {
  if (userSubscription) {
    userSubscription.unsubscribe();
  }
  stopPolling();
});
</script>

<template>
  <div class="general-container messages-container">
    <h2 class="page-title">
      Сообщения
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </h2>
    <div v-if="isLoading" class="loading-state">Загрузка чатов...</div>
    <div v-else-if="chats.length > 0" class="chats-list">
      <div v-for="chat in chats" :key="chat.id" class="chat-card" @click="openChat(chat.id)">
        <div class="chat-main-info">
          <div class="avatar-block">
            <img :src="chat.user?.avatar || '/src/assets/img/mask-avatar.png'" class="user-avatar" />
            <span v-if="chat.user?.isOnline" class="online-badge"></span>
          </div>
          <div class="chat-text-details">
            <div class="user-name">{{ chat.user?.name || 'Пользователь' }}</div>
            <div class="product-title">{{ chat.productName }}</div>
            <div class="last-message" :class="{ 'my-message': chat.lastMessage?.isMine, 'unread': chat.unreadCount > 0 }">
              <span v-if="chat.lastMessage?.isMine" class="you-label">Вы: </span>
              {{ chat.lastMessage?.text || 'Сообщений нет'}}
            </div>
          </div>
        </div>
        <div class="chat-meta">
          <div class="price-info" v-if="chat.price">
            <span class="price">{{ chat.price }}</span>
            <img v-if="chat.productImage" :src="chat.productImage" class="mini-product-thumb" />
          </div>
          <div class="status-time">
            <span v-if="chat.unreadCount > 0" class="unread-count">{{ chat.unreadCount }}</span>
            <span class="time">{{ chat.lastMessage?.time || '' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-messages">
      <h3>У вас пока нет сообщений</h3>
    </div>
    <div class="demo-actions">
      <button class="btn demo-chat-btn" @click="createTestRoom">
        💬 Создать тестовый чат
      </button>
      <p class="demo-hint">Создаст чат для проверки</p>
    </div>
  </div>
</template>

<style scoped>
.page-title { display: flex; align-items: center; gap: 0.5rem; }
.unread-badge {
  background: #ff6b6b; color: white; font-size: 0.75rem;
  padding: 0.125rem 0.5rem; border-radius: 1rem; font-weight: 600;
}
.chat-card {
  display: flex; justify-content: space-between; padding: 15px;
  background: #fff; border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s; cursor: pointer;
}
.chat-card:hover { background: #fafafa; }
.avatar-block { position: relative; }
.user-avatar { width: 3rem; height: 3rem; border-radius: 50%; object-fit: cover; }
.online-badge {
  position: absolute; bottom: 2px; right: 2px;
  width: 10px; height: 10px; background: #64a07a;
  border: 2px solid white; border-radius: 50%;
}
.chat-text-details { display: flex; flex-direction: column; gap: 0.25rem; }
.user-name { font-weight: 600; font-size: 0.938rem; color: #1a1a1a; }
.product-title { font-size: 0.75rem; color: #888; }
.last-message {
  font-size: 0.813rem; color: #666;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 200px;
}
.last-message.unread { font-weight: 600; color: #1a1a1a; }
.you-label { color: #64a07a; font-weight: 500; }
.status-time { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.unread-count {
  background: #ff6b6b; color: white; font-size: 0.625rem;
  padding: 0.125rem 0.375rem; border-radius: 1rem; font-weight: 600;
}
.time { font-size: 0.75rem; color: #999; }
.loading-state { text-align: center; padding: 2rem; color: #888; }
.empty-messages { text-align: center; padding: 3rem 1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-messages h3 { font-size: 1.125rem; color: #1a1a1a; margin-bottom: 0.5rem; }
.empty-messages p { font-size: 0.875rem; color: #888; margin-bottom: 1.5rem; }
.go-to-ads-btn {
  display: inline-block; background: #64a07a; color: white;
  padding: 0.625rem 1.5rem; border-radius: 0.625rem;
  text-decoration: none; font-weight: 500;
}
</style>