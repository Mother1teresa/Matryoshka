<template>
  <section class="mini-video">
    <div class="container">
      <div v-if="videos.length" class="mini-video-section">
        <!-- Цикл по видео из стора -->
        <router-link
          v-for="video in videos.slice(0, 10)"
          :key="video.id"
          :to="{ name: 'shorts', params: { id: video.id } }"
          class="mini-video-link"
        >
          <video 
            v-if="video.thumbnail && video.thumbnail.endsWith('.mp4')" 
            :src="video.thumbnail" 
            class="thumbnail mini-video_img" 
            preload="metadata"
            muted
            playsinline
          ></video>
          <img 
            v-else 
            :src="video.thumbnail" 
            class="thumbnail mini-video_img" 
            alt="Превью" 
          />
        </router-link>
      </div>

      <!-- Если видео еще грузятся или их нет -->
      <div v-else-if="isLoading" class="mini-video-section">
        <div v-for="i in 6" :key="i" class="mini-video_img skeleton"></div>
      </div>

      <!-- Правая плашка с кнопкой -->
      <div class="block-link">
        <router-link :to="{ name: 'shorts' }">
          Мини-видео
          <img src="/src/assets/img/video/arrow.svg" alt="arrow" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";

const authStore = useAuthStore();

// Берем видео из стора
const videos = computed(() => authStore.allVideos);
const isLoading = computed(() => authStore.isVideosLoading);

onMounted(async () => {
  // Загружаем, если еще не загружены
  if (videos.value.length === 0) {
    await authStore.fetchVideos();
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
