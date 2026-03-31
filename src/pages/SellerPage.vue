<template>
  <Header />
  <section class="seller-page-section">
    <div class="container seller-page" v-if="seller">
      <div class="breadcrumbs">
        <router-link to="/">Главная</router-link>
        <span> → {{ seller?.name }}</span>
      </div>
      <div class="seller-card-main">
        <div class="seller-header-flex">
          <div class="seller-info-left">
            <div class="logo-wrapper">
              <img :src="seller?.avatar || '/src/assets/img/mask-avatar.png'" class="seller-logo"/>
            </div>
            <div class="seller-text">
              <div class="seller-name-row">
                <h1>{{ seller?.name }}</h1>
                <div class="seller-type">
                  {{ seller?.type === "company" ? "Компания" : "Частное лицо" }}
                </div>
                <div class="rating-block">
                  <div class="rating">{{ reviewStore.getRatingById(route.params.id)}} <span>★★★★★</span>
                    <small> ( {{ reviewStore.getReviewsCountById(route.params.id) }} )</small>
                  </div>
                </div>
              </div>
              <div class="seller-desc">
                <div class="desc-container">
                  <span :class="{ 'is-collapsed': !isDescExpanded }" class="desc-text">
                    <a v-if="seller.website" :href="seller.website" target="_blank" >{{ seller.website }}</a>
                    {{ seller.description || "Переходите на наш профиль, чтобы увидеть все актуальные предложения." }}
                  </span>
                  <button class="btn-more" @click="isDescExpanded = !isDescExpanded">
                    {{ isDescExpanded ? "Скрыть" : "Ещё" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="seller-info-right">
            <div class="experience">На Матрёшке 8 месяцев</div>
            <button class="btn-subscribe-text" @click="onSubscribeClick":class="{ 'is-active': subStore.isSubscribed(seller?.id) }"> 
              {{ subStore.isSubscribed(seller?.id) ? "Отписаться" : "Подписаться"}}
            </button>
          </div>
        </div>
      </div>
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
      <div class="seller-content">
        <div v-if="currentTab === 'announcements'" class="products-grid-wrapper">
          <div class="products">
            <ProductCard v-for="product in sellerProducts" :key="product.id" :product="product"/>
          </div>
        </div>
        <div v-if="currentTab === 'video'" class="video-grid">
          <div v-for="video in sellerVideos" :key="video.id" class="video-card">
            <div class="video-preview">
              <img :src="video.thumbnail" />
              <span class="duration">{{ video.duration }}</span>
            </div>
            <div class="video-info">
              <div class="video-title">{{ video.title }}</div>
              <div class="video-date">{{ video.date }}</div>
            </div>
          </div>
        </div>
        <div v-if="currentTab === 'reviews'" class="reviews-container">
          <div v-if="reviewStore.isLoading" class="block__loading">
            Загрузка отзывов...
          </div>
          <template v-else-if="sellerReviews.length">
          <div v-for="review in sellerReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="user-info">
                <img :src="review.userAvatar" class="user-avatar" />
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
                <div class="stars-row">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</div>
                <div class="review-date">{{ review.date }}</div>
              </div>
            </div>
            
            <!-- Ответ продавца -->
            <div v-if="review.reply" class="seller-reply">
              <img :src="seller?.avatar || '/src/assets/img/mask-avatar.png'" class="reply-avatar" />
              <div class="reply-content">
                <div class="reply-label">Ответ продавца</div>
                <div class="reply-text">{{ review.reply }}</div>
              </div>
</div></div></template>
<div v-else class="no-reviews">
  У этого продавца пока нет отзывов.
</div></div></div></div></section></template>
<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "/src/stores/product.js";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { notify } from "/src/utils/notify";
import { useReviewStore } from "/src/stores/reviews.js";
import { useSubscriptionStore } from "../stores/subscriptionStore.js";
import { useSellerStore } from "/src/stores/sellers.js";

import Header from '../components/layout/Header.vue';
import ProductCard from "/src/components/product/ProductCard.vue";

const route = useRoute();
const auth = useAuthStore();
const modal = useModalStore();
const subStore = useSubscriptionStore();
const productStore = useProductStore();
const reviewStore = useReviewStore();
const sellerStore = useSellerStore();

const currentTab = ref("announcements");
const isDescExpanded = ref(false);

// Данные из сторов
const sellerReviews = computed(() => reviewStore.reviews);

const seller = computed(() => {
  // Ищем продавца по ID из роута
  return sellerStore.getSellerById(route.params.id) || { name: "Загрузка...", id: route.params.id };
});

const sellerProducts = computed(() => {
  const targetId = String(route.params.id);
  // Фильтруем все товары, которые есть в сторе
  return productStore.products.filter(p => String(p.sellerId) === targetId);
});
const sellerVideos = ref([
  { id: 1, title: "Дождевик чугунный", date: "17 дней назад", duration: "0:26", thumbnail: "/src/assets/img/video-plug.jpg" },
]);
const loadSellerData = async (sellerId) => {
  if (!sellerId) return;
  try {
    await productStore.fetchAdverts(); 
    await sellerStore.ensureSellers();
    await reviewStore.fetchReviewsBySeller(sellerId);
    
  } catch (err) {
    console.error("Ошибка при загрузке страницы продавца:", err);
  }
};
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentTab.value = "announcements";
      loadSellerData(newId);
    }
  },
  { immediate: true }
);
onUnmounted(() => {
  reviewStore.reviews = [];
});
const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};

