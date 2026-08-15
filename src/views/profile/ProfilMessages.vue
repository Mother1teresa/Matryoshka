<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";

const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(true);
const isLoadingChats = ref(false);

const chats = computed(() => auth.allChats);
const unreadCount = computed(() =>
  chats.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
);

const loadChats = async (isSilent = false) => {
  if (isLoadingChats.value) return;
  isLoadingChats.value = true;
  if (!isSilent) isLoading.value = true;
  try {
    await auth.fetchUserChats();
  } catch (e) {
    if (!isSilent) notify("Ошибка обновления чатов", "error");
  } finally {
    isLoadingChats.value = false;
    if (!isSilent) isLoading.value = false;
  }
};

const openChat = (chatId) => {
  router.push({ name: 'ChatDetail', params: { id: chatId } });
};

let stompClient = null;
let userSubscription = null;
let pollInterval = null;
let checkConnectionInterval = null;

const startPolling = () => {
  if (pollInterval) return;
  console.log('[MessagesList] Activation of fallback polling');
  pollInterval = setInterval(() => {
    loadChats(true);
  }, 15000);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

const handleNewMessage = (msg) => {
  if (msg.senderId === auth.user?.id) return;
  const chatIndex = auth.allChats.findIndex(c => String(c.id) === String(msg.roomId));
  if (chatIndex !== -1) {
    auth.updateChatInList(msg.roomId, (chat) => {
      chat.lastMessage = {
        text: msg.message,
        isMine: false,
        isRead: false,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
      };
      chat.unreadCount = (chat.unreadCount || 0) + 1;
      return chat;
    });
  } else {
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
      stopPolling();
    };
    if (stompClient.connected) {
      subscribeTopic();
    } else {
      let attempts = 0;
      checkConnectionInterval = setInterval(() => {
        attempts++;
        if (stompClient?.connected) {
          subscribeTopic();
          clearInterval(checkConnectionInterval);
          checkConnectionInterval = null;
        }
        if (attempts > 50) {
          clearInterval(checkConnectionInterval);
          checkConnectionInterval = null;
          startPolling();
        }
      }, 100);
    }
  } catch (err) {
    console.error('[MessagesList] STOMP error, fallback to polling:', err);
    startPolling();
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
  if (checkConnectionInterval) {
    clearInterval(checkConnectionInterval);
    checkConnectionInterval = null;
  }
});
</script>

<template>
  <div class="general-container messages-container">
    <h2 class="page-title">
      Сообщения
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </h2>
    <div v-if="isLoading" class="loading-state">Загрузка чатов...</div>
    
    <div v-else-if="chats.length > 0" class="chats-lists">
      <a href="/" class="matreshka-banner">
        <img src="/src/assets/img/form/mask-matr.svg" alt="Матрёшка" class="matreshka-avatar" />
        <div class="matreshka-text">
          <div class="matreshka-name">Поддержка Матрёшка</div>
          <div class="matreshka-desc">
            Привет, {{ auth.user?.name || 'Сергей' }}! Задайте вопрос — ответим в сообщениях сообщества ВКонтакте
          </div>
        </div>
      </a>
      <div class="chats-list">
        <div v-for="chat in chats" :key="chat.id" class="chat-card" @click="openChat(chat.id)">
          <div class="chat-left">
            <img :src="chat.productImage || '/img/products/foto-chat-prod.png'" alt="foto" class="user-foto">
          </div>

          <div class="chat-center">
            <div class="user-name">{{ chat.user?.name || 'Пользователь' }}</div>
            <div class="product-title" v-if="chat.price">
              <span class="product-title_title">{{ chat.productName }}</span> <span class="price">{{ chat.price.toLocaleString() }} ₽</span></div>
            <div
              class="last-message"
              :class="{ unread: chat.unreadCount > 0 }"
            >
              <span v-if="chat.lastMessage?.isMine" class="you-label">Вы: </span>
              {{ chat.lastMessage?.text || 'Сообщений нет' }}
            </div>
          </div>

          <div class="chat-right">
            <div class="price-block" v-if="chat.price">
            </div>
            <div class="meta-block">
              <svg
                v-if="chat.unreadCount > 0"
                class="bell-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span class="time">{{ chat.lastMessage?.time || '0:11' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-messages">
      <h3>У вас пока нет сообщений</h3>
    </div>
  </div>
