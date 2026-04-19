<template>
  <div class="general-container reviews-container">
    <h2 class="page-title">Отзывы</h2>
    <div v-if="reviewStore.isLoading" class="loading-state">Загрузка отзывов...</div>
    <div v-else class="reviews-content">
      <div class="reviews-summary">
        <div class="summary-card">
          <img :src="auth.userAvatar" class="large-avatar" />
          <div class="rating-badge">
            <span class="rating-num">{{ reviewStore.getRatingById(auth.user?.id) }}</span>
            <span class="stars">{{ reviewStore.renderStars(reviewStore.getRatingById(auth.user?.id)) }}</span>
          </div>
        </div>
      </div>
      <!-- Список отзывов -->
      <div v-if="reviews.length > 0" class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="user-info">
            <img v-if="review.userAvatar" :src="review.userAvatar || maskAvatar"  class="user-avatar"  alt="Аватар автора"/>
            <div v-else 
                class="user-avatar-placeholder" 
                :style="{ backgroundColor: getUserColor(review.author) }">
                {{ review.author?.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
                <div class="user-name">{{ sellerRating  }}</div>
                <div class="review-product">{{ sellerStars }}</div>
                <div class="review-body">
                    {{ review.text }}
                </div>
            </div>
            </div>
            <div class="review-meta">
                <div class="deal-status">Сделка состоялась</div>
                <div class="stars-row">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</div>
                <div class="review-date">{{ review.date }}</div>
            </div>
          </div>
            <div v-if="review.reply" class="seller-reply">
                <img :src="auth.userAvatar || '/src/assets/img/mask-avatar.png'" class="reply-avatar" />
                <div class="reply-content">
                    <div class="reply-label">Ответ продавца</div>
                    <div class="reply-text">{{ review.reply }}</div>
                </div>
            </div>
            <!-- Если нажали "Ответить" — показываем поле ввода -->
            <div v-else-if="activeReplyFields[review.id]" class="reply-form-container">
                <div class="seller-reply">
                <img :src="auth.userAvatar || '/src/assets/img/mask-avatar.png'" class="reply-avatar" />
                <div class="reply-content" style="flex: 1;">
                    <div class="reply-label">Ответ продавца</div>
                    <input 
                        type="text" 
                        placeholder="Напишите ответ..." 
                        v-model="replyTexts[review.id]"
                        @keyup.enter="sendReply(review.id)"
                    />
                </div>
                <button class="send-reply-btn" @click="sendReply(review.id)">
                    <img src="/src/assets/img/icons/send.svg" alt="Отправить" />
                </button>
                </div>
            </div>
            <div v-else class="reply-actions">
                <button class="reply-button" @click="toggleReplyField(review.id)">
                Ответить
                </button>
            </div>
        </div>
      </div>
      <div v-else class="empty-state">
        У вас пока нет отзывов
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import maskAvatar from "/src/assets/img/mask-avatar.png"

const auth = useAuthStore();
const reviewStore = useReviewStore();

const replyTexts = ref({});
const activeReplyFields = ref({});
const sellerRating = computed(() => {
  return reviewStore.getRatingById(auth.user?.id);
});

const sellerStars = computed(() => {
  return reviewStore.renderStars(sellerRating.value);
});

const reviews = computed(() => reviewStore.reviews || []);

watch(
  () => auth.user?.id,
  (newId) => {
    if (newId) {
      reviewStore.fetchReviewsBySeller(newId);
    }
  },
  { immediate: true }
);

function getUserColor(name) {
  if (!name) return '#ccc';
  const hash = Array.from(name).reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'];
  return colors[hash % colors.length];
}
function toggleReplyField(reviewId) {
  activeReplyFields.value[reviewId] = !activeReplyFields.value[reviewId];
}
async function sendReply(reviewId) {
  const text = replyTexts.value[reviewId];
  if (!text || text.trim() === '') return;
  try {
    await reviewStore.addReply(reviewId, text);
    activeReplyFields.value[reviewId] = false;
    delete replyTexts.value[reviewId]; 
  } catch (e) {
    console.error("Не удалось отправить ответ", e);
  }
}
</script>
<style scoped>
.reviews-container {
  padding: 2rem 0;
}
.reviews-summary {
  display: flex;
  justify-content: center;
  margin-bottom: 0.938rem;
  background-color: white;
  border-radius: 0.625rem;
  padding: 1rem 0;
}
.summary-card {
  text-align: center;
  display: grid;
  justify-items: center;
}
.stars {
  color: var(--btn-bg);
  letter-spacing: 2px;
  font-size: 2.65rem;
}
.summary-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 2px solid #eee;
}
.big-rating {
  font-size: 2.5rem;
  font-weight: 700;
  display: block;
}
.reviews-list{
  border: 1px solid #D0D0D0;
  background: #F5F5F5;
  border-radius: 0.625rem;
  padding: 0.625rem;
}
.review-card {
  margin-bottom: 0.5rem;
  padding: 0.625rem 0.625rem 0.688rem 0.625rem;
  border-bottom: 1px solid #f0f0f0;
  background: #FFFFFF;
  border-radius: 0.625rem;
}
.review-body{
  margin-bottom: .4rem;
}
.review-main {
  display: flex;
  gap: 1.5rem;
}
.user-initials {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.status-tag {
  font-size: 0.75rem;
  color: #999;
}
.product-link {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.reply-block {
  margin-top: 1rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 12px;
}
.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 5px;
}
.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.reply-form {
  margin-top: 1rem;
}
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f5;
  padding: 8px 15px;
  border-radius: 25px;
}
.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9rem;
}
.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  transition: opacity 0.2s;
}
.send-btn:hover {
  opacity: 0.7;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  background: #fcfcfc;
  border-radius: 12px;
  border: 1px dashed #eee;
  font-size: 1rem;
}
.reply-actions{
  margin-left: 4.375rem;
}
.reply-text {
  color: #2D2D2D;
}

/* Стили для формы ввода */
.reply-form-container{
  margin-left: 4.375rem;
  width: 80%;
} 
.seller-reply {
  margin-left: 0;
  align-items: center; 
  width: 100%;
  padding: .5rem 0.35rem .65rem .6rem;
  border-radius: 0.625rem;
}
.seller-reply input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.813rem;
  color: #262626;
}
.seller-reply input::placeholder {
  color: #8E8C8C;
}
.send-reply-btn {
  background: white;
  border: none;
  cursor: pointer;
  align-items: center;
  display: flex;
  transition: transform 0.2s;
  width: 2.945rem;
  height: 3.125rem;
  border-radius: 0.938rem;
}
.send-reply-btn img{
  width: 2.558rem;
  height: 2.558rem;
}
.send-reply-btn:hover {
  transform: scale(1.1);
}
/* Кнопка "Ответить" */
.reply-button {
  background: none;
  border: none;
  color: #A3A3A3;
  font-size: 0.813rem;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
  text-decoration: none;
}
.reply-button:hover {
  text-decoration: underline;
}
</style>
