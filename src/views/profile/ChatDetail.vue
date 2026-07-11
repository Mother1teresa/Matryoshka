<template>
  <div class="messages-page-wrapper">
    <div class="chat-dialog-window">
      <header class="chat-header">
        <button class="back-btn" @click="router.back()">
          <img src="/src/assets/img/icons/arrow-back.svg" />
        </button>
        <div class="header-user-info">
          <img :src="currentChat?.user?.avatar || '/src/assets/img/mask-avatar.png'" class="mini-avatar" />
          <div class="user-meta">
            <span class="name">{{ currentChat?.user?.name }}</span>
            <span :class="['online-status', { is_online: currentChat?.user?.isOnline }]">
              {{ currentChat?.user?.isOnline ? "в сети" : "был(а) недавно" }}
            </span>
          </div>
        </div>
        <div v-if="isTyping" class="typing-indicator">
          <span class="typing-dots"><span></span><span></span><span></span></span>
          печатает...
        </div>
        <div class="header-product-info" v-if="currentChat?.productName">
          <img :src="currentChat?.productImage || '/src/assets/img/icons/box-icon.svg'" class="product-mini-photo" />
          <span>{{ currentChat.productName }}</span>
        </div>
      </header>
      <div class="messages-viewport" ref="scrollContainer">
        <div v-if="isOrderPlaced" class="system-msg">Покупатель оформил заказ!</div>
        <template v-for="(msg, index) in messages" :key="msg.id">
          <div v-if="shouldShowDate(msg, index)" class="sticky-date">
            <span>{{ formatStickyDate(msg.createdAt) }}</span>
          </div>

          <div :class="['msg-bubble', msg.isMine ? 'sent' : 'received', { 'msg-error': msg.status === 'error' }]">
            <div class="msg-content">
              {{ msg.text }}
              <div class="msg-footer">
                <span v-if="msg.status === 'sending'" class="msg-status-text">отправка...</span>
                <span v-else-if="msg.status === 'error'" class="msg-status-text error">ошибка</span>
                <span class="msg-time">{{ msg.time }}</span>
                <div v-if="msg.isMine && msg.status !== 'sending'" class="msg-status">
                  <img v-if="!msg.isRead" src="/src/assets/img/icons/tick.svg" class="tick-icon" />
                  <img v-else src="/src/assets/img/icons/check-mark.png" class="tick-icon is-read" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="showBotActions" class="bot-actions-row">
          <p>Договорились ли вы о сделке с продавцом?</p>
          <div class="btns">
            <button class="btn bot-btn" @click="handleBotAnswer('yes')">Да</button>
            <button class="btn bot-btn" @click="handleBotAnswer('no')">Нет</button>
            <button class="btn bot-btn" @click="handleBotAnswer('deciding')">Ещё решаем</button>
          </div>
        </div>

        <div v-if="showReviewLink" class="review-invitation">
          <p>Сделка состоялась? Вы можете оставить отзыв продавцу.</p>
          <button class="review-link-btn" @click="openReviewModal">Оставить отзыв</button>
        </div>
      </div>

      <footer class="chat-input-bar">
        <div v-if="!auth.isStompConnected && !isLoading" class="connection-status offline">
          ⚠️ Нет соединения
          <button class="retry-btn" @click="reconnectSocket">Переподключить</button>
        </div>
        <div v-if="isLoading" class="connection-status loading">Загрузка...</div>
        <button v-if="!isOrderPlaced" class="order-btn" @click="handleCreateOrder">Оформить заказ</button>
        <button class="attach-btn">
          <img src="/src/assets/img/icons/clip.svg" />
        </button>
        <textarea ref="textareaRef" v-model="newMessage" @input="handleInput" placeholder="Напишите сообщение..." @keydown.enter.exact.prevent="sendMessage" @keydown.enter.shift.exact="insertNewLine" @keydown.enter.ctrl.exact.prevent="sendMessage" rows="1" maxlength="2000"></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="isSending || !newMessage.trim()">
          <img src="/src/assets/img/icons/send-plane.svg" />
        </button>
      </footer>
    </div>
    <ReviewModal 
      :is-open="isReviewModalOpen"
      :target-user-id="currentChat?.user?.id"
      :chat-id="route.params.id"
      @close="isReviewModalOpen = false"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";
