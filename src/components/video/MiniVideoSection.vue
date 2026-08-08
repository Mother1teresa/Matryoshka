<template>
  <section class="mini-video">
    <div class="container">
      <!-- Сетка видео — видна всегда, но размыта для гостей -->
      <div class="mini-video-section" :class="{ 'is-blurred': !isAuthenticated }">
        <!-- Гость: статичные фотографии -->
        <template v-if="!isAuthenticated">
          <div
            v-for="(img, index) in staticImages"
            :key="index"
            class="mini-video-link static"
          >
            <img
              :src="img"
              class="mini-video_img"
              alt="Превью"
              @error="$event.target.style.display='none'"
            />
          </div>
        </template>

        <!-- Авторизованный: кликабельные карточки с видео-превью -->
        <template v-else>
          <router-link
            v-for="video in videos.slice(0, 8)"
            :key="video.id"
            :to="{ name: 'shorts', params: { id: video.id } }"
            class="mini-video-link"
          >
            <img
              v-if="thumbnailCache.has(video.id)"
              :src="thumbnailCache.get(video.id)"
              class="thumbnail mini-video_img"
              alt="Превью"
            />
            <div v-else class="mini-video_img skeleton"></div>
          </router-link>
        </template>

        <!-- Скелетоны / пустое состояние (только для авторизованных) -->
        <template v-if="isAuthenticated">
          <div v-if="isLoading && videos.length === 0" class="mini-video-section">
            <div v-for="i in 6" :key="i" class="mini-video_img skeleton"></div>
          </div>
          <div v-else-if="videos.length === 0" class="mini-video-section empty">
            <p>Видео пока нет</p>
          </div>
        </template>
      </div>

      <!-- Оверлей авторизации -->
      <div v-if="!isAuthenticated" class="auth-overlay">
        <div class="auth-content">
          <p class="auth-title">Для просмотра мини-видео необходимо авторизоваться</p>
          <button class="auth-btn" @click.prevent="openLogin">Войти</button>
        </div>
      </div>

      <!-- Ссылка на раздел (только авторизованным) -->
      <div v-if="isAuthenticated" class="block-link">
        <router-link :to="{ name: 'shorts' }">
          Мини-видео
          <img src="/src/assets/img/video/arrow.svg" alt="arrow" />
        </router-link>
      </div>
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

// ===== СТАТИЧНЫЕ ФОТОГРАФИИ ДЛЯ ГОСТЕЙ =====
// Замените пути на свои изображения
const staticImages = ref([
  "/img/video/preview-1.jpg",
  "/img/video/preview-2.jpg",
  "/img/video/preview-3.jpg",
  "/img/video/preview-4.jpg",
  "/img/video/preview-1.jpgg",
  "/img/video/preview-2.jpg",
  "/img/video/preview-3.jpg",
  "/img/video/preview-4.jpg",
  "/img/video/preview-1.jpg",
  "/img/video/preview-2.jpg",
  "/img/video/preview-3.jpg",
  "/img/video/preview-4.jpg",
]);

const openLogin = () => modalStore.openLogin();

const loadVideos = async () => {
  if (videos.value.length === 0) {
    await authStore.fetchWelcomeFeed({ page: 0, size: 10, seed: Math.random() });

    const enrichPromises = videos.value.slice(0, 6).map((v) =>
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

    const videoEl = document.createElement("video");
    videoEl.src = video.cdnUrl + "#t=0.1";
    videoEl.crossOrigin = "anonymous";
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.preload = "auto";

    let resolved = false;
    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      videoEl.pause();
      videoEl.src = "";
      videoEl.load();
    };

    const onFrame = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 187;
        canvas.height = 247;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, 187, 247);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              thumbnailCache.value.set(video.id, url);
              thumbnailCache.value = new Map(thumbnailCache.value);
            }
            cleanup();
            resolve();
          },
          "image/jpeg",
          0.5
        );
      } catch (e) {
        console.error("Ошибка захвата:", e);
        cleanup();
        resolve();
      }
    };

    videoEl.addEventListener("seeked", onFrame, { once: true });
    videoEl.addEventListener("error", () => {
      cleanup();
      resolve();
    }, { once: true });
    setTimeout(() => {
      cleanup();
      resolve();
    }, 5000);
  });
};

const generateThumbnails = async (videoList) => {
  if (!videoList.length) return;
  const batchSize = 3;
  for (let i = 0; i < videoList.length; i += batchSize) {
    const batch = videoList.slice(i, i + batchSize);
    await Promise.all(batch.map((v) => generateThumbnail(v)));
  }
};

onMounted(() => {
  loadVideos();
});

watch(isAuthenticated, (newValue, oldValue) => {
  if (newValue && !oldValue) loadVideos();
});

watch(
  videos,
  (newVideos) => {
    if (newVideos.length > 0) {
      processedVideos.value.clear();
      generateThumbnails(newVideos.slice(0, 6));
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  thumbnailCache.value.forEach((url) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  });
});
</script>

<style scoped>
.mini-video {
  overflow: hidden;
  background-color: white;
  padding: 1rem 0;
  height: 17.438rem;
}

.container {
  width: 86.5rem;
  margin: 0 auto;
  transition: width 0.8s;
  position: relative;
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
  height: 15.438rem;
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

.mini-video-link:hover .mini-video_img {
  transform: scale(1.03);
}

/* Статичные превью (гость) — без hover-эффекта */
.mini-video-link.static:hover .mini-video_img {
  transform: none;
}
.mini-video_img {
  width: 11.688rem;
  height: 15.438rem;
  border-radius: 0.625rem;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.mini-video-section.is-blurred {
  opacity: 0.25;
  pointer-events: none;
  user-select: none;
}
.auth-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  border-radius: 0.625rem;
}
.auth-content {
  background: #ffffff;
  padding: 1.875rem;
  border-radius: 2.125rem;
  text-align: center;
  max-width: 26.438rem;
  width: 100%;
  animation: fadeInUp 0.4s ease-out;
  box-shadow: 0px 4px 4px 0px #00000040;
}
.auth-title {
  font-size: 1rem;
  color: #232323;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}
.auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 2.938rem;
  background: var(--btn-bg);
  color: #ffffff;
  border: none;
  border-radius: 0.625rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
}
.auth-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.auth-btn:active {
  transform: translateY(0);
}
.block-link {
  z-index: 5;
  width: 24.875rem;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(270deg, #ffffff 54.11%, rgba(255, 255, 255, 0) 100%);
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
  background-color: var(--btn-bg);
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

/* ===== SKELETON ===== */
.skeleton {
  background: #eee;
  animation: pulse 1.5s infinite;
}
.mini-video .container {
  width: 100%;
  margin: 0;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 77rem) {
  .block-link {
    width: 30%;
  }
  .block-link a {
    left: 10%;
  }
}
</style>