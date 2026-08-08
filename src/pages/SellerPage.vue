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
                  <span ref="descRef" :class="{ 'is-collapsed': !isDescExpanded }" class="desc-text">
                    <a v-if="seller.website" :href="seller.website" target="_blank">{{ seller.website }}</a>
                    {{ sellerDescription }}
                  </span>
                  <button v-if="needsExpand" class="btn-more" @click="isDescExpanded = !isDescExpanded">
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
          <div v-if="sellerProducts.length" class="ads-list">
            <div v-for="ad in sellerProducts" :key="ad.id" class="ad-card-horizontal">
              <div class="ad-image-block">
                <router-link :to="productLink(ad)">
                  <img 
                    :src="ad.image" 
                    alt="product" 
                    @error="ad.image = '/src/assets/img/placeholder.png'"
                  />
                </router-link>
              </div>
              <div class="ad-main-info">
                <div class="ad-title-row">
                  <h3 class="ad-title">
                    <router-link :to="productLink(ad)" class="ad-title-link">
                      {{ ad.title }}
                    </router-link>
                  </h3>
                </div>
                <div class="ad-location"><img src="/src/assets/img/location_on.svg" />{{ ad.city }}</div>
                <p class="ad-description">{{ ad.description }}</p>
                <div class="ad-price">{{ ad.price.toLocaleString() }} ₽</div>
              </div>
              <div class="ad-stats-block">
                <div class="creat-akk">{{ "Опубликовано " + formatDate(ad.createdAt) }}</div>
              </div>
            </div>
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
                  <div class="user-info_block">
                    <img :src="review.userAvatar || '/img/users/mask-avatar.png'" class="user-avatar" />
                    <div class="stars-row">
                      <img
                        v-for="n in 5"
                        :key="n"
                        :src="n <= Math.round(review.rating) ? '/img/users/star.png' : '/img/users/star_1.png'"
                        class="star-icon"
                        alt="★"
                      />
                    </div>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ review.author }}</div>
                    <div class="review-product">{{ review.productTitle }}</div>
                    <div class="review-body">
                      {{ review.text }}
                    </div>
                  </div>
                </div>
                <div class="review-meta">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
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
const descRef = ref(null);
const needsExpand = ref(false);

