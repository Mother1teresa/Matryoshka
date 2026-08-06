<template>
  <div class="general-container reviews-container">
    <h2 class="page-title">Отзывы</h2>
    <div v-if="reviewStore.isLoading" class="loading-state">Загрузка отзывов...</div>
    <div v-else class="reviews-content">
      <!-- Белая карточка: аватар + инфо + empty-state (если нет отзывов) -->
      <div class="reviews-summary">
        <div class="summary-card">
          <img :src="auth.userAvatar" class="large-avatar" />
          <div class="summary-info">
            <div class="user-type">{{ userRole === 'COMPANY' ? 'Компания' : 'Частное лицо' }}</div>
            <div v-if="userRating > 0" class="rating-badge">
              <span class="rating-num">{{ userRating }}</span>
              <div class="stars">
                <img
                  v-for="n in 5"
                  :key="n"
                  :src="n <= Math.round(userRating) ? '/img/users/star.png' : '/img/users/star_1.png'"
                  class="star-icon"
                  alt="★"
                />
              </div>
              <!-- <span class="reviews-count">{{ reviewsCount }} отзывов</span> -->
            </div>
            <div v-if="userRating > 0" class="empty-hint">
              Отвечайте на отзывы, так вы будете более лояльны к клиентам
            </div>
            <div v-if="userRating === 0" class="empty-state">
              <div class="empty-title">У вас пока нет отзывов</div>
              <div class="empty-subtitle">Разместите объявление или опубликуйте мини-видео</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Список отзывов -->
      <div v-if="reviews.length > 0" class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="user-info">
              <div class="user-info_av">
                <img v-if="review.userAvatar" :src="review.userAvatar" class="user-avatar" alt="Аватар автора"/>
                <div v-else class="user-avatar-placeholder" :style="{ backgroundColor: getUserColor(review.author) }">
                  {{ review.author?.charAt(0).toUpperCase() }}
                </div>
                <div class="stars-row">
                  <img
                    v-for="n in 5"
                    :key="n"
                    :src="n <= Math.round(review.rating) ? '/src/assets/img/form/star_1.png' : '/src/assets/img/form/star.png'"
                    class="star-icon"
                    alt="★"
                  />
                </div>
              </div>
              <div class="user-details">
                <div class="user-name">{{ review.author }}</div>
                <div class="review-body">{{ review.text }}</div>
              </div>
            </div>
            <div class="review-meta">
              <div class="review-meta_unt"><img src="/src/assets/img/icons/settings-gear.svg" alt="settings" /></div>
              <div class="review-date">{{ reviewStore.formatDate(review.date) }}</div>
            </div>
          </div>

          <!-- Ответ продавца -->
          <div v-if="review.reply" class="seller-reply">
            <img :src="auth.userAvatar" class="reply-avatar" />
            <div class="reply-content">
              <div class="reply-label">Ответ продавца</div>
              <div class="reply-text">{{ review.reply }}</div>
            </div>
          </div>

          <!-- Форма ответа -->
          <div v-else-if="activeReplyFields[review.id]" class="reply-form-container">
            <div class="seller-reply">
              <img :src="auth.userAvatar" class="reply-avatar" />
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

          <div v-else-if="isOwnProfile" class="reply-actions">
            <button class="reply-button" @click="toggleReplyField(review.id)">Ответить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { notify } from '../../utils/notify';

const auth = useAuthStore();
const reviewStore = useReviewStore();

const replyTexts = ref({});
const activeReplyFields = ref({});

const userRating = computed(() => auth.user?.rating || 0);
const reviewsCount = computed(() => reviewStore.getReviewsCountById(auth.user?.id));
const reviews = computed(() => reviewStore.reviews || []);
const isOwnProfile = computed(() => true);

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
    await reviewStore.addReply(reviewId, text, auth.user?.id);
    activeReplyFields.value[reviewId] = false;
    delete replyTexts.value[reviewId];
  } catch (e) {
    console.error("Не удалось отправить ответ", e);
    notify("Не удалось отправить ответ");
  }
}
</script>

<style scoped>
.reviews-container {padding: 2.188rem 0;}
.reviews-content {margin-top: 1.25rem;}
.reviews-summary {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  background-color: white;
  border-radius: 1.25rem;
  padding: 2.25rem 1.25rem;
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #242424;
}
.user-type {
  font-size: 1.25rem;
  color: #262626;
  font-weight: 700;
}
.stars {
  display: flex;
  gap: 0.125rem;
}
.reviews-count {
  font-size: 0.875rem;
  color: #888;
  margin-left: 0.25rem;
}
.empty-hint {
  font-size: 0.813rem;
  color: #858685;
  margin-top: 0.313rem;
}
.empty-state {
  text-align: left;
}
.empty-title {
  font-size: 1rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}
.empty-subtitle {
  font-size: 0.875rem;
  color: #888;
}
.large-avatar {
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.review-card {
  margin-bottom: 1.25rem;
  /* padding: 0.625rem 0.625rem 0.688rem 0.625rem; */
  background: #FFFFFF;
  border-radius: 0.625rem;
  overflow: hidden;
}
.review-body {
  margin-bottom: .4rem;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  position: relative;
}
.user-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.user-avatar {
  width: 3.938rem;
  height: 3.938rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}
.user-info_av{
 padding: 1.5rem 2rem;
}
.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.5rem 0.875rem;
  border-left: 1px solid #858685
}
.user-name {
  font-weight: 600;
  color: #1a1a1a;
}
.review-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.review-meta_unt{
  position: absolute;
  top: 0;
  right: 0;
  width: 4.375rem;
}
.stars-row {
  display: flex;
  gap: 0.125rem;
}
.review-date {
  font-size: 0.75rem;
  color: #999;
}
.seller-reply {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 0.625rem;
}
.reply-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.reply-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.reply-label {
  font-size: 0.75rem;
  color: #888;
}
.reply-text {
  color: #2D2D2D;
  font-size: 0.9375rem;
}
.reply-actions {
  margin-left: 3.25rem;
  margin-top: 0.5rem;
}
.reply-button {
  background: none;
  border: none;
  color: #A3A3A3;
  font-size: 0.813rem;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}
.reply-button:hover {
  text-decoration: underline;
}
.reply-form-container {
  margin-left: 3.25rem;
  margin-top: 0.5rem;
}
.reply-form-container .seller-reply {
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.35rem 0.65rem 0.6rem;
}
.reply-form-container input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.813rem;
  color: #262626;
}
.reply-form-container input::placeholder {
  color: #8E8C8C;
}
.send-reply-btn {
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  width: 2.945rem;
  height: 3.125rem;
  border-radius: 0.938rem;
  flex-shrink: 0;
}
.send-reply-btn img {
  width: 2.558rem;
  height: 2.558rem;
}
.send-reply-btn:hover {
  transform: scale(1.1);
}
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>