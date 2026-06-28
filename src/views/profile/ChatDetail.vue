<<template>
  <div class="messages-page-wrapper">
    <ChatsList v-if="!selectedChatId" @select="openChat" />
    <div v-else class="chat-dialog-window">
      <header class="chat-header">
        <button class="back-btn" @click="selectedChatId = null">
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

          <div :class="['msg-bubble', msg.isMine ? 'sent' : 'received']">
            <div class="msg-content">
              {{ msg.text }}
              <div class="msg-footer">
                <span class="msg-time">{{ msg.time }}</span>
                <div v-if="msg.isMine" class="msg-status">
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
        <button v-if="!isOrderPlaced" class="order-btn" @click="handleCreateOrder">Оформить заказ</button>
        <button class="attach-btn">
          <img src="/src/assets/img/icons/clip.svg" />
        </button>
        <textarea v-model="newMessage" placeholder="Напишите сообщение..." @keydown.enter.prevent="sendMessage" rows="1"></textarea>
        <button class="send-btn" @click="sendMessage">
          <img src="/src/assets/img/icons/send-plane.svg" />
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";

const route = useRoute();
const auth = useAuthStore();
const messages = ref([]);
const chatData = ref(null);
const currentChat = computed(() => {
  const roomId = route.params.id;
  return auth.allChats.find(c => c.id === roomId) || chatData.value;
});
const scrollContainer = ref(null);
const newMessage = ref("");
let polling = null;

const isOrderPlaced = ref(false);
const showBotActions = ref(false);
const showReviewLink = ref(false);

const loadChatInfo = () => {
  const roomId = route.params.id;
  const found = auth.allChats.find(c => c.id === roomId);
  if (found) chatData.value = found;
};

