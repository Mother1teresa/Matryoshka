<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { formatDate } from "/src/utils/formatters.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const videoRefs = ref([]);
const scrollContainer = ref(null);
const videos = computed(() => authStore.allVideos);
const isLoading = computed(() => authStore.isVideosLoading);
const favStore = useFavoritesStore();

const onLikeClick = (video) => {
  favStore.toggleFavorite(video);
};
const setVideoRef = (el) => {
  if (el && !videoRefs.value.includes(el)) videoRefs.value.push(el);
};
const handleKeyDown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    scrollNext();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    scrollPrev();
  }
};
onMounted(async () => {
  if (videos.value.length === 0) {
    await authStore.fetchVideos();
  }
  window.addEventListener("keydown", handleKeyDown);
  nextTick(() => {
    initObserver();
    if (route.params.id) {
      scrollToVideo(route.params.id);
    }
  });
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
const initObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play();
          router.replace({
            name: "shorts",
            params: { id: entry.target.dataset.id },
          });
        } else {
          entry.target.pause();
          entry.target.currentTime = 0;
}});},{ threshold: 0.6 },); videoRefs.value.forEach((v) => observer.observe(v));};

const scrollNext = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  }
};
const scrollPrev = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      top: -window.innerHeight,
      behavior: "smooth",
    });
  }
};
const scrollToVideo = (id) => {
  const el = videoRefs.value.find((v) => v.dataset.id === id);
  if (el) el.scrollIntoView();
};
const closeShorts = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};
const isShareModalOpen = ref(false);
const shareLink = ref("");
const openShareModal = (video) => {
  const baseUrl = window.location.origin;
  shareLink.value = `${baseUrl}/shorts/${video.id}`;
  isShareModalOpen.value = true;
};
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    alert("Ссылка скопирована!"); 
  } catch (err) {
    console.error("Ошибка копирования", err);
  }
};
</script>
<template>
  <div class="shorts-page-overlay">
    <button class="close-btn" @click="closeShorts">
      <img src="/src/assets/img/icons/close-white.svg" alt="close" />
    </button>
    <div v-if="isLoading" class="loader">Загрузка роликов...</div>
    <div v-else class="shorts-main-container" ref="scrollContainer">
      <div v-for="video in videos" :key="video.id" class="short-snap-item">
        <div class="short-content-wrapper">
          <!-- ВИДЕО (Левая часть) -->
          <div class="video-side">
            <video
              :src="video.cdnUrl || video.url"
              :ref="setVideoRef"
              :data-id="video.id"
              loop
              playsinline
              muted
            ></video>
            <div class="video-actions">
              <div class="v-action">
                <button class="action-btn" @click.stop="onLikeClick(video)">
                    <img 
                    :src="favStore.isFavorite(video.id) ? heartFilled : heart" 
                    class="like-icon"
                    />
                </button>
              </div>
              <div class="v-action">
                <button class="action-btn"><img src="/src/assets/img/mes.svg" /></button>
              </div>
              <div class="v-action">
                <button class="action-btn" @click="openShareModal(video)">
                  <img src="/src/assets/img/icons/lin.svg" alt="">
                </button>
              </div>
              <div class="v-divider"></div>
              <div class="v-action scroll-arrows">
                <button class="action-btn arrow-btn" @click="scrollPrev">
                  <img src="/src/assets/img/icons/up.svg" alt="up" />
                </button>
                <button class="action-btn arrow-btn" @click="scrollNext">
                  <img src="/src/assets/img/icons/down.svg" alt="down" />
                </button>
              </div>
            </div>
          </div>
          <!-- ИНФОРМАЦИЯ (Правая часть) -->
          <aside class="info-side">
            <div class="info-scroll-area">
              <div class="video-header-info">
                <h2 class="video-title">{{ video.fileName || 'Без названия' }}</h2>
                    <div class="video-stats-row">
                        <span>{{ video.likesCount || '0' }} лайков</span>
                        <span class="dot">.</span>
                        <span>{{ video.viewsCount || '0' }} просмотров</span>
                        <span class="dot">.</span>
                        <span>{{ formatDate(video.publishedAt) }}</span>
                    </div>
               </div>
              <!-- Автор -->
              <div class="author-card">
                <div class="author-main">
                    <img :src="video.author.avatar" class="author-ava" />
                    <div class="author-details">
                    <p class="name">{{ video.author.name }}</p>
                    <div class="rating-badge">
                        <span class="rating-num">{{ video.author.rating }}</span>
                        <!-- Здесь можно вызвать твой метод рендеринга звезд -->
                        <span class="stars">★★★★★</span>
                        <button class="sub-btn-green">Подписаться</button>
                    </div>
                    </div>
                </div>
                <div class="author-meta">
                    <p class="response">Отвечает быстро</p>
                    <p class="deals-count">Кол-во сделок: {{ video.author.deals }}</p>
                </div>
              </div>
              <div v-if="video.product" class="product-card-shorts">
                <div class="p-flex">
                  <img :src="video.product.image" />
                  <div class="p-text">
                    <p class="p-name">{{ video.product.name }}</p>
                    <p class="p-price">{{ video.product.price }} ₽</p>
                    <p class="p-city">{{ video.product.city }}</p>
                  </div>
                </div>
                <button class="contact-btn">Написать</button>
              </div>
              <!-- КОММЕНТАРИИ -->
              <div class="comments-block">
                <p class="section-title">Комментарии</p>
                <div v-if="video.commentsDisabled" class="comments-locked">
                  <p>Комментарии не доступны</p>
                </div>
                <div v-else class="comments-list">
                  <div class="comment-item">
                    <img src="/src/assets/img/mask-avatar.png" />
                    <div class="c-body">
                      <p class="c-user">Иванов Иван</p>
                      <p class="c-text">Круто, хочу себе так же!</p>
                      <span class="c-reply">Ответить</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer-input">
               <input type="text" placeholder="Сообщение" :disabled="video.commentsDisabled" />
                <button class="send-btn">
                    <img src="/src/assets/img/icons/send-plane.svg" />
                </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
    <div
      v-if="isShareModalOpen"
      class="modal-overlay"
      @click.self="isShareModalOpen = false"
    >
      <div class="share-modal">
        <header class="modal-header">
          <h3>Поделиться</h3>
          <button class="close-modal" @click="isShareModalOpen = false">
            ✕
          </button>
        </header>

        <div class="social-icons">
          <a href="#" class="social-btn whatsapp"
            ><img src="/src/assets/img/icons/whatsapp.svg"
          /></a>
          <a href="#" class="social-btn telegram"
            ><img src="/src/assets/img/icons/telegram.svg"
          /></a>
          <a href="#" class="social-btn vk"
            ><img src="/src/assets/img/icons/vk.svg"
          /></a>
          <a href="#" class="social-btn_block download"
            ><img src="/src/assets/img/icons/download.svg"
          /></a>
        </div>

        <div class="link-section">
          <label>Ссылка на мини-видео</label>
          <div class="input-wrapper">
            <input type="text" :value="shareLink" readonly />
          </div>
          <button class="copy-btn" @click="copyToClipboard">
            Копировать ссылку
          </button>
        </div>
      </div>