import ReviewModal from "../ReviewModal.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const messages = ref([]);
const chatData = ref(null);
const currentChat = computed(() => {
  const roomId = route.params.id;
  return auth.allChats.find(c => c.id === roomId) || chatData.value;
});

const scrollContainer = ref(null);
const textareaRef = ref(null);
const newMessage = ref("");
const isSending = ref(false);
const isLoading = ref(false);
const abortController = ref(null);

const isOrderPlaced = ref(false);
const showBotActions = ref(false);
const showReviewLink = ref(false);
const isReviewModalOpen = ref(false);
const isTyping = ref(false);

const pendingTimeouts = new Map();

// ===== STOMP =====
let stompClient = null;
let roomSubscription = null;
let typingTimeout = null;

const connectStomp = () => {
  console.log('[connectStomp] START');
  console.log('[connectStomp] user?.id:', auth.user?.id);
  console.log('[connectStomp] route.params.id:', route.params.id);
  // if (!auth.user?.id || !route.params.id) return;
  if (!auth.user?.id || !route.params.id) {
    console.log('[connectStomp] Missing params — returning');
    return;
  }
  stompClient = auth.initSocket();
  console.log('[connectStomp] stompClient:', stompClient);
  // if (!stompClient) return;

  if (!stompClient) {
    console.log('[connectStomp] initSocket returned null');
    return;
  }
  if (stompClient.connected) {
    subscribeToRoom();
  } else {
    const originalOnConnect = stompClient.onConnect;
    stompClient.onConnect = (frame) => {
      if (originalOnConnect) originalOnConnect(frame);
      subscribeToRoom();
    };
  }
};

const subscribeToRoom = () => {
  if (!stompClient?.connected || !route.params.id) return;

  if (roomSubscription) {
    roomSubscription.unsubscribe();
    roomSubscription = null;
  }

  roomSubscription = stompClient.subscribe(
    `/topic/room/${route.params.id}`,
    (message) => {
      const msg = JSON.parse(message.body);
      handleIncomingMessage(msg);
    }
  );

  stompClient.subscribe(
    `/topic/room/${route.params.id}/typing`,
    (message) => {
      const data = JSON.parse(message.body);
      if (data.senderId !== auth.user?.id) {
        isTyping.value = true;
        setTimeout(() => { isTyping.value = false; }, 3000);
      }
    }
  );
};

const handleIncomingMessage = (msg) => {
  const pendingMsg = messages.value.find(m => 
    m.status === 'sending' &&
    m.isMine &&
    m.text === msg.message &&
    m.senderId === msg.senderId &&
    Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 3000
  );

  if (pendingMsg) {
    pendingMsg.id = msg.id;
    pendingMsg.status = 'sent';
    pendingMsg.isRead = msg.isRead || false;
    pendingMsg.time = msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : pendingMsg.time;

    const timeoutId = pendingTimeouts.get(pendingMsg.id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingTimeouts.delete(pendingMsg.id);
    }
    return;
  }

  const exists = messages.value.some(m => m.id === msg.id);
  if (exists) return;

  messages.value.push({
    id: msg.id,
    text: msg.message,
    senderId: msg.senderId,
    isMine: msg.senderId === auth.user?.id,
    isRead: msg.isRead || false,
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
    createdAt: msg.createdAt,
    status: 'sent',
  });

  if (!msg.isMine && !msg.isRead) {
    auth.markMessageAsRead(msg.id, route.params.id).then(() => {
      const localMsg = messages.value.find(m => m.id === msg.id);
      if (localMsg) localMsg.isRead = true;
    });
  }
  nextTick(() => scrollToBottom());
};

const reconnectSocket = () => {
  auth.disconnectSocket();
  connectStomp();
};

// ===== Typing indicator =====
const handleTyping = () => {
  if (stompClient?.connected && newMessage.value.trim()) {
    if (typingTimeout) clearTimeout(typingTimeout);

    stompClient.publish({
      destination: `/app/chat.typing/${route.params.id}`,
      body: JSON.stringify({
        senderId: auth.user?.id,
        roomId: route.params.id,
      }),
    });

    typingTimeout = setTimeout(() => { typingTimeout = null; }, 3000);
  }
};

// ===== Messages =====
const loadChatInfo = () => {
  const roomId = route.params.id;
  const found = auth.allChats.find(c => c.id === roomId);
  if (found) chatData.value = found;
};