const fetchMessages = async () => {
  try {
    const data = await auth.fetchChatMessages(route.params.id);
    messages.value = data.messages || [];
    loadChatInfo();
    checkBotStatus(messages.value);
    nextTick(() => scrollToBottom());
  } catch (e) {
    console.error("Ошибка загрузки сообщений:", e);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  const text = newMessage.value;
  newMessage.value = "";

  const tempMsg = {
    id: `temp-${Date.now()}`,
    text,
    isMine: true,
    isRead: false,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: new Date().toISOString(),
  };
  messages.value.push(tempMsg);
  nextTick(() => scrollToBottom());

  try {
    await auth.sendMessage(route.params.id, text);
    await fetchMessages();
    await auth.fetchUserChats();
  } catch (e) {
    messages.value = messages.value.filter(m => m.id !== tempMsg.id);
    newMessage.value = text;
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
  if (answer === 'yes') {
    showBotActions.value = false;
    showReviewLink.value = true;
  } else if (answer === 'no') {
    showBotActions.value = false;
  } else if (answer === 'deciding') {
    showBotActions.value = false;
  }
};

const handleCreateOrder = () => {
  isOrderPlaced.value = true;
  nextTick(() => scrollToBottom());
};

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const openReviewModal = () => {
  console.log("Открытие модалки отзыва...");
};

const formatStickyDate = (dateStr) => {
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
  const prevDate = new Date(messages.value[index - 1].createdAt).toDateString();
  const currDate = new Date(msg.createdAt).toDateString();
  return prevDate !== currDate;
};

onMounted(() => {
  loadChatInfo();
  fetchMessages();
  polling = setInterval(fetchMessages, 5000);
});

onUnmounted(() => clearInterval(polling));
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
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.back-btn img {
  width: 1.25rem;
  height: 1.25rem;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.mini-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-meta .name {
  display: block;
  font-weight: 600;
  font-size: 0.938rem;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.online-status {
  font-size: 0.75rem;
  color: #999;
}

.online-status.is_online {
  color: #64a07a;
}

.header-product-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9f9f9;
  padding: 0.313rem 0.75rem;
  border-radius: 0.625rem;
  font-size: 0.813rem;
  color: #555;
  flex-shrink: 0;
  max-width: 12rem;
}

.header-product-info img {
  width: 2.25rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  object-fit: cover;
  flex-shrink: 0;
}

.messages-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #D3F2A3 0%, #6CC08B 50%, #074050 100%);
  background-attachment: fixed;
  gap: 0.625rem;
}

.messages-viewport::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/src/assets/img/matreshka-pattern.png');
  background-repeat: repeat;
  background-size: 15rem;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.msg-bubble,
.system-msg,
.bot-actions-row,
.review-invitation,
.sticky-date {
  position: relative;
  z-index: 1;
}

.sticky-date {
  display: flex;
  justify-content: center;
  margin: 0.938rem 0;
  pointer-events: none;
}

.sticky-date span {
  background: rgba(0, 0, 0, 0.2);
  color: #ffffff;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1.25rem;
  backdrop-filter: blur(0.25rem);
}

.system-msg {
  align-self: center;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  margin: 0.5rem 0;
}

.msg-bubble {
  max-width: 80%;
  padding: 0.625rem 0.938rem;
  font-size: 0.875rem;
  line-height: 1.4;
  position: relative;
  box-shadow: 0 0.063rem 0.125rem rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.msg-bubble.received {
  align-self: flex-start;
  background: #ffffff;
  border-radius: 0.938rem 0.938rem 0.938rem 0.125rem;
}

.msg-bubble.sent {
  align-self: flex-end;
  background: #e1fec6;
  border-radius: 0.938rem 0.938rem 0.125rem 0.938rem;
}

.msg-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.msg-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.313rem;
  margin-top: 0.125rem;
}

.msg-time {
  font-size: 0.625rem;
  color: #888;
}

.msg-status {
  display: flex;
  align-items: center;
}

.tick-icon {
  width: 0.875rem;
  height: auto;
  display: block;
}

.tick-icon.is-read {
  filter: none;
}

.bot-actions-row {
  width: 100%;
  align-self: center;
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 1.25rem;
  padding: 1rem;
  text-align: center;
  max-width: 25rem;
  margin: 1.25rem 0;
  box-shadow: 0 0.25rem 0.938rem rgba(0, 0, 0, 0.05);
}

.bot-actions-row p {
  font-size: 0.813rem;
  margin-bottom: 0.938rem;
  color: #1a1a1a;
}

.btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.313rem;
}

.bot-btn {
  background: #fff;
  border: 0.063rem solid #dcdcdc;
  padding: 0.5rem 1.25rem;
  border-radius: 0.625rem;
  font-size: 0.813rem;
  cursor: pointer;
  transition: background 0.2s;
}

.bot-btn:hover {
  background: #f5f5f5;
}

.review-invitation {
  align-self: center;
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.25rem;
  text-align: center;
  max-width: 25rem;
  margin: 1.25rem 0;
  box-shadow: 0 0.25rem 0.938rem rgba(0, 0, 0, 0.1);
}

.review-invitation p {
  font-size: 0.875rem;
  color: #1a1a1a;
  margin-bottom: 0.625rem;
}

.review-link-btn {
  background: #64a07a;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.625rem;
  cursor: pointer;
  margin-top: 0.625rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.review-link-btn:hover {
  background: #5a906e;
}

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 0.938rem 1.25rem;
  gap: 0.938rem;
  background: #fff;
  border-top: 0.063rem solid #eee;
  flex-shrink: 0;
}

.order-btn {
  background: #ffffff;
  border: 0.063rem solid #e0e0e0;
  border-radius: 0.625rem;
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.order-btn:hover {
  background: #f9f9f9;
}

.attach-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.attach-btn img {
  width: 1.25rem;
  height: 1.25rem;
}

.chat-input-bar textarea {
  flex: 1;
  border: none;
  background: #f5f5f5;
  padding: 0.625rem 1rem;
  border-radius: 1.25rem;
  resize: none;
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  min-height: 2.5rem;
  max-height: 6rem;
  line-height: 1.4;
}

.send-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.send-btn img {
  width: 1.5rem;
  height: 1.5rem;
}

.product-mini-photo {
  width: 4.563rem;
  height: 3.125rem;
  border-radius: 0.625rem;
  object-fit: cover;
}
</style>