</div></div></template>
<style scoped>
.shorts-page-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
}
.loader {
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.shorts-main-container {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}
.shorts-main-container::-webkit-scrollbar { display: none; }
.short-snap-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
}
.short-content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}
.video-side {
  flex: 1.4;
  position: relative;
  background: #000;
}
.video-side video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: #fff;
  border-left: 1px solid #eee;
}

.info-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* Стили заголовка и статистики */
.video-stats-row {
  display: flex;
  gap: 8px;
  color: #999;
  font-size: 13px;
  margin-top: 8px;
}
.dot { font-weight: bold; }

/* Кнопки действий на видео */
.video-actions {
  position: absolute;
  right: 1.5rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
}

/* Круглые кнопки из макета */
.action-btn {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background: #F9F9F9;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.like-icon { width: 1.563rem; height: 1.375rem; }
.action-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.action-btn img {
  width: 1.75rem;
  height: auto;
}
.arrow-btn img{
    width: 1.2rem;
}
.scroll-arrows {
  margin-top: 1rem;
  gap: 0.5rem;
}
.video-side {
  position: relative;
  flex: 1.2;
}
/* Видео часть */
.video-container {
  flex: 1.2;
  background: #000;
  position: relative;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Боковое меню на видео */
.video-side-menu {
  position: absolute;
  right: 15px;
  bottom: 50px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #fff;
  z-index: 10;
}

.icon-circle {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  backdrop-filter: blur(5px);
}

/* Правая панель */
.info-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
}

.scrollable-info {
  flex: 1;
  overflow-y: auto;
}

.product-block {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
  margin: 15px 0;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 40px;
  cursor: pointer;
  z-index: 10000;
}
/* Стили для заблокированных комментов */
.comments-disabled {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-style: italic;
}
.send-btn{
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.313rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-btn img {
  width: 1.5rem; 
}
.author-card {
  background: #f8f8f8;
  border-radius: 20px;
  padding: 16px;
  margin: 20px 0;
}
.author-main { display: flex; gap: 12px; align-items: center; }
.author-ava { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.sub-btn-green {
  background: #64a07a;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-left: 10px;
}

/* Футер с инпутом */
.footer-input {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
.footer-input input {
  flex: 1;
  background: #f1f1f1;
  border: none;
  padding: 12px 16px;
  border-radius: 20px;
  outline: none;
}
.send-btn { background: none; border: none; cursor: pointer; }

/* Модалка Share */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.share-modal {
  background: #fff;
  padding: 24px;
  border-radius: 24px;
  width: 400px;
}
</style>