const productLink = (ad) => ({
  name: 'Product',
  params: {
    type: ad.category || 'tovary',
    section: ad.section || 'default',
    id: ad.id
  }
});
const checkOverflow = () => {
  nextTick(() => {
    const el = descRef.value;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 0;
    const maxHeight = lineHeight * 3;
    needsExpand.value = el.scrollHeight > maxHeight + 1;
  });
};

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
    const profile = await auth.fetchProfileById(sellerId);
    
    if (!profile) {
      seller.value = null;
      return;
    }
    
    seller.value = profile;

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
      id: v.id,
      cdnUrl: v.cdnUrl,
      thumbnailUrl: v.thumbnailUrl || '',
      description: v.description || 'Видео',
      duration: v.duration || '0:11',
      viewsCount: v.viewsCount ?? 0,
      likesCount: v.likesCount ?? 0,
      commentsCount: v.commentsCount ?? 0,
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
watch(() => sellerDescription.value, checkOverflow, { immediate: true });
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
.review-card { background: white; border-radius: 1.25rem; padding: 1.188rem 2rem 1rem 1.5rem;}
.review-header { display: flex; justify-content: space-between; align-items: flex-end;}
/* Стили ответа продавца */
.reply-content { margin-top: .3rem;}
.reply-text { font-size: 1rem;}
.seller-tabs { display: flex; gap: 0rem; border-radius: 0.625rem; margin-bottom: 3.25rem; background: var(--bg-defort); width: fit-content; padding: 0.125rem 0.25rem; }
.desc-container { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 0.25rem; }
.desc-text { display: block; width: 56.563rem; max-width: 100%;  font-size: 1.25rem; color: #858685; }
.seller-desc { width: 56.563rem; margin-top: 1.375rem;}
.desc-text.is-collapsed { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.btn-more {flex-shrink: 0; color: var(--btn-bg); background: none; border: none; cursor: pointer; font-weight: 400; padding: 0; font-size: 1.25rem; }
.products { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.938rem; padding-left: -1rem; padding-right: -1rem; }
.seller-tabs button { padding: 1rem 3.188rem; background: none; border: none; font-size: 1.25rem; font-weight: 700; color: #858685; cursor: pointer; position: relative; background: var(--bg-defort); border-radius: 0.625rem; }
.seller-tabs button.active { color: var(--bg-defort); background: var(--btn-bg); }
.seller-logo { width: 7.625rem; height: 7.625rem; border-radius: 50%; object-fit: cover; }
.seller-header-flex { display: grid; justify-content: space-between; }
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
.video-card { width: 100%; max-height: 28rem; background: white; border-radius: 1.25rem; padding: 0.625rem 0.625rem 0.938rem 0.625rem;}
.video-title { font-size: 1rem; font-weight: 700; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; transition: all 0.3s; border-radius: 0;text-align: justify;text-transform: lowercase; margin-bottom: 0.75rem;}
.video-title::first-letter {text-transform: uppercase;}
.duration{bottom: 0; right: 0;}
.video-info{margin-top: 0.938rem;}
.video-date { color: #7c7c7c; font-size: 0.875rem;}
.seller-card-main { background-color: white; margin-bottom: 1.25rem; padding: 1.438rem; border-radius: 1.25rem; position: relative;}
.seller-info-right { text-align: end; width: 100%; margin-top: 1.563rem;}
.experience { font-size: 1rem; position: absolute; bottom: 1.25rem; right: 1.25rem; color: #858685;}
.seller-name-row h1 { margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 700;display: inline-block;text-transform: lowercase;}
.seller-name-row h1::first-letter {text-transform: uppercase;}
.seller-type { margin-bottom: 0.938rem; font-size: 1.25rem; font-weight: 700;}
.rating-block { margin-bottom: 0.563rem; }
.rating { font-size: 1.25rem; font-weight: 700; display: flex; gap: 0.563rem;color: #262626;line-height: 1;height: 1rem;align-items: stretch;}
.stars {display: flex;gap: 0.125rem;align-items: center;}
.star-icon {width: 0.938rem;height: 0.938rem;}
.stars-row {display: flex;gap: 0.125rem;}
.ads-list {display: flex;flex-direction: column;gap: 1rem;}
.ad-card-horizontal { height: 13.5rem;background: white;border-radius: 1.25rem;padding: 0.625rem;display: flex;gap: 1.5rem;position: relative;overflow: hidden;}
.ad-image-block {width: 11.75rem;flex-shrink: 0;}
.ad-image-block img {width: 100%;height: 100%;object-fit: cover;border-radius: 1.25rem;}
.ad-main-info {width: 31.625rem;display: flex;flex-direction: column;}
.ad-title-row {display: flex;justify-content: space-between;align-items: flex-start;width: 100%;}
.ad-title {margin-bottom: .4rem;overflow: hidden;}
.ad-title-link {font-size: 1.5rem;font-weight: 700;display: inline-block;text-transform: lowercase; height: 3.125rem; display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;color: inherit;text-decoration: none;transition: opacity 0.2s; border-radius: 0;}
.ad-title-link:hover {opacity: 0.7;}
.ad-title-link::first-letter {text-transform: uppercase;}
.ad-price {font-size: 1.5rem;padding: 0.438rem 1rem;background: var(--btn-bg);font-weight: 700;width: fit-content;color: var(--bg-defort);border-radius: 0.625rem;}
.ad-description {margin: 1rem 0;font-size: 1rem;color: #858685;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;font-weight: 700; height: fit-content;}
.ad-location {margin-top: auto;display: flex;align-items: center;gap: 0.438rem;font-weight: 700;font-size: 1rem;}
.ad-location img {width: 1.563rem;height: 1.563rem;}
.ad-stats-block {display: flex;flex-direction: column;justify-content: flex-end;align-items: flex-start;gap: 0.375rem;margin-left: 1.25rem;width: 43%;}
.creat-akk {font-size: 1rem;color: #858685;text-align: right;width: 100%;}
.user-info_block{display: grid; justify-items: center; gap: 1.125rem;}
.user-info{gap: 3.063rem; align-items: center;}
.user-avatar{width: 3.938rem; height: 3.938rem;}
.user-name{font-size: 1.25rem; font-weight: 700;text-transform: lowercase; }
.user-name::first-letter { text-transform: uppercase;}
.review-body{margin-bottom: 0; margin-top: 0.625rem; font-size: 1rem; color: #262626;}
.review-meta{display: grid; height: 100%; align-content: space-between;}
@media (max-width: 77rem) {.ad-main-info,.ad-title-row,.ad-description {width: 25rem;}}
@media (max-width: 77rem) { .products,.video-grid_block { display: grid; grid-template-columns: repeat(5, 12.2rem); gap: 1rem; background: #ececec;}}
</style>