const fetchMessages = async () => {
  if (abortController.value) abortController.value.abort();
  abortController.value = new AbortController();

  isLoading.value = true;
  try {
    const data = await auth.fetchChatMessages(route.params.id, abortController.value.signal);
    messages.value = (data.messages || []).map(msg => ({
      ...msg,
      status: 'sent',
    }));
    loadChatInfo();
    checkBotStatus(messages.value);
    nextTick(() => scrollToBottom());
    await markMessagesAsRead();
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error("Ошибка загрузки сообщений:", e);
      notify("Не удалось загрузить сообщения", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text || isSending.value) return;

  isSending.value = true;
  newMessage.value = "";
  autoResize();

  const now = new Date();
  const localId = `local-${Date.now()}`;
  const localMsg = {
    id: localId,
    text,
    senderId: auth.user?.id,
    isMine: true,
    isRead: false,
    status: 'sending',
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: now.toISOString(),
  };
  messages.value.push(localMsg);
  nextTick(() => scrollToBottom());

  try {
    if (stompClient?.connected) {
      stompClient.publish({
        destination: `/app/chat.sendMessage/${route.params.id}`,
        body: JSON.stringify({
          message: text,
          senderId: auth.user?.id,
        }),
      });

      const timeoutId = setTimeout(() => {
        const msg = messages.value.find(m => m.id === localId);
        if (msg && msg.status === 'sending') {
          msg.status = 'error';
        }
        pendingTimeouts.delete(localId);
      }, 5000);
      pendingTimeouts.set(localId, timeoutId);

    } else {
      notify("Нет соединения с сервером", "error");
      const msg = messages.value.find(m => m.id === localId);
      if (msg) msg.status = 'error';
    }

    await auth.fetchUserChats();
  } catch (e) {
    const msg = messages.value.find(m => m.id === localId);
    if (msg) msg.status = 'error';
    notify("Не удалось отправить сообщение", "error");
  } finally {
    isSending.value = false;
  }
};

const markMessagesAsRead = async () => {
  const unreadIds = messages.value
    .filter(m => !m.isMine && !m.isRead)
    .map(m => m.id)

  if (unreadIds.length === 0) return;

  await Promise.allSettled(
    unreadIds.map(id => auth.markMessageAsRead(id, route.params.id))
  );

  unreadIds.forEach(id => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) msg.isRead = true;
  });
};

// ===== Input =====
const handleInput = () => {
  autoResize();
};

const insertNewLine = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  newMessage.value = newMessage.value.substring(0, start) + '\n' + newMessage.value.substring(end);
  nextTick(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 1;
    autoResize();
  });
};

const autoResize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 96) + 'px';
};

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const checkBotStatus = (msgs) => {
  const lastSellerMsg = [...msgs].reverse().find((m) => !m.isMine);
  if (lastSellerMsg) {
    const diffHours = (Date.now() - new Date(lastSellerMsg.createdAt)) / 3600000;
    if (diffHours >= 24) showBotActions.value = true;
  }
};

const handleBotAnswer = (answer) => {
  showBotActions.value = false;
  if (answer === 'yes') showReviewLink.value = true;
};

const handleCreateOrder = () => {
  isOrderPlaced.value = true;
  nextTick(() => scrollToBottom());
};

// ===== Review Modal =====
const openReviewModal = () => {
  isReviewModalOpen.value = true;
};

const handleReviewSuccess = () => {
  isReviewModalOpen.value = false;
  notify("Отзыв отправлен!", "success");
};

const formatStickyDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';

  const options = { day: 'numeric', month: 'long' };
  if (date.getFullYear() !== now.getFullYear()) options.year = 'numeric';
  return date.toLocaleDateString('ru-RU', options);
};

const shouldShowDate = (msg, index) => {
  if (index === 0) return true;
  const prev = messages.value[index - 1];
  if (!prev || !prev.createdAt || !msg.createdAt) return false;
  const prevDate = new Date(prev.createdAt).toDateString();
  const currDate = new Date(msg.createdAt).toDateString();
  return prevDate !== currDate;
};

