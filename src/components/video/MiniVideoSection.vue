<template>
  <section class="mini-video">
    <div class="container">
      <!-- НЕАВТОРИЗОВАННЫЙ ПОЛЬЗОВАТЕЛЬ — показываем заглушку -->
      <div v-if="!isAuthenticated" class="auth-overlay">
        <div class="auth-content">
          <p class="auth-title">Для просмотра мини-видео необходимо авторизоваться</p>
          <button class="auth-btn register" @click="openRegister">Зарегистрироваться</button>
          <p class="auth-text">
            Если у вас есть аккаунт, то <br><a href="#" @click.prevent="openLogin" class="auth-link">войдите</a>
          </p>
          <img src="/src/assets/img/arr-select.svg" alt="" class="auth-mini_arr">
          <p class="auth-hint">(как ссылка)</p>
        </div>
      </div>

      <!-- АВТОРИЗОВАННЫЙ ПОЛЬЗОВАТЕЛЬ — показываем видео -->
      <template v-else>
        <div v-if="videos.length" class="mini-video-section">
          <router-link
            v-for="video in videos.slice(0, 10)"
            :key="video.id"
            :to="{ name: 'shorts', params: { id: video.id } }"
            class="mini-video-link"
          >
            <video
              v-if="video.cdnUrl"
              :src="video.cdnUrl"
              class="thumbnail mini-video_img"
              preload="metadata"
              muted
              playsinline
            ></video>
            
            <img
              v-else-if="video.thumbnail || video.posterUrl"
              :src="video.thumbnail || video.posterUrl"
              class="thumbnail mini-video_img"
              alt="Превью"
            />
          </router-link>
        </div>
        <div v-else-if="isLoading" class="mini-video-section">
          <div v-for="i in 6" :key="i" class="mini-video_img skeleton"></div>
        </div>
        
        <div v-else class="mini-video-section empty">
          <p>Видео пока нет</p>
        </div>
        <div class="block-link">
          <router-link :to="{ name: 'shorts' }">
            Мини-видео
            <img src="/src/assets/img/video/arrow.svg" alt="arrow" />
          </router-link>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";

const authStore = useAuthStore();
const modalStore = useModalStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const videos = computed(() => authStore.welcomeFeed || []);
const isLoading = computed(() => authStore.isVideosLoading);

const openLogin = () => {
  modalStore.openLogin();
};

const openRegister = () => {
  modalStore.openRegister();
};

// Функция загрузки видео
const loadVideos = async () => {
  if (isAuthenticated.value && videos.value.length === 0) {
    await authStore.fetchWelcomeFeed({ 
      page: 0, 
      size: 10, 
      seed: 0.5 
    });
  }
};

// Загружаем при монтировании
onMounted(() => {
  loadVideos();
});

// Загружаем видео сразу после входа
watch(isAuthenticated, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    loadVideos();
  }
});
</script>

<style scoped>
.mini-video {
  overflow: hidden;
  background-color: white;
  padding: 2rem 0;
}

.container {
  width: 86.5rem;
  margin: 0 auto;
  transition: width 0.8s;
  position: relative;
}

/* ===== AUTH OVERLAY (как на скриншоте) ===== */
.auth-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 15.438rem; /* Такая же высота как у видео */
  background: #fff;
}

.auth-content {
  text-align: center;
  max-width: 28.625rem;
  padding: 2.513rem 0;
  display: grid;
  justify-items: center;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.688rem;
}

.auth-btn {
  display: inline-block;
  padding: 0.875rem 0.938rem;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.auth-btn.register {
  background-color: #64a07a;
  color: white;
  margin-bottom: 0.688rem;
}

.auth-btn.register:hover {
  background-color: #558a68;
}

.auth-text {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.auth-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-hint {
  font-size: 0.625rem;
  margin-top: 0.25rem;
}
.auth-mini_arr{
  width: 0.753rem;
  text-align: center;
  transform: rotate(180deg);
}
/* ===== VIDEO SECTION (без изменений) ===== */
.mini-video-section {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.938rem;
  scrollbar-width: none; 
  padding-right: 25rem; 
}

.mini-video-section::-webkit-scrollbar {
  display: none;
}

.mini-video-link {
  flex-shrink: 0;
  transition: transform 0.3s;
  border-radius: 0.625rem;
  overflow: hidden;
}

.mini-video-link:hover .mini-video_img{
  transform: scale(1.03)
}

.mini-video_img {
  width: 11.688rem;
  height: 15.438rem;
  border-radius: 0.625rem;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.block-link {
  z-index: 5;
  width: 24.875rem;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(
    270deg,
    #ffffff 54.11%,
    rgba(255, 255, 255, 0) 100%
  );
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}

.block-link a {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.3rem;
  color: white;
  background-color: #64a07a; 
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 0.625rem;
  width: 13.25rem;
  text-decoration: none;
  font-weight: 500;
  margin-right: 1.5rem;
  position: absolute;
  top: 0;
}

.block-link a img {
  width: 1.125rem;
  transition: transform 0.3s;
}

.block-link a:hover img {
  transform: translateX(5px);
}

.skeleton {
  background: #eee;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 77rem) {
  .block-link {
    width: 30%;
  }
  .block-link a{
    left: 10%;
  }
}
</style>