</template>
<style scoped>
.unread-badge {background: #ff4757;color: #fff;font-size: 0.75rem;font-weight: 600;padding: 2px 10px;border-radius: 12px;}
/* Плашка Матрёшка */
.matreshka-banner {
  display: flex;
  gap: 1.25rem;
  background: #fff;
  border-radius: 1.25rem;
  padding: 0;
  margin-bottom: 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
  height: 8.938rem;
}
.matreshka-banner:hover {box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);}
.matreshka-avatar {width: 5.625rem;height: 5.625rem;border-radius: 50%;object-fit: cover;flex-shrink: 0; margin: 1.65rem 0 1.65rem 1.875rem;}
.matreshka-text {display: flex;flex-direction: column;gap: 1.25rem; margin: 0.938rem 0; }
.matreshka-name {font-weight: 700;font-size: 1.5rem;color: #000000;}
.matreshka-desc {width: 34.5rem; font-size: 1rem;color: #8E8C8C;line-height: 1.2;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;}
.chats-lists{height: 100%; margin-top: 2.5rem;}
.chats-list {display: flex;flex-direction: column;gap: 1.25rem;}
.chat-card {display: flex;align-items: flex-start;gap: 1.25rem;background: #fff;border-radius: 1.25rem;padding: 0.875rem 1.875rem 1.188rem 0.938rem;cursor: pointer;/* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); */transition: box-shadow 0.2s, transform 0.15s;height: 8.938rem;}
.chat-card:hover {box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);transform: translateY(-1px);}
.chat-left {flex-shrink: 0;position: relative;}
.user-avatar {width: 2.813rem;height: 2.813rem;border-radius: 3.438rem;object-fit: cover;position: absolute;left: 30%;top: -1rem;}
.user-foto{width: 6.563rem;height: 6.875rem;border-radius: 1.563rem; object-fit: cover;}
.chat-center {flex: 1;min-width: 0;display: flex;flex-direction: column;}
.user-name {font-weight: 700;font-size: 1.5rem; display: -webkit-box;-webkit-line-clamp: 1;-webkit-box-orient: vertical;overflow: hidden; }
.product-title {font-size: 1.25rem; margin: 0.625rem 0 0 0; display: flex; gap: 1.75rem; align-items: center; color: #242424;}
.product-title_title{  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;overflow: hidden;}
.last-message {font-size: 1rem;color: #8E8C8C;white-space: nowrap;text-overflow: ellipsis;width: 34.5rem; margin-top: 0.625rem; line-height: 1.2;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;}
.last-message.unread {font-weight: 600;color: #111;}
.you-label {color: #2ecc71;font-weight: 500;}
.chat-right {flex-shrink: 0;display: flex;flex-direction: column;align-items: flex-end;gap: 0.5rem;min-width: 5rem;height: 100%;justify-content: flex-end;}
.price-block {display: flex;align-items: center;gap: 8px;}
.price {font-weight: 700;font-size: 1rem;color: white; padding: 0.313rem 0.875rem; background: var(--btn-bg); border-radius: 0.625rem;}
.mini-product-thumb {width: 2rem;height: 2rem;border-radius: 0.5rem;object-fit: cover;}
.meta-block {display: flex;align-items: center;gap: 6px;}
.bell-icon {width: 1.125rem;height: 1.125rem;color: #888;}
.time {font-size: 1rem;color: #8E8C8C;}
.empty-messages {text-align: center;padding: 4rem 1rem;background: #fff;border-radius: 1.25rem;margin-top: 2.5rem;}
.empty-messages h3 {font-size: 1.0625rem;color: #888;font-weight: 500;}
</style>