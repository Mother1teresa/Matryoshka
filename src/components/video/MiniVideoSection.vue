<template>
  <section class="mini-video">
    <div class="container">
      <div v-if="videos.length" class="mini-video-section">
        <!-- Цикл по видео из стора -->
        <router-link 
          v-for="video in videos.slice(0, 10)" 
          :key="video.id" 
          :to="{ name: 'shorts', params: { id: video.id }}"
          class="mini-video-link"
        >
          <img
            :src="video.thumbnail || '/src/assets/img/video/fs.jpg'"
            alt="video thumbnail"
            class="mini-video_img"
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
import { computed, onMounted } from 'vue';
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
  transition: width .8s;
  position: relative;
}

.mini-video-section {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto; /* Позволяет скроллить ленту */
  gap: 0.938rem;
  scrollbar-width: none; /* Скрываем скроллбар */
  padding-right: 25rem; /* Место, чтобы видео не уходили под кнопку */
}

.mini-video-section::-webkit-scrollbar {
  display: none;
}

.mini-video-link {
  flex-shrink: 0; /* Чтобы картинки не сжимались */
  transition: transform 0.3s ease;
}

.mini-video-link:hover {
  transform: translateY(-5px);
}

.mini-video_img {
  width: 11.688rem;
  height: 15.438rem;
  border-radius: 0.625rem;
  object-fit: cover;
  display: block;
}

.block-link {
  z-index: 5;
  width: 24.875rem;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(270deg, #FFFFFF 54.11%, rgba(255, 255, 255, 0) 100%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none; /* Чтобы можно было кликать на видео под плашкой */
}

.block-link a {
  pointer-events: auto; /* А на саму кнопку кликать можно */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.3rem;
  color: white;
  background-color: #64a07a; /* Твой основной зеленый */
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 0.625rem;
  width: 13.25rem;
  text-decoration: none;
  font-weight: 500;
  margin-right: 1.5rem;
}

.block-link a img {
  width: 1.125rem;
  transition: transform 0.3s;
}

.block-link a:hover img {
  transform: translateX(5px);
}

/* Скелетон для загрузки */
.skeleton {
  background: #eee;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@media (max-width: 77rem) {
  .block-link {
    width: 30%;
  }
}
</style>
