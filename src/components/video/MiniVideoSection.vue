<template>
  <section class="mini-video">
    <div class="container">
      <!-- НЕАВТОРИЗОВАННЫЙ -->
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
      <!-- АВТОРИЗОВАННЫЙ -->
      <template v-else>
        <div class="mini-video-section">
          <router-link v-for="video in videos.slice(0, 6)" :key="video.id" :to="{ name: 'shorts', params: { id: video.id } }" class="mini-video-link">
            <!-- Готовое превью -->
            <img
              v-if="thumbnailCache.has(video.id)"
              :src="thumbnailCache.get(video.id)"
              class="thumbnail mini-video_img"
              alt="Превью"
            />
            <div v-else class="mini-video_img skeleton"></div>
          </router-link>
        </div>
        <div v-if="isLoading && videos.length === 0" class="mini-video-section">
          <div v-for="i in 6" :key="i" class="mini-video_img skeleton"></div>
        </div>
        <div v-else-if="videos.length === 0" class="mini-video-section empty">
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
import { computed, onMounted, watch, ref, onUnmounted } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";

const authStore = useAuthStore();
const modalStore = useModalStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const videos = computed(() => authStore.welcomeFeed || []);
const isLoading = computed(() => authStore.isVideosLoading);

const thumbnailCache = ref(new Map());
const processedVideos = ref(new Set());

const openLogin = () => modalStore.openLogin();
const openRegister = () => modalStore.openRegister();

const loadVideos = async () => {
  if (isAuthenticated.value && videos.value.length === 0) {
    await authStore.fetchWelcomeFeed({ page: 0, size: 10, seed: Math.random() });
    
    // Обогатить первые видео данными автора
    const enrichPromises = videos.value.slice(0, 6).map(v => 
      authStore.enrichVideo(v.id).catch(() => {})
    );
    await Promise.all(enrichPromises);
  }
};

const generateThumbnail = (video) => {
  return new Promise((resolve) => {
    if (!video.cdnUrl || processedVideos.value.has(video.id)) {
      resolve();
      return;
    }
    processedVideos.value.add(video.id);

    const videoEl = document.createElement('video');
    videoEl.src = video.cdnUrl + '#t=0.1';
    videoEl.crossOrigin = 'anonymous';
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = 'auto';

    let resolved = false;
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      videoEl.pause();
      videoEl.src = '';
      videoEl.load();
    };

    const onFrame = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 187;
        canvas.height = 247;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, 187, 247);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            thumbnailCache.value.set(video.id, url);
            thumbnailCache.value = new Map(thumbnailCache.value);
          }
          cleanup();
          resolve();
        }, 'image/jpeg', 0.5);
        
      } catch (e) {
        console.error('Ошибка захвата:', e);
        cleanup();
        resolve();
      }
    };

    videoEl.addEventListener('seeked', onFrame, { once: true });
    videoEl.addEventListener('error', () => { cleanup(); resolve(); }, { once: true });
    setTimeout(() => { cleanup(); resolve(); }, 5000);
  });
};
const generateThumbnails = async (videoList) => {
  if (!videoList.length) return;
  const batchSize = 3;
  for (let i = 0; i < videoList.length; i += batchSize) {
    const batch = videoList.slice(i, i + batchSize);
    await Promise.all(batch.map(v => generateThumbnail(v)));
  }
};

const onThumbnailError = () => {
  // Просто оставляем скелетон
};

onMounted(() => {
  loadVideos();
});
watch(isAuthenticated, (newValue, oldValue) => {
  if (newValue && !oldValue) loadVideos();
});
watch(videos, (newVideos) => {
  if (newVideos.length > 0) {
    processedVideos.value.clear();
    generateThumbnails(newVideos.slice(0, 6));
  }
}, { immediate: true });

onUnmounted(() => {
  thumbnailCache.value.forEach(url => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  });
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

/* ===== ПЛАШКА ЗАГРУЗКИ ===== */
.thumbnails-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 5;
  gap: 1rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #64a07a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.thumbnails-loading p {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== VIDEO SECTION ===== */
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