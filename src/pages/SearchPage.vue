<template>
  <Header />
  <section class="search-page">
    <div class="container">
      <div class="search-page_content">
        <!-- Заголовок результатов -->
        <div v-if="lastQuery" class="results-title">
          <h1>Результаты по «{{ lastQuery }}»</h1>
          <span v-if="!loading">
            {{ totalResults }} {{ declensionResults(totalResults) }}
          </span>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Поиск...</p>
        </div>

        <!-- Нет результатов -->
        <div v-else-if="searched && !totalResults" class="empty">
          <p class="empty-title">Ничего не найдено</p>
          <p class="empty-text">По запросу «{{ lastQuery }}» ничего не найдено</p>
        </div>

        <!-- Результаты: Товары -->
        <div v-if="products.length" class="results-section">
          <h2 class="section-title">Товары и объявления</h2>
          <div class="products-grid">
            <div
              v-for="product in products"
              :key="'prod-' + product.id"
              class="product-card"
            >
              <router-link
                :to="{
                  name: 'Product',
                  params: {
                    type: product.category || 'tovary',
                    section: product.section || 'default',
                    id: product.id,
                  },
                }"
              >
                <img
                  :src="product.image"
                  alt=""
                  class="product-img"
                  @error="onImageError"
                />
              </router-link>
              <div class="product-card__content">
                <router-link
                  :to="{
                    name: 'Product',
                    params: {
                      type: product.category || 'tovary',
                      section: product.section || 'default',
                      id: product.id,
                    },
                  }"
                  class="title"
                >
                  {{ product.title }}
                </router-link>
                <div class="price">
                  {{ Number(product.price).toLocaleString('ru-RU') }} ₽
                </div>
                <div class="product-content__bottom">
                  <div class="city">{{ product.city }}</div>
                  <img
                    class="card-like"
                    :src="favStore.isFavorite(product.id) ? heartFilled : heart"
                    @click.stop="onLikeClick(product)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Результаты: Видео -->
        <div v-if="videos.length" class="results-section">
          <h2 class="section-title">Видео</h2>
          <div v-if="!auth.isAuthenticated" class="auth-overlay">
            <div class="auth-content">
              <p class="auth-title">Для просмотра мини-видео необходимо авторизоваться</p>
              <button class="auth-btn register" @click="modal.openRegister">Зарегистрироваться</button>
              <p class="auth-text">
                Если у вас есть аккаунт, то <br>
                <a href="#" @click.prevent="modal.openLogin" class="auth-link">войдите</a>
              </p>
            </div>
          </div>
          <div v-else class="videos-grid">
            <div v-for="video in videos" :key="'vid-' + video.id" class="video-card" @click="goToVideo(video.id)">
              <div class="video-thumb">
                <video :src="video.cdnUrl" preload="metadata" muted playsinline></video>
                <div class="play-overlay">
                  <svg width="2.5rem" height="2.5rem" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <p class="video-title">{{ video.description || 'Без названия' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { useFavoritesStore } from "/src/stores/favoritesStore";
import { useModalStore } from "/src/stores/modal.js";
import { useProductStore } from "/src/stores/product.js";
import { notify } from "../utils/notify";
import { api } from "/src/api/api.js";
import Header from "../components/layout/Header.vue";

import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const favStore = useFavoritesStore();
const modal = useModalStore();
const productStore = useProductStore();

const loading = ref(false);
const searched = ref(false);
const lastQuery = ref("");
const videos = ref([]);
const products = ref([]);

const totalResults = computed(() => products.value.length + videos.value.length);

const declensionResults = (n) => {
  n = Math.abs(n) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return 'результатов';
  if (n1 > 1 && n1 < 5) return 'результата';
  if (n1 === 1) return 'результат';
  return 'результатов';
};

const onImageError = (e) => {
  e.target.src = '/src/assets/img/placeholder.png';
};

const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};

const onLikeClick = (item) => {
  if (!item) return;
  checkAuthAndRun(() => {
    favStore.toggle(item.id);
    notify(
      favStore.isFavorite(item.id)
        ? "Добавлено в избранное"
        : "Удалено из избранного"
    );
  }, "Войдите, чтобы добавить в избранное");
};

// === ПОИСК ТОВАРОВ: API + ЛОКАЛЬНЫЕ ===
const searchProducts = async (q) => {
  const qLow = q.toLowerCase();
  let apiResults = [];
  let localResults = [];

  // 1. Поиск через API
  try {
    const res = await api.get('/advert', {
      params: {
        dto: JSON.stringify({ query: q, take: 50 })
      }
    });
    const ads = Array.isArray(res.data) ? res.data : res.data?.items || [];
    
    apiResults = ads.map((ad) => ({
      id: ad.id,
      title: ad.title || 'Без названия',
      price: Number(ad.price) || 0,
      city: ad.address || ad.city || '',
      category: ad.category || 'tovary',
      section: ad.section || ad.subCategory || 'default',
      image: '/src/assets/img/placeholder.png',
      source: 'api',
    }));
  } catch (e) {
    console.warn("API поиска товаров недоступен:", e);
  }

  // 2. Загружаем локальные товары если ещё нет
  if (productStore.products.length === 0) {
    try {
      await productStore.fetchAdverts();
    } catch (e) {
      console.warn("Не удалось загрузить товары:", e);
    }
  }

  // 3. Фильтруем локальные товары
  const localMatches = productStore.products.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const city = (p.city || "").toLowerCase();
    return title.includes(qLow) || desc.includes(qLow) || city.includes(qLow);
  });

  localResults = localMatches.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    city: p.city,
    category: p.category,
    section: p.section,
    image: p.image || p.images?.[0] || '/src/assets/img/placeholder.png',
    source: 'local',
  }));

  // 4. Мержим: API + локальные без дублей
  const apiIds = new Set(apiResults.map(r => String(r.id)));
  const merged = [
    ...apiResults,
    ...localResults.filter(l => !apiIds.has(String(l.id)))
  ];

  // 5. Если API вернул ID, но нет картинки — ищем картинку в локальных
  return merged.map(item => {
    if (item.source === 'api') {
      const localMatch = localResults.find(l => String(l.id) === String(item.id));
      if (localMatch && localMatch.image !== '/src/assets/img/placeholder.png') {
        return { ...item, image: localMatch.image };
      }
    }
    return item;
  });
};