// ===== Lifecycle =====
onMounted(() => {
  loadChatInfo();
  fetchMessages()
    .then(() => {
      console.log('[onMounted] Messages loaded');
    })
    .catch((e) => {
      console.error('[onMounted] fetchMessages error:', e);
    })
    .finally(() => {
      console.log('[onMounted] Connecting STOMP...');
      connectStomp();  // ← Всегда вызываем, даже при ошибке
    });
});

onUnmounted(() => {
  if (abortController.value) abortController.value.abort();

  pendingTimeouts.forEach((id) => clearTimeout(id));
  pendingTimeouts.clear();
  if (typingTimeout) clearTimeout(typingTimeout);

  if (roomSubscription) {
    roomSubscription.unsubscribe();
    roomSubscription = null;
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    messages.value = [];
    showBotActions.value = false;
    showReviewLink.value = false;
    isOrderPlaced.value = false;
    isReviewModalOpen.value = false;

    pendingTimeouts.forEach((id) => clearTimeout(id));
    pendingTimeouts.clear();

    if (roomSubscription) {
      roomSubscription.unsubscribe();
      roomSubscription = null;
    }

    loadChatInfo();
    fetchMessages().then(() => {
      if (stompClient?.connected) {
        subscribeToRoom();
      } else {
        connectStomp();
      }
    });
  }
});
</script>

<style scoped>
.chat-dialog-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #ffffff;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.938rem rgba(0, 0, 0, 0.05);
}
.chat-header {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  border-bottom: 0.063rem solid #eee;
  gap: 0.75rem;
  flex-shrink: 0;
}
.back-btn {
  width: 2.25rem; height: 2.25rem; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0; border: none; background: transparent;
}
.back-btn img { width: 1.25rem; height: 1.25rem; }
.header-user-info {
  display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0;
}
.mini-avatar {
  width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover; flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; min-width: 0; }
