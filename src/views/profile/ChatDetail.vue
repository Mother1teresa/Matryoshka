<template>
  <div class="messages-page-wrapper">
    <div class="chat-dialog-window">
      <header class="chat-header">
        <div class="header-user-info_block">
          <div class="header-user-info" @click="goToSellerProfile">
            <img :src="currentChat?.user?.avatar || maskAvatar" class="mini-avatar" />
            <div class="user-meta">
              <span class="name">{{ displayName }}</span>
              <span :class="['online-status', { is_online: currentChat?.user?.isOnline }]">
                {{ currentChat?.user?.isOnline ? "в сети" : "был(а) недавно" }}
              </span>
            </div>
          </div>
          <div class="header-product-info" v-if="currentChat?.productName" @click="goToProduct">
            <div class="header-product-info_block">
              <img :src="currentChat?.productImage || '/src/assets/img/icons/box-icon.svg'" class="product-mini-photo" />
              <span>{{ currentChat.productName }}</span>
            </div>
          </div>
        </div>
        
        <button class="back-btn" @click="router.back()">
          Выйти с чата
        </button>
        
        <div class="header-search">
          <div class="search-input-wrapper" :class="{ active: isSearchActive }">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Поиск сообщений" class="search-input" @keydown.enter.prevent="nextSearchResult" @keydown.shift.enter.prevent="prevSearchResult" />
            <button v-if="searchQuery" class="search-clear" @click="clearSearch">×</button>
          </div>
          <div v-if="isSearchActive" class="search-nav">
            <span class="search-counter">{{ searchResultsIds.length ? `${currentSearchIndex + 1} / ${searchResultsIds.length}` : '0 / 0' }}</span>
            <button class="search-arrow" @click="prevSearchResult" :disabled="!searchResultsIds.length">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button class="search-arrow" @click="nextSearchResult" :disabled="!searchResultsIds.length">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </div>
        <div v-if="isTyping" class="typing-indicator">
          <span class="typing-dots"><span></span><span></span><span></span></span>
          печатает...
        </div>
      </header>
      <input 
        ref="fileInput" 
        type="file" 
        hidden 
        accept="image/*,video/*" 
        @change="handleFileSelect" 
      />
      <div class="messages-viewport" ref="scrollContainer">
        <div v-if="isOrderPlaced" class="system-msg">Покупатель оформил заказ!</div>
        <template v-for="(msg, index) in messages" :key="msg.id">
          <div v-if="shouldShowDate(msg, index)" class="sticky-date">
            <span>{{ formatStickyDate(msg.createdAt) }}</span>
          </div>
          <div :data-msg-id="msg.id" :class="['msg-bubble', msg.isMine ? 'sent' : 'received', { 'msg-error': msg.status === 'error' }, { 'search-match': isSearchMatch(msg.id) }, { 'search-current': isSearchCurrent(msg.id) }]">
            <div class="msg-content">
              <div v-if="msg.mediaUrl" class="msg-media">
                <img 
                  v-if="msg.mediaType !== 'VIDEOS'" 
                  :src="msg.mediaUrl" 
                  class="chat-media-img" 
                  @click="openMedia(msg.mediaUrl)"
                />
                <video 
                  v-else 
                  :src="msg.mediaUrl" 
                  class="chat-media-video" 
                  controls 
                  preload="metadata"
                />
              </div>
              <span v-if="msg.text">{{ msg.text }}</span>
              <div class="msg-footer">
                <span v-if="msg.status === 'sending'" class="msg-status-text">отправка...</span>
                <span v-else-if="msg.status === 'error'" class="msg-status-text error">ошибка</span>
                <span class="msg-time">{{ msg.time }}</span>
                <div v-if="msg.isMine && msg.status !== 'sending'" class="msg-status">
                  <img v-if="!msg.isRead" src="/src/assets/img/icons/tick.png" class="tick-icon" />
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
        <div v-if="showReviewLink" class="bot-actions-row">
          <p>Оставьте отзыв о продавце</p>
          <div class="btns">
            <button type="button" class="review-link-btn bot-btn" @click="openReviewModal">Перейти к форме</button>
            <button type="button" class="btn bot-btn" @click="handleBotAnswer('deciding')">Позже</button>
            <button type="button" class="btn bot-btn" @click="handleBotAnswer('no')">Отказаться</button>
          </div>
        </div>
      </div>
      <footer class="chat-input-bar">
        <div v-if="!auth.isStompConnected && !isLoading" class="connection-status offline">
          ⚠️ Нет соединения
          <button class="retry-btn" @click="reconnectSocket">Переподключить</button>
        </div>
        <div v-if="isLoading" class="connection-status loading">Загрузка...</div>
        <div class="chat_footer-block">
          <button class="attach-btn" @click="fileInput?.click()">
          <img src="/src/assets/img/icons/clip.svg" />
        </button>
          <textarea ref="textareaRef" v-model="newMessage" @input="handleInput" placeholder="Сообщение" @keydown.enter.exact.prevent="sendMessage" @keydown.enter.shift.exact="insertNewLine" @keydown.enter.ctrl.exact.prevent="sendMessage" rows="1" maxlength="2000"></textarea>
          <button class="send-btn" @click="sendMessage" :disabled="isSending || !newMessage.trim()">
            <img src="/src/assets/img/icons/send-plane.svg" />
          </button>
        </div>
      </footer>
    </div>
    <ReviewModal :is-open="isReviewModalOpen" :target-user-id="currentChat?.user?.id" :chat-id="route.params.id" @close="isReviewModalOpen = false" @success="handleReviewSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";