const onSubscribeClick = () => {
  const sellerId = seller.value?.id;
  checkAuthAndRun(async () => {
    const isNowSubscribed = await subStore.toggle(sellerId);
    notify(isNowSubscribed ? "Вы подписались" : "Вы отписались");
  });
};

</script>

<style scoped>
.seller-page-section{
  margin-bottom: 3.188rem;
}
.reviews-container {
  background: #ececec;
  padding: 1.625rem 2rem 2rem 2rem;
  border-radius: 0 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.review-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 1.5rem .8rem 1.5rem;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
/* Стили ответа продавца */
.reply-content{
  margin-top: .3rem;
}

.reply-text {
  font-size: 1rem;
}
.seller-tabs {
  background: #ececec;
  padding: 1.625rem 1rem 0 2rem;
  border-radius: 1.25rem 1.25rem 0 0;
  display: flex;
  gap: 4rem; 
}
.desc-container { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 4px; }
.desc-text { display: block; max-width: 100%; font-size: 1.5rem; }
.seller-desc { width: 42.313rem; }
.desc-text.is-collapsed { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 25rem; font-size: 1.5rem; }
.btn-more { color: #64a07a; background: none; border: none; cursor: pointer; font-weight: 400; padding: 0; font-size: 1.5rem; }
.products { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.938rem; background: #ececec; padding: 1.625rem 1rem 1rem 1rem; border-radius: 0 0 1.25rem 1.25rem; }
.seller-tabs button { font-size: 2rem; border-bottom: 1px solid black; border-radius: 0; background: none; cursor: pointer; }
.seller-tabs button.active { border-bottom: 1px solid #64a07a; color: #64a07a; }
.seller-logo { width: 7.625rem; height: 7.625rem; border-radius: 50%; object-fit: cover; }
.seller-header-flex { display: flex; justify-content: space-between; }
.seller-info-left { display: flex; gap: 1.625rem; }
.btn-subscribe-text { color: #64a07a; background: none; border: none; cursor: pointer; font-size: 1.5rem; }
.btn-subscribe-text.is-active { color: #808080; }
.video-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.938rem; background: #ececec; padding: 1.625rem 1rem 1rem 1rem; border-radius: 0 0 1.25rem 1.25rem; }
.video-preview { width: 100%; height: 15.438rem; margin-bottom: 0.375rem; position: relative; }
.video-preview img { width: 100%; height: 100%; }
.duration { position: absolute; bottom: 0.313rem; right: 0.313rem; background: #00000099; border-radius: 0.313rem; color: white; padding: 0 0.25rem; }
.video-card { width: 100%; height: 20.313rem; background: white; border-radius: 0.938rem; padding: 0.938rem; }
.video-info { text-align: end; }
.video-title { font-size: .9rem; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden; transition: all 0.3s; border-radius: 0;}
.video-date { color: #7c7c7c; font-size: 0.875rem;}
.seller-card-main { background-color: white; margin-bottom: 1.25rem; padding: 1.438rem; border-radius: 1.25rem; }
.seller-info-right { text-align: end; }
.experience { font-size: 1.5rem; margin-bottom: 1.125rem; }
.seller-name-row h1 { margin-bottom: 0.875rem; }
.seller-type { margin-bottom: 0.875rem; font-size: 1.5rem; }
.rating-block { margin-bottom: 0.563rem; }
.rating { font-size: 1.5rem; font-weight: 600; }
@media (max-width: 77rem) { .products { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; background: #ececec; padding: 1.625rem 1.7rem 1rem 1.7rem; border-radius: 0 0 1.25rem 1.25rem;}}
</style>