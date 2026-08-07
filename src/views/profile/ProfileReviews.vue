<template>
  <div class="general-container reviews-container">
    <h2 class="page-title">Отзывы</h2>
    <div v-if="reviewStore.isLoading" class="loading-state">Загрузка отзывов...</div>
    <div v-else class="reviews-content">
      <div class="reviews-summary">
        <div class="summary-card">
          <img :src="auth.userAvatar" class="large-avatar" />
          <div class="summary-info">
            <div class="user-type">{{ userRole === 'COMPANY' ? 'Компания' : 'Частное лицо' }}</div>
            <div v-if="userRating > 0" class="rating-badge">
              <span class="rating-num">{{ userRating }}</span>
              <div class="stars">
                <img v-for="n in 5" :key="n" :src="n <= Math.round(userRating) ? '/img/users/star.png' : '/img/users/star_1.png'" class="star-icon" alt="★" />
              </div>
            </div>
            <div v-if="userRating > 0" class="empty-hint">Отвечайте на отзывы, так вы будете более лояльны к клиентам</div>
            <div v-if="userRating === 0" class="empty-state">
              <div class="empty-title">У вас пока нет отзывов</div>
              <div class="empty-subtitle">Разместите объявление или опубликуйте мини-видео</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="reviews.length > 0" class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-inner">
            <div class="review-left">
              <img v-if="review.userAvatar" :src="review.userAvatar" class="user-avatar" alt="Аватар автора" />
              <div v-else class="user-avatar-placeholder" :style="{ backgroundColor: getUserColor(review.author) }">{{ review.author?.charAt(0).toUpperCase() }}</div>
              <div class="stars-row">
                <img v-for="n in 5" :key="n" :src="n <= Math.round(review.rating) ? '/img/users/star.png' : '/img/users/star_1.png'" class="star-icon" alt="★" />
              </div>
            </div>

            <div class="review-body">
              <div class="review-author">{{ review.author }}</div>
              <div v-if="review.productName || review.product" class="review-product">{{ review.productName || review.product }}</div>
              <div class="review-text">{{ review.text }}</div>

              <div v-if="review.reply" class="seller-reply">
                <!-- <img :src="auth.userAvatar" class="reply-avatar" /> -->
                <div class="reply-content">
                  <div class="reply-label">Ответ продавца</div>
                  <div class="reply-text">{{ review.reply }}</div>
                </div>
              </div>

              <div v-else-if="activeReplyFields[review.id]" class="reply-form">
                <div class="seller-reply reply-form-inner">
                  <!-- <img :src="auth.userAvatar" class="reply-avatar" /> -->
                  <div class="reply-content" style="flex:1">
                    <div class="reply-label">Ответ продавца</div>
                    <input type="text" placeholder="Напишите текст..." v-model="replyTexts[review.id]" @keyup.enter="sendReply(review.id)" />
                  </div>
                  <button class="send-reply-btn" @click="sendReply(review.id)"><img src="/src/assets/img/icons/send.svg" alt="Отправить" /></button>
                </div>
              </div>

              <div v-else-if="isOwnProfile" class="reply-actions"><button class="reply-button" @click="toggleReplyField(review.id)">Ответить</button></div>
            </div>

            <div class="review-right">
              <div class="review-meta-top">
                <span class="review-category">{{ review.category || review.productCategory || '' }}</span>
                <button class="menu-gear-btn" :class="{ active: activeMenuId === review.id }" @click.stop="toggleMenu(review.id)">
                  <img src="/src/assets/img/settings-gear3.svg" alt="menu" />
                </button>
                <div v-if="activeMenuId === review.id" class="review-dropdown-menu">
                  <button class="dropdown-item" @click.stop="complain(review.id)">Пожаловаться</button>
                </div>
              </div>
              <div class="review-date">{{ reviewStore.formatDate(review.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { notify } from '../../utils/notify';

const activeMenuId = ref(null);
const auth = useAuthStore();
const reviewStore = useReviewStore();
const replyTexts = ref({});
const activeReplyFields = ref({});
const userRating = computed(() => auth.user?.rating || 0);
const reviewsCount = computed(() => reviewStore.getReviewsCountById(auth.user?.id));
const reviews = computed(() => reviewStore.reviews || []);
const isOwnProfile = computed(() => true);
const userRole = computed(() => auth.user?.role || 'PRIVATE_PERSON');

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const closeMenu = (e) => {
  if (!e.target.closest('.menu-gear-btn') && !e.target.closest('.review-dropdown-menu')) {
    activeMenuId.value = null;
  }
};

onMounted(() => {
  window.addEventListener('click', closeMenu);
});
onUnmounted(() => {
  window.removeEventListener('click', closeMenu);
});

function complain(reviewId) {
  activeMenuId.value = null;
  notify('Жалоба отправлена');
}

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
    notify("Не удалось отправить ответ");
  }
}
</script>

<style scoped>
.reviews-container{padding:2.188rem 0}
.reviews-content{margin-top:1.25rem}
.reviews-summary{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:1.25rem;background-color:#fff;border-radius:1.25rem;padding:2.25rem 1.25rem}
.summary-card{display:flex;align-items:center;gap:1.5rem}
.large-avatar{width:6.25rem;height:6.25rem;border-radius:50%;object-fit:cover;flex-shrink:0}
.summary-info{display:flex;flex-direction:column;gap:.25rem}
.user-type{font-size:1.25rem;color:#262626;font-weight:700}
.rating-badge{display:flex;align-items:center;gap:.5rem;margin-top:.25rem}
.rating-num{font-size:1.5rem;font-weight:700;color:#242424}
.stars{display:flex;gap:.125rem}
.star-icon{width:1.25rem;height:1.25rem}
.empty-hint{font-size:.813rem;color:#858685;margin-top:.313rem}
.empty-state{text-align:left;margin-top:.5rem}
.empty-title{font-size:1rem;color:#1a1a1a;margin-bottom:.25rem;font-weight:600}
.empty-subtitle{font-size:.875rem;color:#888}
.review-card{background:#fff;border-radius:1.25rem;margin-bottom:1.25rem;overflow:hidden}
.review-inner{display:flex;align-items:stretch}
.review-left{display:flex;flex-direction:column;align-items:center;justify-content: flex-start;gap:1.125rem;padding:1.5rem 2.688rem 1.5rem 2rem;border-right:1px solid #858685}
.user-avatar{width:5rem;height:5rem;border-radius:50%;object-fit:cover;flex-shrink:0}
.user-avatar-placeholder{width:5rem;height:5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:1.5rem;flex-shrink:0}
.stars-row{display:flex;gap:.125rem}
.stars-row .star-icon{width:1rem;height:1rem}
.review-body{ width: 47rem;padding:1.188rem 0 0.813rem 0.875rem;display:flex;flex-direction:column;min-width:0}
.review-author{font-size:1.25rem;font-weight:700;color:#242424}
.review-product{font-size:1.125rem;color:#888;margin-top:.25rem;font-weight:400}
.review-text{font-size:1rem;color:#333;margin-top:0.625rem;line-height:1.5;word-break:break-word}
.reply-actions{margin-top:0.625rem}
.reply-button{background:none;border:none;color:#a3a3a3;font-size:0.813rem;cursor:pointer;padding:0;font-weight:400}
.reply-button:hover{text-decoration:underline}
.review-right{display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;padding:1.5rem 0 1.5rem 1.5rem;min-width:19rem}
.review-meta-top{display:flex;align-items:center;gap:.75rem;position:relative}
.review-category{font-size:.875rem;color:#999;white-space:nowrap}
.review-date{font-size:.875rem;color:#999;white-space:nowrap;padding-right:1.5rem}
.menu-gear-btn {position: absolute;top: -1.5rem;right: 0rem;width: 4.25rem;height: 2.938rem;background: var(--btn-bg);border: none;border-radius: 0 1.25rem 0 1.25rem;display: flex;align-items: center;justify-content: center;cursor: pointer;z-index: 2;transition: all .3s;}
.menu-gear-btn img {width: 2rem;height: 2rem;filter: brightness(0) invert(1);}
.menu-gear-btn.active,
.menu-gear-btn:active {background: var(--bg-defort);box-shadow: 0px 4px 4px 0px #00000040;}
.menu-gear-btn.active img,.menu-gear-btn:active img {filter: none;}
.review-dropdown-menu{position:absolute;top:2.75rem;right:0;background:#6aaa7d;border-radius:.625rem;box-shadow:0 4px 15px rgba(0,0,0,.15);z-index:10;min-width:10rem;overflow:hidden}
.dropdown-item{width:100%;padding:.75rem 1rem;border:none;background:none;color:#fff;text-align:left;font-size:.875rem;cursor:pointer;transition:background .2s}
.dropdown-item:hover{background:#388253}
.seller-reply{display:flex;align-items:flex-start;gap:.75rem;margin-top:1rem;padding:0.625rem 0.625rem 1.438rem 0.625rem;background:#f5f5f5;border-radius:.625rem; width: 100%; margin-left: 0;}
.reply-avatar{width:2rem;height:2rem;border-radius:50%;object-fit:cover;flex-shrink:0}
.reply-content{display:flex;flex-direction:column;flex:1}
.reply-label{font-size:0.813rem;color:#8E8C8C; margin-bottom: 0.625rem;}
.reply-text{color:#2d2d2d;font-size:.9375rem;line-height:1.4}
.reply-form{margin-top:1rem}
.reply-form-inner{align-items:center;padding:.75rem 1rem;margin-top:0}
.reply-form-inner input{flex:1;background:transparent;border:none;outline:none;font-size:0.813rem;color:#262626;width:100%}
.reply-form-inner input::placeholder{color:#858685}
.send-reply-btn{background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;width:2.5rem;height:2.5rem;border-radius:.625rem;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.send-reply-btn img{width:1.25rem;height:1.25rem}
.send-reply-btn:hover{transform:scale(1.05)}
.loading-state{text-align:center;padding:3rem;color:#888}
@media(max-width:768px){
.review-inner{flex-direction:column}
.review-left{flex-direction:row;border-right:none;border-bottom:1px solid #e5e5e5;padding:1rem}
.review-body{padding:1rem}
.review-right{flex-direction:row;align-items:center;padding:0 1rem 1rem;gap:1rem}
.review-meta-top{order:2}
.review-date{order:1;padding-right:0;margin-top:0}
.review-dropdown-menu{top:2.25rem;right:.5rem}}
</style>