import ReviewModal from "../ReviewModal.vue";
import maskAvatar from "/img/users/mask-avatar.png";
import { uploadToMediaService } from "/src/utils/uploadService.js";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const messages = ref([]);
const chatData = ref(null);
const opponentProfile = ref(null);
const isProfileLoading = ref(false);
const currentRoomId = ref(null);
const fileInput = ref(null);
const chatProduct = ref(null);

const searchQuery = ref("");
const searchResultsIds = ref([]);
const currentSearchIndex = ref(0);
const isSearching = ref(false);
const searchAbortController = ref(null);
let searchDebounce = null;

const loadChatProduct = async () => {
  const pid = currentChat.value?.productId || chatData.value?.productId;
  if (!pid) return;

  try {
    const product = await auth.getAdvertById(pid);
    if (!product) return;
    chatProduct.value = product;
    if (chatData.value) {
      chatData.value.productName = product.title || chatData.value.productName;
      chatData.value.productImage = product.pictureUrls?.[0] || chatData.value.productImage;
      chatData.value.price = product.price || chatData.value.price;
    }
  } catch (e) {
    console.warn('[ChatDetail] Не удалось загрузить товар для чата:', e);
  }
};

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const isVideo = file.type.startsWith("video/");
  const mediaType = isVideo ? "VIDEOS" : "CHAT_MEDIA";

  isSending.value = true;
  try {
    const uploaded = await uploadToMediaService(file, mediaType, {}, (percent) => {
      console.log(`[Chat] Upload progress: ${percent}%`);
    });
    await sendMediaMessage(uploaded);
  } catch (err) {
    console.error("[Chat] Upload error:", err);
    notify("Не удалось загрузить файл", "error");
  } finally {
    isSending.value = false;
    e.target.value = "";
  }
};
const sendMediaMessage = async (media) => {
  const roomId = route.params.id;
  const client = await auth.waitForStompConnect(10000);
  if (!client?.connected) {
    notify("Нет соединения", "error");
    return;
  }

  const text = newMessage.value.trim();
  const payload = {
    senderId: auth.user?.id,
    message: text,
    mediaId: media.id,
    mediaUrl: media.cdnUrl,
    mediaType: media.type,
    thumbnailUrl: media.thumbnailUrl
  };

  client.publish({
    destination: `/app/chat.sendMessage/${roomId}`,
    body: JSON.stringify(payload)
  });

  const now = new Date();
  messages.value.push({
    id: `local-${Date.now()}`,
    text: text,
    senderId: auth.user?.id,
    isMine: true,
    isRead: false,
    status: "sent",
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: now.toISOString(),
    mediaUrl: media.cdnUrl,
    mediaType: media.type,
    thumbnailUrl: media.thumbnailUrl
  });

  newMessage.value = "";
  autoResize();
  nextTick(() => scrollToBottom());
};