// === ПОИСК ВИДЕО ===
const searchVideos = async (q) => {
  try {
    await auth.fetchWelcomeFeed({ page: 0, size: 50, seed: 0.5 });
    const all = auth.welcomeFeed || [];
    const qLow = q.toLowerCase();
    
    return all
      .filter((v) => {
        const d = (v.description || "").toLowerCase();
        const f = (v.fileName || "").toLowerCase();
        const a = (v.author?.name || v.author?.username || "").toLowerCase();
        return d.includes(qLow) || f.includes(qLow) || a.includes(qLow);
      })
      .map((v) => ({
        id: v.id,
        cdnUrl: v.cdnUrl || v.url || v.thumbnail,
        description: v.description || v.fileName || "Без названия",
      }));
  } catch (e) {
    console.error("Ошибка поиска видео:", e);
    return [];
  }
};

const doSearch = async (q) => {
  if (!q || !q.trim()) {
    videos.value = [];
    products.value = [];
    searched.value = false;
    lastQuery.value = "";
    return;
  }

  loading.value = true;
  searched.value = true;
  lastQuery.value = q.trim();
  videos.value = [];
  products.value = [];

  try {
    const [prodResults, vidResults] = await Promise.all([
      searchProducts(q.trim()),
      searchVideos(q.trim()),
    ]);

    products.value = prodResults;
    videos.value = vidResults;
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

.search-page_content {
  padding: 1.563rem 1.375rem;
  background: #ffffff;
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

/* Секции результатов */
.results-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
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

/* === СЕТКА ТОВАРОВ === */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12.938rem, 1fr));
  gap: 0.938rem;
}

.product-card {
  border: 1px solid transparent;
  width: 100%;
  min-height: 16.375rem;
  background-color: white;
  padding: 0.875rem 0.75rem 0.813rem 0.813rem;
  border-radius: 1.25rem;
  transition: all 0.3s;
}

.product-card:hover {
  border-color: var(--btn-bg);
}

.product-card .product-img {
  width: 100%;
  height: 9.125rem;
  object-fit: cover;
  border-radius: 0.625rem;
}

.product-card__content {
  margin-top: 0.5rem;
}

.title {
  height: 2rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  transition: all 0.3s;
  border-radius: 0;
  font-size: 0.8125rem;
  color: #333;
  text-decoration: none;
  line-height: 1.3;
}

.title:hover {
  color: var(--btn-bg);
}

.price {
  font-size: 0.875rem;
  font-weight: 800;
  margin-top: 0.475rem;
  color: #000;
}

.product-content__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.313rem;
}

.city {
  font-size: 0.8125rem;
  color: #888;
}

.card-like {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.card-like:hover {
  transform: scale(1.1);
}

/* === СЕТКА ВИДЕО === */
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
  padding: 0.625rem 1rem;
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
</style>