.user-meta .name {
  display: block; font-weight: 600; font-size: 0.938rem; color: #1a1a1a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.online-status { font-size: 0.75rem; color: #999; }
.online-status.is_online { color: #64a07a; }
.typing-indicator {
  font-size: 0.75rem; color: #64a07a; display: flex; align-items: center;
  gap: 0.25rem; animation: fadeIn 0.3s ease;
}
.typing-dots { display: flex; gap: 2px; }
.typing-dots span {
  width: 4px; height: 4px; background: #64a07a; border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.header-product-info {
  display: flex; align-items: center; gap: 0.5rem; background: #f9f9f9;
  padding: 0.313rem 0.75rem; border-radius: 0.625rem; font-size: 0.813rem;
  color: #555; flex-shrink: 0; max-width: 12rem;
}
.header-product-info img {
  width: 2.25rem; height: 1.5rem; border-radius: 0.25rem;
  object-fit: cover; flex-shrink: 0;
}
.messages-viewport {
  flex: 1; overflow-y: auto; padding: 1.25rem; display: flex;
  flex-direction: column; position: relative;
  background: linear-gradient(180deg, #D3F2A3 0%, #6CC08B 50%, #074050 100%);
  background-attachment: fixed; gap: 0.625rem;
}
.messages-viewport::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/src/assets/img/matreshka-pattern.png');
  background-repeat: repeat; background-size: 15rem; opacity: 0.15;
  pointer-events: none; z-index: 0;
}
.msg-bubble, .system-msg, .bot-actions-row, .review-invitation, .sticky-date {
  position: relative; z-index: 1;
}
.sticky-date { display: flex; justify-content: center; margin: 0.938rem 0; pointer-events: none; }
.sticky-date span {
  background: rgba(0, 0, 0, 0.2); color: #ffffff; font-size: 0.75rem;
  padding: 0.25rem 0.75rem; border-radius: 1.25rem; backdrop-filter: blur(0.25rem);
}
.system-msg {
  align-self: center; background: rgba(0, 0, 0, 0.2); color: #fff;
  padding: 0.25rem 1rem; border-radius: 1rem; font-size: 0.75rem; margin: 0.5rem 0;
}
.msg-bubble {
  max-width: 80%; padding: 0.625rem 0.938rem; font-size: 0.875rem;
  line-height: 1.4; position: relative;
  box-shadow: 0 0.063rem 0.125rem rgba(0, 0, 0, 0.1);
  word-break: break-word; transition: opacity 0.3s;
}
.msg-bubble.received {
  align-self: flex-start; background: #ffffff;
  border-radius: 0.938rem 0.938rem 0.938rem 0.125rem;
}
.msg-bubble.sent {
  align-self: flex-end; background: #e1fec6;
  border-radius: 0.938rem 0.938rem 0.125rem 0.938rem;
}
.msg-bubble.msg-error { opacity: 0.7; border: 1px solid #ff6b6b; }
.msg-content { display: flex; flex-direction: column; gap: 0.25rem; }
.msg-footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 0.313rem; margin-top: 0.125rem;
}
.msg-time { font-size: 0.625rem; color: #888; }
.msg-status-text { font-size: 0.625rem; color: #888; }
.msg-status-text.error { color: #ff6b6b; }
.msg-status { display: flex; align-items: center; }
.tick-icon { width: 0.875rem; height: auto; display: block; }
.tick-icon.is-read { filter: none; }
.bot-actions-row {
  width: 100%; align-self: center; background: #ffffff; border: 1px solid #eee;
  border-radius: 1.25rem; padding: 1rem; text-align: center;
  max-width: 25rem; margin: 1.25rem 0; box-shadow: 0 0.25rem 0.938rem rgba(0, 0, 0, 0.05);
}
.bot-actions-row p { font-size: 0.813rem; margin-bottom: 0.938rem; color: #1a1a1a; }
.btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.313rem; }
.bot-btn {
  background: #fff; border: 0.063rem solid #dcdcdc;
  padding: 0.5rem 1.25rem; border-radius: 0.625rem;
  font-size: 0.813rem; cursor: pointer; transition: background 0.2s;
}
.bot-btn:hover { background: #f5f5f5; }
.review-invitation {
  align-self: center; background: #ffffff; border-radius: 1.25rem;
  padding: 1.25rem; text-align: center; max-width: 25rem;
  margin: 1.25rem 0; box-shadow: 0 0.25rem 0.938rem rgba(0, 0, 0, 0.1);
}
.review-invitation p { font-size: 0.875rem; color: #1a1a1a; margin-bottom: 0.625rem; }
.review-link-btn {
  background: #64a07a; color: white; border: none;
  padding: 0.625rem 1.25rem; border-radius: 0.625rem; cursor: pointer;
  margin-top: 0.625rem; font-weight: 600; font-size: 0.875rem; transition: background 0.2s;
}
.review-link-btn:hover { background: #5a906e; }
.chat-input-bar {
  display: flex; align-items: center; padding: 0.938rem 1.25rem;
  gap: 0.938rem; background: #fff; border-top: 0.063rem solid #eee;
  flex-shrink: 0; flex-wrap: wrap;
}
.connection-status {
  width: 100%; text-align: center; font-size: 0.75rem;
  padding: 0.25rem; border-radius: 0.5rem;
}
.connection-status.offline {
  color: #ff6b6b; background: #fff0f0;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.connection-status.loading { color: #888; }
.retry-btn {
  background: #ff6b6b; color: white; border: none;
  padding: 0.125rem 0.5rem; border-radius: 0.25rem;
  font-size: 0.75rem; cursor: pointer;
}
.order-btn {
  background: #ffffff; border: 0.063rem solid #e0e0e0;
  border-radius: 0.625rem; padding: 0.5rem 1rem;
  font-size: 0.813rem; color: #333; cursor: pointer;
  white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
}
.order-btn:hover { background: #f9f9f9; }
.attach-btn {
  width: 2.5rem; height: 2.5rem; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0; border: none; background: transparent;
}
.attach-btn img { width: 1.25rem; height: 1.25rem; }
.chat-input-bar textarea {
  flex: 1; border: none; background: #f5f5f5;
  padding: 0.625rem 1rem; border-radius: 1.25rem;
  resize: none; font-family: inherit; font-size: 0.875rem;
  outline: none; min-height: 2.5rem; max-height: 6rem;
  line-height: 1.4; overflow-y: auto;
}
.send-btn {
  width: 2.5rem; height: 2.5rem; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0; border: none; background: #64a07a;
  transition: opacity 0.2s;
}
.send-btn:hover:not(:disabled) { background: #5a906e; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn img { width: 1.5rem; height: 1.5rem; filter: brightness(0) invert(1); }
.product-mini-photo {
  width: 4.563rem; height: 3.125rem; border-radius: 0.625rem; object-fit: cover;
}
</style>