const openMedia = (url) => {
  window.open(url, "_blank");
};

const isSearchActive = computed(() => searchQuery.value.trim().length > 0);
const isSearchMatch = (msgId) => isSearchActive.value && searchResultsIds.value.includes(msgId);
const isSearchCurrent = (msgId) => isSearchActive.value && searchResultsIds.value[currentSearchIndex.value] === msgId;

const clearSearch = () => {
  searchQuery.value = "";
  searchResultsIds.value = [];
  currentSearchIndex.value = 0;
  if (searchAbortController.value) {
    searchAbortController.value.abort();
    searchAbortController.value = null;
  }
};

const scrollToMessage = (msgId) => {
  nextTick(() => {
    const el = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (el && scrollContainer.value) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
};

const nextSearchResult = () => {
  if (!searchResultsIds.value.length) return;
  currentSearchIndex.value = (currentSearchIndex.value + 1) % searchResultsIds.value.length;
  scrollToMessage(searchResultsIds.value[currentSearchIndex.value]);
};

const prevSearchResult = () => {
  if (!searchResultsIds.value.length) return;
  currentSearchIndex.value = (currentSearchIndex.value - 1 + searchResultsIds.value.length) % searchResultsIds.value.length;
  scrollToMessage(searchResultsIds.value[currentSearchIndex.value]);
};

const searchMessages = async () => {
  const query = searchQuery.value.trim();
  if (!query) {
    clearSearch();
    return;
  }
  if (searchAbortController.value) searchAbortController.value.abort();
  searchAbortController.value = new AbortController();
  isSearching.value = true;
  try {
    const roomId = route.params.id;
    const token = auth.token || localStorage.getItem("token");
    const res = await fetch(`/api/chat/search-messages/${roomId}?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: searchAbortController.value.signal,
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();
    searchResultsIds.value = data.map((msg) => msg.id).filter((id) => messages.value.some((m) => m.id === id));
    currentSearchIndex.value = 0;
    if (searchResultsIds.value.length) scrollToMessage(searchResultsIds.value[0]);
  } catch (e) {
    if (e.name !== "AbortError") {
      console.error("[Chat] Search error:", e);
      notify("Ошибка поиска сообщений", "error");
    }
  } finally {
    isSearching.value = false;
  }
};

watch(searchQuery, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (!val.trim()) {
    searchResultsIds.value = [];
    return;
  }
  searchDebounce = setTimeout(() => searchMessages(), 300);
});

const currentChat = computed(() => {
  const roomId = route.params.id;
  const fromStore = auth.allChats.find((c) => String(c.id) === String(roomId));
  if (fromStore) {
    return {
      ...fromStore,
      user: {
        ...fromStore.user,
        name: opponentProfile.value?.name || fromStore.user?.name || "Пользователь",
        avatar: opponentProfile.value?.avatar || fromStore.user?.avatar || maskAvatar,
        rating: opponentProfile.value?.rating || fromStore.user?.rating || 0,
      },
    };
  }
  return chatData.value;
});

const displayName = computed(() => {
  if (isProfileLoading.value) return "Загрузка...";
  return currentChat.value?.user?.name || "Пользователь";
});

const goToSellerProfile = () => {
  const sellerId = currentChat.value?.user?.id || opponentProfile.value?.id;
  if (sellerId) {
    router.push({ name: "SellerPage", params: { id: sellerId } });
  }
};
const goToProduct = () => {
  const pid = chatProduct.value?.id || chatData.value?.productId || currentChat.value?.productId;
  if (!pid) return;
  router.push({
    name: 'Product',
    params: {
      type: chatProduct.value?.category || 'tovary',
      section: chatProduct.value?.section || 'default',
      id: pid
    }
  });
};
const loadOpponentProfile = async () => {
  if (isProfileLoading.value) return;
  const roomId = route.params.id;
  if (!roomId || !auth.user?.id) return;
  isProfileLoading.value = true;
  try {
    let room = auth.allChats.find((c) => String(c.id) === String(roomId));
    if (!room) {
      await auth.fetchUserChats();
      room = auth.allChats.find((c) => String(c.id) === String(roomId));
    }
    let opponentId = room?.user?.id;
    if (!opponentId) {
      try {
        const data = await auth.fetchChatMessages(roomId);
        const opponentMsg = (data.messages || []).find((m) => String(m.senderId) !== String(auth.user?.id));
        opponentId = opponentMsg?.senderId;
      } catch (e) {
        console.warn("[loadOpponentProfile] Не удалось получить opponentId из сообщений:", e);
      }
    }
    if (!opponentId) {
      console.warn("[loadOpponentProfile] opponentId не найден");
      return;
    }
    const profile = await auth.fetchProfileById(opponentId);
    if (!profile) return;
    opponentProfile.value = profile;
    chatData.value = {
      id: roomId,
      user: { ...profile, isOnline: room?.user?.isOnline || false },
      productName: room?.productName || "",
      productImage: room?.productImage || "",
      price: room?.price || "",
      productId: room?.productId || "",
      lastMessage: room?.lastMessage || null,
      unreadCount: room?.unreadCount || 0,
    };
  } finally {
    isProfileLoading.value = false;
  }
};

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

let roomSubscription = null;
let typingSubscription = null;
let typingTimeout = null;
let typingDebounce = null;
const chatMode = ref("none");

const stompPublish = (destination, body = {}) => {
  const client = auth.getSocket();
  if (client?.connected) {
    client.publish({
      destination, body: JSON.stringify({ ...body, userId: auth.user?.id })
    });
  }
};

const connectChat = async () => {
  const roomId = route.params.id;
  const userId = auth.user?.id;
  if (!userId || !roomId) return;
  try {
    const result = await auth.subscribeToRoom(roomId, handleIncomingMessage);
    chatMode.value = result?.type || "none";
    if (result?.type === "websocket" && result.subscription) {
      roomSubscription = result.subscription;
      const client = auth.getSocket();
      if (client?.connected) {
        typingSubscription = client.subscribe(`/topic/room/${roomId}/typing`, (message) => {
          const data = JSON.parse(message.body);
          if (data.senderId !== userId) {
            isTyping.value = true;
            setTimeout(() => { isTyping.value = false; }, 3000);
          }
        });
        stompPublish(`/app/chat.enterRoom/${roomId}`, { userId });
      }
    }
  } catch (e) {
    console.error("[connectChat] Error:", e);
  }
};

const handleIncomingMessage = (msg) => {
  const pendingMsg = messages.value.find((m) => m.isMine && m.text === msg.message && m.senderId === msg.senderId);
  if (pendingMsg) {
    pendingMsg.id = msg.id;
    pendingMsg.status = "sent";
    pendingMsg.isRead = msg.isRead || false;
    pendingMsg.time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : pendingMsg.time;
    return;
  }
  if (messages.value.some((m) => m.id === msg.id)) return;
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
    status: "sent",
    // ← новые поля для медиа
    mediaUrl: msg.mediaUrl || msg.cdnUrl || null,
    mediaType: msg.mediaType || null,
    thumbnailUrl: msg.thumbnailUrl || null
  });
  if (!msg.isMine && !msg.isRead && msg.id) {
    auth.markMessageAsRead(msg.id, route.params.id).then(() => {
      const localMsg = messages.value.find((m) => m.id === msg.id);
      if (localMsg) localMsg.isRead = true;
    });
  }
  nextTick(() => scrollToBottom());
};

const reconnectSocket = () => {
  auth.disconnectSocket();
  roomSubscription = null;
  typingSubscription = null;
  connectChat();
};

const handleTyping = () => {
  if (typingDebounce) clearTimeout(typingDebounce);
  typingDebounce = setTimeout(() => {
    const client = auth.getSocket();
    if (client?.connected && newMessage.value.trim()) {
      client.publish({
        destination: `/app/chat.typing/${route.params.id}`,
        body: JSON.stringify({ senderId: auth.user?.id, roomId: route.params.id }),
      });
    }
  }, 300);
};

const fetchMessages = async () => {
  if (abortController.value) abortController.value.abort();
  abortController.value = new AbortController();
  isLoading.value = true;
  try {
    const data = await auth.fetchChatMessages(route.params.id, abortController.value.signal);
    messages.value = (data.messages || []).map((msg) => ({ ...msg, status: "sent" }));
    checkBotStatus(messages.value);
    nextTick(() => scrollToBottom());
    await markMessagesAsRead();
  } catch (e) {
    if (e.name !== "AbortError") {
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
  const roomId = route.params.id;
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
    status: "sending",
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: now.toISOString(),
  };
  messages.value.push(localMsg);
  nextTick(() => scrollToBottom());
  try {
    await auth.sendMessage(roomId, text);
    const msg = messages.value.find((m) => m.id === localId);
    if (msg) msg.status = "sent";
  } catch (e) {
    console.error("[Chat] Ошибка отправки:", e);
    const msg = messages.value.find((m) => m.id === localId);
    if (msg) msg.status = "error";
    notify(e.message || "Не удалось отправить сообщение", "error");
  } finally {
    isSending.value = false;
  }
};

const markMessagesAsRead = async () => {
  const unreadIds = messages.value.filter((m) => !m.isMine && !m.isRead && m.id && !String(m.id).startsWith("local-")).map((m) => m.id);
  if (unreadIds.length === 0) return;
  await Promise.allSettled(unreadIds.map((id) => auth.markMessageAsRead(id, route.params.id)));
  unreadIds.forEach((id) => {
    const msg = messages.value.find((m) => m.id === id);
    if (msg) msg.isRead = true;
  });
};

const handleInput = () => {
  autoResize();
  handleTyping();
};

const insertNewLine = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  newMessage.value = newMessage.value.substring(0, start) + "\n" + newMessage.value.substring(end);
  nextTick(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 1;
    autoResize();
  });
};

const autoResize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 96) + "px";
};

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: scrollContainer.value.scrollHeight, behavior: "smooth" });
  }
};

const checkBotStatus = (msgs) => {
  const lastSellerMsg = [...msgs].reverse().find((m) => !m.isMine);
  if (lastSellerMsg) {
    // const diffHours = (Date.now() - new Date(lastSellerMsg.createdAt)) / 3600000;
    // if (diffHours >= 24) showBotActions.value = true;
  }
};

const handleBotAnswer = (answer) => {
  showBotActions.value = false;
  
  if (answer === "yes") {
    showReviewLink.value = true;
  } else if (answer === "deciding") {
    showReviewLink.value = false;
    setTimeout(() => {
      showBotActions.value = true;
    }, 10000);
  } else {
    showReviewLink.value = false;
  }
};

const openReviewModal = () => {
  isReviewModalOpen.value = true;
};

const handleReviewSuccess = () => {
  isReviewModalOpen.value = false;
  notify("Отзыв отправлен!", "success");
};

const formatStickyDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Сегодня";
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";
  const options = { day: "numeric", month: "long" };
  if (date.getFullYear() !== now.getFullYear()) options.year = "numeric";
  return date.toLocaleDateString("ru-RU", options);
};

const shouldShowDate = (msg, index) => {
  if (index === 0) return true;
  const prev = messages.value[index - 1];
  if (!prev || !prev.createdAt || !msg.createdAt) return false;
  return new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
};

onMounted(() => {
  currentRoomId.value = route.params.id;
  loadOpponentProfile()
    .then(() => loadChatProduct())
    .then(() => fetchMessages())
    .then(() => connectChat())
    .catch((e) => console.error("[onMounted] Error:", e));
});

onUnmounted(() => {
  if (currentRoomId.value) { stompPublish(`/app/chat.leaveRoom/${currentRoomId.value}`, { userId: auth.user?.id });}
  auth.clearActiveRoom();
  if (abortController.value) abortController.value.abort();
  if (typingTimeout) clearTimeout(typingTimeout);
  if (typingDebounce) clearTimeout(typingDebounce);
  if (searchDebounce) clearTimeout(searchDebounce);
  if (searchAbortController.value) searchAbortController.value.abort();
  if (roomSubscription) { roomSubscription.unsubscribe(); roomSubscription = null; }
  if (typingSubscription) { typingSubscription.unsubscribe(); typingSubscription = null; }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    if (oldId) stompPublish(`/app/chat.leaveRoom/${oldId}`, { userId: auth.user?.id });
    auth.clearActiveRoom();
    messages.value = [];
    showBotActions.value = false;
    showReviewLink.value = false;
    isOrderPlaced.value = false;
    isReviewModalOpen.value = false;
    isTyping.value = false;
    opponentProfile.value = null;
    chatData.value = null;
    clearSearch();
    if (roomSubscription) { roomSubscription.unsubscribe(); roomSubscription = null; }
    if (typingSubscription) { typingSubscription.unsubscribe(); typingSubscription = null; }
    currentRoomId.value = newId;
    loadOpponentProfile()
    .then(() => loadChatProduct())
    .then(() => fetchMessages())
    .then(() => connectChat());
  }
});
</script>

<style scoped>
.chat-dialog-window{display:flex;flex-direction:column;height:100vh;height:100dvh;background:#fff;overflow:hidden;background:linear-gradient(126.24deg,rgba(211,242,163,.8) 1.06%,rgba(108,192,139,.8) 52.82%,rgba(7,64,80,.8) 100%);position:relative;}
.chat-dialog-window::before{content:"";position:absolute;inset:0;background-image:url('/src/assets/img/matreshka-pattern.png');background-repeat:repeat;background-size:5.5rem;opacity:.06;pointer-events:none;z-index:0;}
.chat-header{position:relative;display:flex; align-items: flex-start; justify-content: space-between; gap:.625rem;flex-shrink:0;z-index:2;}
.back-btn{font-size:1.5rem;font-weight: 700; border-radius: 0 0 1.875rem 1.875rem ;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:1rem 1.25rem;flex-shrink:0;border:none;background:#858685;transition:transform .15s; box-shadow: 0px 2px 2px 0px #00000040; color: var(--bg-defort);}
.back-btn:active{transform:scale(.95);}
.back-btn img{width:1rem;height:1rem;filter:brightness(0) invert(1);}
.header-user-info{position: relative;z-index: 1; display:flex;align-items:center;gap:0.625rem;cursor:pointer; background: var(--bg-defort); padding: 1.25rem 1.875rem; box-shadow: 0px 2px 2px 0px #00000040; border-radius: 0 0 2.5rem 0;}
.mini-avatar{width:3.148rem;height:3.148rem;border-radius:50%;object-fit:cover;flex-shrink:0;}
.user-meta{display:flex;flex-direction:column;min-width:0;}
.user-meta .name{font-size:1.5rem; font-weight:700; color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s;}
.header-user-info:hover .user-meta .name{color:#64a07a;}
.online-status{font-size: 0.938rem;color:#b9b9b9;}
.online-status.is_online{color:#4caf50;}
.header-product-info{ cursor: pointer; transition: opacity 0.2s ;margin-top: -2.5rem;display:flex; align-items: flex-end;background: #FFFFFF99;padding: 1.25rem 1.875rem ;border-radius:0 0 2.5rem 0;font-size:1.25rem;color:#333;width: 100%;height: 8rem; white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #eee;}
.header-product-info_block{display:flex; align-items: center;gap:1.875rem;}
.header-product-info:hover {
  opacity: 0.85;
}
.header-product-info_block span{ white-space: break-spaces; width: 11.813rem; display: -webkit-box;-webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; font-size: 1.25rem; font-weight: 700;}
.product-mini-photo{width:4.563rem;height:3.125rem;border-radius:.25rem;object-fit:cover;flex-shrink:0;}
.header-search{height: 5.438rem; display:flex;align-items:center;gap:.5rem; background: #FFFFFF99; box-shadow: 0px 2px 2px 0px #00000040; padding: 1.25rem 1.875rem; width: 24.063rem; border-radius: 0 0 0 2.5rem;}
.search-input-wrapper{position:relative;display:flex;align-items:center;width:100%;height:100%;background:#fff;border:1px solid #e0e0e0;border-radius:1.5rem;padding:0 1.75rem 0 2.5rem;transition:border-color .2s,box-shadow .2s;}
.search-input-wrapper.active,.search-input-wrapper:focus-within{border-color:#bdbdbd;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.search-icon{position:absolute;left:0.75rem;width:1rem;height:1rem;color:#888;pointer-events:none;}
.search-input{width:100%;border:none;background:transparent;font-size:.875rem;color:#1a1a1a;outline:none;}
.search-input::placeholder{color:#888;}
.search-clear{position:absolute;right:8px;background:none;border:none;color:#888;cursor:pointer;font-size:1.25rem;padding:0;width:1.5rem;height:1.5rem;display:flex;align-items:center;justify-content:center;line-height:1;border-radius:50%;transition:background .15s;}
.search-clear:hover{background:#f0f0f0;color:#555;}
.search-nav{display:flex;align-items:center;gap:.25rem;background:#f5f5f5;border-radius:.625rem;padding:.125rem .375rem;}
.search-counter{font-size:.75rem;color:#666;font-weight:500;min-width:2.5rem;text-align:center;user-select:none;}
.search-arrow{width:1.5rem;height:1.5rem;border:none;background:transparent;border-radius:.375rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555;transition:background .15s;}
.search-arrow:hover:not(:disabled){background:#e0e0e0;}
.search-arrow:disabled{opacity:.35;cursor:not-allowed;}
.search-arrow svg{width:14px;height:14px;}
.typing-indicator{position:absolute;bottom:-1rem;left:3.2rem;font-size:.7rem;color:#4caf50;display:flex;align-items:center;gap:.25rem;pointer-events:none;}
.typing-dots{display:flex;gap:2px;}
.typing-dots span{width:4px;height:4px;background:#4caf50;border-radius:50%;animation:bounce 1.4s infinite ease-in-out both;}
.typing-dots span:nth-child(1){animation-delay:-.32s;}
.typing-dots span:nth-child(2){animation-delay:-.16s;}
.header-user-info_block{ position: relative; width: 24.063rem;}
@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
.messages-viewport{flex:1;overflow-y:auto;padding:1rem 20% 2.438rem 20%;display:flex;flex-direction:column;position:relative;background-attachment:fixed;gap:.625rem;}
.msg-bubble,.system-msg,.bot-actions-row,.review-invitation,.sticky-date{position:relative;z-index:1;}
.sticky-date{display:flex;justify-content:center;margin:.5rem 0;pointer-events:none;}
.sticky-date span{background: #00000047;color:#fff;font-size:1rem;padding:0.313rem 1rem;border-radius:0.625rem;backdrop-filter:blur(2px);}
.system-msg{align-self:center;background:rgba(0,0,0,.2);color:#fff;padding:0.313rem 1rem;border-radius:0.625rem;font-size:.8125rem;margin:.5rem 0;backdrop-filter:blur(4px);text-align:center;}
.msg-bubble.search-match{box-shadow:0 0 0 2px #ffd700,0 1px 2px rgba(0,0,0,.08);transition:box-shadow .3s;}
.msg-bubble.search-current{box-shadow:0 0 0 3px #ff9800,0 1px 2px rgba(0,0,0,.08);animation:pulse-current 1.5s ease-in-out infinite;}
@keyframes pulse-current{0%,100%{box-shadow:0 0 0 3px #ff9800,0 1px 2px rgba(0,0,0,.08)}50%{box-shadow:0 0 0 5px rgba(255,152,0,.4),0 1px 2px rgba(0,0,0,.08)}}
.msg-bubble{max-width:75%;padding:.5rem .75rem;font-size:.9375rem;line-height:1.35;word-break:break-word;box-shadow:0 1px 2px rgba(0,0,0,.08);}
.msg-bubble.received{align-self:flex-start;background:#fff;border-radius:0.938rem 0.938rem 0.938rem .25rem;color:#1a1a1a;}
.msg-bubble.sent{align-self:flex-end;background:#d4ffe4;border-radius:0.938rem 0.938rem .25rem 0.938rem;color:#1a1a1a;}
.msg-bubble.msg-error{opacity:.8;border:1px solid #ff6b6b;}
.msg-content{display:flex;flex-direction:column;gap:.125rem;}
.msg-footer{display:flex;align-items:center;justify-content:flex-end;gap:0.313rem;margin-top:.125rem;}
.msg-time{font-size:.6875rem;color:#8e8e93;}
.msg-status-text{font-size:.6875rem;color:#8e8e93;}
.msg-status-text.error{color:#ff6b6b;}
.msg-status{display:flex;align-items:center;}
.tick-icon{width:.675rem;height:auto;display:block;}
.bot-actions-row{ margin-top: 0.75rem;}
.bot-actions-row p{font-size:1rem;font-weight: 700; margin-bottom:0.938rem;color:#1a1a1a; width:100%;align-self:center;background:#fff;border-radius:1.25rem;text-align:center; padding: 0.563rem 0;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.btns{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;}
.bot-btn{text-align: center; background:#fff;width: 14.375rem; padding: 0.625rem 1.25rem;border-radius:1.25rem;font-size:1rem;font-weight: 700; cursor:pointer;transition:all .2s;}
.bot-btn:hover{background:#f5f5f5;border-color:#c0c0c0;}
/* .review-invitation{align-self:center;background:#fff;border-radius:1.25rem;padding:1.25rem;text-align:center;max-width:24rem;margin:.75rem 0;box-shadow:0 2px 8px rgba(0,0,0,.06);}
.review-invitation p{font-size:.875rem;color:#1a1a1a;margin-bottom:.625rem;} */
.review-link-btn:hover{background:#5a906e; color: white;}
.chat-input-bar{display:grid;align-items:center;padding:1.25rem .75rem;gap:1rem;border-top:1px solid #e5e5e5;flex-shrink:0;margin:0 2rem;}
.messages-page-wrapper{border-radius:0 0 .938rem .938rem;overflow:hidden;}
.connection-status{width:100%;text-align:center;font-size:.875rem;padding:.2rem;border-radius:.5rem;}
.connection-status.offline{color:#ff6b6b;background:#fff0f0;display:flex;align-items:center;justify-content:center;gap:3.5rem;width:43%;margin:0 auto;z-index:1;margin-bottom:.5rem;}
.connection-status.loading{color:#888;}
.retry-btn{background:#ff6b6b;color:#fff;border:none;padding:.2rem .8rem;border-radius:.25rem;font-size:.875rem;cursor:pointer;}
.attach-btn{width:3rem;height:3rem;border-radius:.938rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;border:none;background:transparent;opacity:.55;transition:opacity .2s;background:#fff;}
.attach-btn:hover{opacity:.85;}
.attach-btn img{width:1.25rem;height:1.25rem;}
.chat-input-bar textarea{border:1px solid #e0e0e0;background:#fff;padding:1rem .75rem;border-radius:.938rem;resize:none;font-family:inherit;font-size:.75rem;outline:none;min-height:3.063rem;overflow-y:auto;color:#1a1a1a;transition:border-color .2s;width:36.938rem;}
.chat-input-bar textarea::-webkit-scrollbar,.chat-input-bar textarea::-webkit-scrollbar-thumb{width:0!important;}
.messages-viewport::-webkit-scrollbar-thumb{background:#d4ffe4;}
.chat-input-bar textarea::placeholder{color:#bbb;}
.chat-input-bar textarea:focus{border-color:#bdbdbd;}
.send-btn{width:3rem;height:3rem;border-radius:.938rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;border:none;background:#fff;transition:all .2s;}
.send-btn:hover:not(:disabled){background:#666;}
.send-btn:disabled{opacity:.4;cursor:not-allowed;}
.send-btn img{width:1.25rem;height:1.25rem;}
.chat_footer-block{display:flex;gap:.563rem;justify-content:center;align-items:flex-end;z-index:2;}
.msg-media { margin-bottom: 0.25rem; }
.chat-media-img { max-width: 260px; max-height: 200px; border-radius: 0.5rem; cursor: pointer; object-fit: cover; display: block;}
.chat-media-video { max-width: 260px; max-height: 200px; border-radius: 0.5rem; display: block;}
:deep(.multiselect__option){display: grid;align-items: center;padding: 0.75rem;line-height: 1rem;min-height: auto;text-decoration: none;text-transform: none;vertical-align: middle;position: relative;cursor: pointer;white-space: normal;font-size: 1rem;}
</style>