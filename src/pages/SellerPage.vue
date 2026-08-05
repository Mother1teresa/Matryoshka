<template>
  <Header />
  <section class="seller-page-section">
    <div class="container seller-page" v-if="seller && seller.id">
      <!-- Хлебные крошки -->
      <div class="breadcrumbs">
        <router-link to="/">Главная</router-link>
        <span> → {{ sellerName }}</span>
      </div>
      <!-- Карточка продавца -->
      <div class="seller-card-main">
        <div class="seller-header-flex">
          <div class="seller-info-left">
            <div class="logo-wrapper">
              <img :src="seller.avatar || '/img/users/mask-avatar.png'" class="seller-logo"/>
            </div>
            <div class="seller-text">
              <div class="seller-name-row">
                <h1>{{ sellerName }}</h1>
                <div class="seller-type">
                  {{ sellerType }}
                </div>
                <div class="rating-block" v-if="seller.rating !== undefined">
                  <div class="rating">{{ seller.rating }} <span class="stars">
                    <img
                      v-for="n in 5"
                      :key="n"
                      :src="n <= Math.round(seller.rating || 0) ? '/img/users/star.png' : '/img/users/star_1.png'"
                      class="star-icon"
                      alt="★"
                    />
                  </span></div>
                </div>
              </div>
              <div class="seller-desc">
                <div class="desc-container">
                  <span :class="{ 'is-collapsed': !isDescExpanded }" class="desc-text">
                    <a v-if="seller.website" :href="seller.website" target="_blank">{{ seller.website }}</a>
                    {{ sellerDescription }}
                  </span>
                  <button class="btn-more" @click="isDescExpanded = !isDescExpanded">
                    {{ isDescExpanded ? "Скрыть" : "Ещё" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="seller-info-right">
            <div class="experience">{{ membershipText }}</div>
          </div>
        </div>
      </div>
      <!-- Табы -->
      <div class="seller-tabs">
        <button :class="{ active: currentTab === 'announcements' }" @click="currentTab = 'announcements'">
          Объявления
        </button>
        <button :class="{ active: currentTab === 'video' }" @click="currentTab = 'video'">
          Видео
        </button>
        <button :class="{ active: currentTab === 'reviews' }" @click="currentTab = 'reviews'">
          Отзывы
        </button>
      </div>
      <!-- Контент -->
      <div class="seller-content">
        <!-- Объявления -->
        <div v-if="currentTab === 'announcements'" class="products-grid-wrapper">
          <div v-if="sellerProducts.length" class="products">
            <ProductCard v-for="product in sellerProducts" :key="product.id" :product="product"/>
          </div>
          <div v-else class="no-reviews">
            <p>У продавца пока нет объявлений</p>
          </div>
        </div>
        
        <!-- Видео -->
        <div v-if="currentTab === 'video'" class="video-grid">
          <div v-if="!auth.isAuthenticated" class="auth-overlay">
            <div class="auth-content">
              <p class="auth-title">Для просмотра мини-видео необходимо авторизоваться</p>
              <button class="auth-btn register" @click="openRegister">Зарегистрироваться</button>
              <p class="auth-text">
                Если у вас есть аккаунт, то <br>
                <a href="#" @click.prevent="openLogin" class="auth-link">войдите</a>
              </p>
            </div>
          </div>
          <template v-else>
            <div v-if="sellerVideos.length" class="video-grid_block">
              <div v-for="video in sellerVideos" :key="video.id" class="video-card">
                <div class="video-preview" @click="playVideo(video)">
                  <video
                    v-if="video.cdnUrl"
                    :src="video.cdnUrl"
                    :poster="video.thumbnailUrl"
                    class="video-thumb"
                    preload="metadata"
                    muted
                    playsinline
                  ></video>
                  <div v-else class="video-placeholder">
                    <span>Видео недоступно</span>
                  </div>
                  <div class="video-play-icon">▶</div>
                  <!-- Длительность -->
                  <div class="video-overlay">
                    <span class="duration">{{ video.duration || "0:11" }}</span>
                  </div>
                </div>
                <div class="video-info">
                  <div class="video-title">{{ video.description }}</div>
                  <!-- Статистика -->
                  <div class="stats-line">
                    <div class="stat">
                      <img src="/src/assets/img/icons/eye.svg" />
                      {{ video.viewsCount || video.views || "" }}
                    </div>
                    <div class="stat">
                      <img src="/src/assets/img/icons/heart.svg" />
                      {{ video.likes || video.likesCount || "" }}
                    </div>
                    <div class="stat">
                      <img src="/src/assets/img/icons/comment.svg" />
                      {{ video.commentsCount || "" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-reviews">
              <p>У продавца пока нет видео</p>
            </div>
          </template>
        </div>
        
        <!-- Отзывы -->
        <div v-if="currentTab === 'reviews'" class="reviews-container">
          <div v-if="isReviewsLoading" class="block__loading">
            Загрузка отзывов...
          </div>
          <template v-else-if="sellerReviews.length">
            <div v-for="review in sellerReviews" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="user-info">
                  <img :src="review.userAvatar || '/img/users/mask-avatar.png'" class="user-avatar" />
                  <div class="user-details">
                    <div class="user-name">{{ review.author }}</div>
                    <div class="review-product">{{ review.productTitle }}</div>
                    <div class="review-body">
                      {{ review.text }}
                    </div>
                  </div>
                </div>
                <div class="review-meta">
                  <div class="deal-status">Сделка состоялась</div>
                  <div class="stars-row">
                    <img
                      v-for="n in 5"
                      :key="n"
                      :src="n <= Math.round(review.rating) ? '/img/users/star.png' : '/img/users/star_1.png'"
                      class="star-icon"
                      alt="★"
                    />
                  </div>
                  <div class="review-date">{{ formatDate(review.date) }}</div>
                </div>
              </div>
              <!-- Ответ продавца -->
              <div v-if="review.reply" class="seller-reply">
                <img :src="seller?.avatar || '/img/users/mask-avatar.png'" class="reply-avatar" />
                <div class="reply-content">
                  <div class="reply-label">Ответ продавца</div>
                  <div class="reply-text">{{ review.reply }}</div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="no-reviews">
            У этого продавца пока нет отзывов.
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="block__loading">Загрузка...</div>
    <div v-else class="block__loading">Продавец не найден</div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { notify } from "/src/utils/notify";
import { formatDate } from "/src/utils/formatters.js"

import Header from '../components/layout/Header.vue';
import ProductCard from "/src/components/product/ProductCard.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const modal = useModalStore();
const reviewStore = useReviewStore();

const currentTab = ref("announcements");
const isDescExpanded = ref(false);
const isLoading = ref(false);
const isReviewsLoading = ref(false);

const seller = ref(null);
const sellerProducts = ref([]);
const sellerVideos = ref([]);

const sellerName = computed(() => {
  return seller.value?.name || seller.value?.username || seller.value?.companyName || 'Продавец';
});

const sellerType = computed(() => {
  return seller.value?.type === "company" ? "Компания" : "Частное лицо";
});

const sellerDescription = computed(() => {
  return seller.value?.description || "Переходите на наш профиль, чтобы увидеть все актуальные предложения.";
});

const sellerReviews = computed(() => reviewStore.reviews);

const membershipText = computed(() => {
  if (!seller.value?.createdAt) return 'На Матрёшке недавно';
  
  const created = new Date(seller.value.createdAt);
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  
  // Меньше месяца — показываем дату
  if (months < 1) {
    return `На Матрёшке с ${created.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  
  const plural = (n, [one, two, five]) => {
    const l2 = n % 100, l = n % 10;
    return (l2 > 10 && l2 < 20) ? five : l === 1 ? one : (l > 1 && l < 5) ? two : five;
  };
  
  if (months < 12) return `На Матрёшке ${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`;
  
  const years = Math.floor(months / 12);
  return `На Матрёшке ${years} ${plural(years, ['год', 'года', 'лет'])}`;
});

// === ЗАГРУЗКА ДАННЫХ ===
const loadSellerData = async (sellerId) => {
  if (!sellerId) {
    seller.value = null;
    return;
  }
  
  isLoading.value = true;
  seller.value = null;
  sellerProducts.value = [];
  sellerVideos.value = [];
  reviewStore.reviews = [];

  try {
    // 1. Загружаем профиль продавца
    const profile = await auth.fetchProfileById(sellerId);
    
    if (!profile) {
      seller.value = null;
      return;
    }
    
    seller.value = profile;

    // 2. Загружаем товары и видео параллельно
    await Promise.all([
      loadSellerProducts(sellerId),
      loadSellerVideos(sellerId),
    ]);

  } catch (err) {
    console.error("Ошибка загрузки данных продавца:", err);
    seller.value = null;
  } finally {
    isLoading.value = false;
  }
};

const loadSellerProducts = async (sellerId) => {
  try {
    const products = await auth.fetchAdvertsBySeller(sellerId);
    sellerProducts.value = products.map(ad => {
      const pics = Array.isArray(ad.pictureUrls) 
        ? ad.pictureUrls 
        : ad.pictureUrls 
          ? [ad.pictureUrls] 
          : []

      return {
        id: ad.id,
        title: ad.title,
        price: Number(ad.price) || 0,
        images: pics,
        image: pics[0] || '/src/assets/img/placeholder.png',
        city: ad.address || ad.city || '',
        category: ad.category,
        section: ad.section || ad.subCategory || 'default',
        subcategory: ad.subCategory || ad.subcategory || '',
        sellerId: ad.userId || ad.sellerId,
        attributes: ad.attributes || {},
        description: ad.description || '',
        createdAt: ad.createdAt,
      };
    });
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
    sellerProducts.value = [];
  }
};

const loadSellerVideos = async (sellerId) => {
  try {
    const videos = await auth.fetchUserMediaVideos(sellerId);
    sellerVideos.value = videos.map(v => ({
      ...v,
      author: {
        id: seller.value?.id,
        name: seller.value?.name || 'Пользователь',
        avatar: seller.value?.avatar || '/img/users/mask-avatar.png'
      }
    }));
  } catch (err) {
    console.error("Ошибка загрузки видео:", err);
    sellerVideos.value = [];
  }
};

const loadReviews = async (sellerId) => {
  isReviewsLoading.value = true;
  try {
    await reviewStore.fetchReviewsBySeller(sellerId);
  } catch (err) {
    console.error("Ошибка загрузки отзывов:", err);
  } finally {
    isReviewsLoading.value = false;
  }
};

// === WATCH ===
watch(() => route.params.id, (newId) => {
  if (newId) {
    currentTab.value = "announcements";
    loadSellerData(newId);
  }
}, { immediate: true });

watch(currentTab, (newTab) => {
  if (newTab === 'reviews' && route.params.id) {
    loadReviews(route.params.id);
  }
});

watch(() => seller.value?.name, (newName) => {
  if (newName) {
    document.title = `${newName} — продавец на Матрешка`;
  }
}, { immediate: true });

onUnmounted(() => {
  document.title = 'Матрешка';
  reviewStore.reviews = [];
});

// === ACTIONS ===
const openLogin = () => modal.openLogin();
const openRegister = () => modal.openRegister();
const playVideo = (video) => {
  router.push({ name: 'shorts', params: { id: video.id } });
};
</script>
<style scoped>
.seller-page-section { margin-bottom: 3.188rem;}
.reviews-container { display: flex; flex-direction: column; gap: 1rem;}
.review-card { background: white; border-radius: 1.25rem; padding: 1.5rem 1.5rem .8rem 1.5rem;}
.review-header { display: flex; justify-content: space-between; align-items: flex-start;}
/* Стили ответа продавца */
.reply-content { margin-top: .3rem;}
.reply-text { font-size: 1rem;}
.seller-tabs { display: flex; gap: 0rem; border-radius: 0.625rem; margin-bottom: 3.25rem; background: var(--bg-defort); width: fit-content; padding: 0.125rem 0.25rem; }
.desc-container { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 4px; }
.desc-text { display: block; max-width: 100%; font-size: 1.25rem; color: #858685; }
.seller-desc { width: 42.313rem; margin-top: 1.375rem;}
.desc-text.is-collapsed { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 25rem; }
.btn-more { color: var(--btn-bg); background: none; border: none; cursor: pointer; font-weight: 400; padding: 0; font-size: 1.25rem; }
.products { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.938rem; padding-left: -1rem; padding-right: -1rem; }
.seller-tabs button { padding: 1rem 3.188rem; background: none; border: none; font-size: 1.25rem; font-weight: 700; color: #858685; cursor: pointer; position: relative; background: var(--bg-defort); border-radius: 0.625rem; }
.seller-tabs button.active { color: var(--bg-defort); background: var(--btn-bg); }
.seller-logo { width: 7.625rem; height: 7.625rem; border-radius: 50%; object-fit: cover; }
.seller-header-flex { display: flex; justify-content: space-between; }
.seller-info-left { display: flex; gap: 1.625rem; }
.btn-subscribe-text { color: var(--btn-bg); background: none; border: none; cursor: pointer; font-size: 1.5rem; }
.btn-subscribe-text.is-active { color: #808080; }
.stats-line {display: flex; justify-content: space-between;gap: 0.938rem;}
.stat {display: flex; align-items: center; gap: 0.4rem;font-size: 0.875rem; color: #333}
.stat img { width: 1.688rem; }
.video-grid_block{display: grid; grid-template-columns: repeat(5, 15.813rem); gap: 0.938rem; padding-left: -1rem; padding-right: -1rem; border-radius: 0 0 1.25rem 1.25rem; }
.video-preview { height: 20.125rem;width: 100%; aspect-ratio: 9 / 16; position: relative; border-radius: 1rem; overflow: hidden; height: 20.125rem;}
.video-preview img { width: 100%; height: 100%; }
.video-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #888; font-size: 0.9rem;}
.video-play-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; opacity: 0.85; pointer-events: none; text-shadow: 0 2px 8px rgba(0,0,0,0.4);}
.video-preview .video-thumb{ width: 100%; height: 100%; object-fit: cover; border-radius: 0.938rem;}
.video-card { width: 100%; height: 28rem; background: white; border-radius: 1.25rem; padding: 0.625rem 0.625rem 0.938rem 0.625rem;}
.video-title { font-size: 1rem; font-weight: 700; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; transition: all 0.3s; border-radius: 0; height: 3.6rem; text-align: justify; display: inline-block;text-transform: lowercase;}
.video-title::first-letter {text-transform: uppercase;}
.duration{bottom: 0; right: 0;}
.video-info{margin-top: 0.938rem;}
.video-date { color: #7c7c7c; font-size: 0.875rem;}
.seller-card-main { background-color: white; margin-bottom: 1.25rem; padding: 1.438rem; border-radius: 1.25rem; position: relative;}
.seller-info-right { text-align: end; }
.experience { font-size: 1rem; position: absolute; bottom: 1.25rem; right: 1.25rem; color: #858685;}
.seller-name-row h1 { margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 700;display: inline-block;text-transform: lowercase;}
.seller-name-row h1::first-letter {text-transform: uppercase;}
.seller-type { margin-bottom: 0.938rem; font-size: 1.25rem; font-weight: 700;}
.rating-block { margin-bottom: 0.563rem; }
.rating { font-size: 1.25rem; font-weight: 700; display: flex; gap: 0.563rem;color: #262626;line-height: 1;height: 1rem;align-items: stretch;}
.stars {display: flex;gap: 0.125rem;align-items: center;}
.star-icon {width: 1.5rem;height: 1.5rem;}
.stars-row {display: flex;gap: 0.125rem;}

@media (max-width: 77rem) { .products,.video-grid_block { display: grid; grid-template-columns: repeat(5, 12.2rem); gap: 1rem; background: #ececec;}}
</style>