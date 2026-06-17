<template>
  <Header />
  <section class="search-page">
    <div class="container">
        <div class="search-page_content">
            <!-- Заголовок результатов -->
            <div v-if="lastQuery" class="results-title">
                <h1>Результаты по «{{ lastQuery }}»</h1>
                <span v-if="!loading">{{ videos.length }} {{ declension(videos.length) }}</span>
            </div>

            <!-- Загрузка -->
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <p>Поиск...</p>
            </div>

            <!-- Нет результатов -->
            <div v-else-if="searched && !videos.length" class="empty">
                <p class="empty-title">Ничего не найдено</p>
                <p class="empty-text">По запросу «{{ lastQuery }}» видео не найдены</p>
            </div>

            <!-- Сетка видео -->
            <div v-else-if="videos.length" class="videos-grid">
                <div
                v-for="video in videos"
                :key="video.id"
                class="video-card"
                @click="goToVideo(video.id)"
                >
                <div class="video-thumb">
                    <video
                    :src="video.cdnUrl"
                    preload="metadata"
                    muted
                    playsinline
                    ></video>
                    <div class="play-overlay">
                    <svg width="2.5rem" height="2.5rem" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    </div>
                </div>
                <p class="video-title">{{ video.description || 'Без названия' }}</p>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import Header from "../components/layout/Header.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(false);
const searched = ref(false);
const lastQuery = ref("");
const videos = ref([]);

const declension = (n) => {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return 'видео';
  if (n1 > 1 && n1 < 5) return 'видео';
  if (n1 === 1) return 'видео';
  return 'видео';
};

const doSearch = async (q) => {
  if (!q) {
    videos.value = [];
    searched.value = false;
    lastQuery.value = "";
    return;
  }

  loading.value = true;
  searched.value = true;
  lastQuery.value = q;
  videos.value = [];

  try {
    // Загружаем welcomeFeed — это видео ВСЕХ пользователей
    await auth.fetchWelcomeFeed({ page: 0, size: 50, seed: 0.5 });
    const all = auth.welcomeFeed || [];

    const qLow = q.toLowerCase();
    videos.value = all.filter((v) => {
      const d = (v.description || "").toLowerCase();
      const f = (v.fileName || "").toLowerCase();
      const a = (v.author?.name || v.author?.username || "").toLowerCase();
      return d.includes(qLow) || f.includes(qLow) || a.includes(qLow);
    }).map((v) => ({
      id: v.id,
      cdnUrl: v.cdnUrl || v.url || v.thumbnail,
      description: v.description || v.fileName || "Без названия",
      author: {
        name: v.author?.username || v.author?.name || "Пользователь",
        username: v.author?.username,
        avatar: v.author?.avatar || "/src/assets/img/mask-avatar.png",
      },
    }));
  } catch (e) {
    console.error("Ошибка поиска:", e);
  } finally {
    loading.value = false;
  }
};

const goToVideo = (id) => {
  router.push({ name: "shorts", params: { id } });
};

// Следим за изменением query в URL
watch(
  () => route.query.q,
  (newQ) => {
    doSearch(newQ);
  },
  { immediate: true }
);
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 3rem;
}

.container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1rem;
}
.search-page_content{
    padding: 1.563rem 1.375rem;
    background: #FFFFFF;
    border-radius: 0.625rem;
}
/* Заголовок */
.results-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.results-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.results-title span {
  font-size: 0.9375rem;
  color: #888;
}

/* Загрузка */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 0;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.1875rem solid #e0e0e0;
  border-top-color: #00a86b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Пусто */
.empty {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #888;
  font-size: 0.9375rem;
}

/* Сетка */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15.5rem, 1fr));
  gap: 0.8rem;
}

.video-card {
  background: #fff;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.06);
}

.video-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.12);
}

.video-thumb {
  position: relative;
  aspect-ratio: 9 / 12;
  background: #000;
  overflow: hidden;
  height: 22.813rem;
}

.video-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .play-overlay {
  opacity: 1;
}

.video-title {
  padding: 0.625rem 1rem 0.625rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #333;
}

.video-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem 1rem;
}

.video-author img {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.video-author span {
  font-size: 0.8125rem;
  color: #888;
}

/* Адаптив */
@media (max-width: 48rem) {
  .results-title {
    padding: 1rem 0;
  }

  .results-title h1 {
    font-size: 1.125rem;
  }

  .videos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

@media (max-width: 30rem) {
  .videos-grid {
    grid-template-columns: 1fr;
  }
}
</style>