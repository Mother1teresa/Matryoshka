<template>
  <Header />
  <section v-if="product" class="product-page">
    <div class="container">
        <div class="breadcrumbs">
          <router-link to="/">Главная</router-link>
          <template v-if="currentCategory">
            → <router-link :to="{ name: 'catalog', params: { type: currentCategory.slug } }">
                {{ currentCategory.name }}
              </router-link>
          </template>
          <template v-if="breadcrumbSectionName">
            → <router-link :to="{ name: 'catalog', params: { type: product.category, section: product.section } }">
                {{ breadcrumbSectionName }}
              </router-link>
          </template>
          <span v-if="breadcrumbSubName && breadcrumbSubName !== breadcrumbSectionName">
            → {{ breadcrumbSubName }}
          </span>
          <span v-if="product"> → {{ product?.title }}</span>
        </div>
      <div class="product-layout">
        <div class="product-left">
          <h1 class="product-title">{{ product.title }}
          <img
          class="card-like"
          :src="favStore.isFavorite(product.id) ? heartFilled : heart"
          @click.stop="onLikeClick(product)"/>
          </h1>
          <div class="gallery">
            <img class="main-image" :src="activeImage" @click="openFullGallery(0)"/>
            <div class="thumbs">
              <img
                v-for="(img, i) in previewImages"
                :key="i"
                :src="img"
                @click="activeImage = img"
                :class="{ active: activeImage === img }"
              /></div></div>
          <!-- Подробности -->
          <div class="product-details">
            <h3>Подробности</h3>
            <div class="details-grid">
              <div
                v-for="field in fields"
                :key="field.key"
                class="detail-row">
                <span class="label">{{ field.label }}</span>
                <span class="value">{{ product.attributes?.[field.key] || "—" }}</span>
              </div></div></div>
          <!-- Описание -->
          <div class="product-description">
            <h3>Описание</h3>
            <p>{{ product.description }}</p>
          </div></div>
        <div class="product-right">
          <div class="price-card">
            <div class="price">
            {{ formatPrice(product.price) }} ₽
            <div 
              v-if="product.category === 'nedvizhimost' && product.attributes?.area" 
              class="price-extra">
              {{ Math.round(product.price / product.attributes.area).toLocaleString() }} ₽ за м²
            </div>
          </div>
            <div class="location">
              {{ product.city }}
            </div></div>
          <!-- Продавец -->
          <div class="seller-card">
            <div class="seller">
              <router-link :to="{ name: 'SellerPage', params: { id: seller?.id } }">
                <img src="/src/assets/img/mask-avatar.png" class="avatar" />
              </router-link>
              <div class="seller-card__block">
                <router-link :to="{ name: 'SellerPage', params: { id: seller?.id } }" class="name">
                  {{ seller?.name }}
                </router-link>
                <div class="rating">{{ reviewStore.getRatingById(seller?.id) }} ★★★★★</div>
                <div class="type">{{ seller?.type === 'company' ? 'Компания' : 'Частное лицо' }}</div>
                <button class="btn subscribe" @click="onSubscribeClick" :class="{ 'is-active': subStore.isSubscribed(seller?.id) }">
                  {{ subStore.isSubscribed(seller?.id) ? 'Отписаться' : 'Подписаться' }}
                </button></div></div>
            <div class="seller-card__btns">
              <button class="btn primary" @click="onShowNumberClick">
                Показать номер
              </button>
              <a href="" class="btn secondary" @click="onWriteClick">
                <img src="/src/assets/img/mes.svg" />
              </a>
            </div></div></div></div>
            <Transition name="fade">
              <div v-if="showCallModal" class="modal-overlay" @click.self="showCallModal = false">
                <div class="confirm-call-card">
                  <p class="confirm-message">
                    Действительно ли вы хотите позвонить 
                    <strong>{{ ad.seller?.name || 'Продавцу' }}</strong> 
                    ({{ ad.seller?.phone }}{{ ad.seller?.ext ? ' доб ' + ad.seller.ext : '' }})?
                  </p>
                  
                  <div class="confirm-actions">
                    <button class="btn-black" @click="handleCall(ad.seller?.phone)">Позвонить</button>
                    <button class="btn-gray" @click="showCallModal = false">Отмена</button>
                  </div>
                </div>
              </div>
            </Transition>
</div></section>
  
  <div v-else-if="!isReady" class="block__loading">
    Загрузка...
  </div>
  <NotFound v-else />
</template>
<script setup>
import { ref, computed, watch, onMounted } from "vue" 
import { useRoute } from "vue-router"
import { useProductStore } from "/src/stores/product.js"
import { productLabels } from "/src/stores/productLabels.js"
import { categories } from "/src/data/categories.js"
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import Header from '../components/layout/Header.vue';
import NotFound from "../components/common/NotFound.vue";

import { notify } from "../utils/notify";

import { useFavoritesStore } from "/src/stores/favoritesStore";
import { useSubscriptionStore } from "../stores/subscriptionStore.js"; 
const favStore = useFavoritesStore();
const subStore = useSubscriptionStore();

import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
// Иконки сердечек
import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

import { useReviewStore } from '/src/stores/reviews.js';
const reviewStore = useReviewStore();
import { useSellerStore } from "/src/stores/sellers.js";
const sellerStore = useSellerStore();
const seller = computed(() => {
  if (!product.value) return null;
  return sellerStore.getSellerById(product.value.sellerId);
});
const auth = useAuthStore();
const modal = useModalStore();
const route = useRoute()
const productStore  = useProductStore()
const isSubscribed = ref(false); 
const isNumberShown = ref(false);

const product = computed(() => {
  const routeId = route.params.id;
  if (!routeId) return null;
  return productStore.products.find(p => String(p.id) === String(routeId));});
const isReady = ref(false);
onMounted(async () => {
  if (!product.value) { await productStore.fetchAdverts(); await sellerStore.ensureSellers();}
  if (auth.user?.id) {reviewStore.fetchReviewsBySeller(auth.user.id);}
  isReady.value = true;
});
const breadcrumbSectionName = computed(
  () => activeTabItem.value?.title || activeTabItem.value?.name);
const breadcrumbSubName = computed(() => {
  const subSlug = product.value?.subcategory;
  if (!currentCategory.value || !subSlug) return null;
  for (const section of currentCategory.value.sections) {const directLink = section.links?.find(l => l.slug === subSlug);if (directLink) return directLink.name;if (section.links) {for (const link of section.links) {const deepLink = link.subLinks?.find(sl => sl.slug === subSlug);if (deepLink) return deepLink.name;}}}return null;});
const activeImage = ref("")
watch(product, (newVal) => {
  if (newVal) {
    activeImage.value = newVal.images?.length ? newVal.images[0] : newVal.image
  }
}, { immediate: true })
const activeTabItem = computed(() => {
  if (!currentCategory.value || !product.value) return null;
  return (
    currentCategory.value.sections.find((s) => s.slug === product.value.section) ||
    currentCategory.value.sections
      .flatMap((s) => s.links || [])
      .find((l) => l.slug === product.value.section));});
const fields = computed(() => {
  const p = product.value;
  if (!p || !p.attributes) return [];
  return Object.keys(p.attributes).map(key => {
    return {
      key: key,
      label: productLabels[key] || key, 
      value: p.attributes[key]
    };
  }).filter(f => !f.key.includes('price')); 
});
const formatPrice = (price) => {
  if (!price) return "Цена по запросу"
  return price.toLocaleString("ru-RU")}
onMounted(() => {Fancybox.bind("[data-fancybox='gallery']", {Hash: false,});});
const previewImages = computed(() => {
  return product.value?.images?.slice(0, 8) || [];
});
const currentCategory = computed(() => {
  if (!product.value) return null; 
  return categories.find((c) => c.slug === product.value.category);
});
const openFullGallery = (index = 0) => {
  const allImages = product.value.images.map(src => ({ src, type: "image" }));
  Fancybox.show(allImages, { startIndex: index });};

const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
if (!auth.isAuthenticated) {
  modal.openLogin();
  notify(message);
  return;}action();
};
const onLikeClick = (item) => {
  if (!item) return;
  checkAuthAndRun(() => {
    favStore.toggle(item.id);
    notify(favStore.isFavorite(item.id) ? "Добавлено в избранное" : "Удалено из избранного");
  }, "Войдите, чтобы добавить в избранное");
};
const onSubscribeClick = () => {
  const sellerId = seller.value?.id;
  checkAuthAndRun(async () => {
    const isNowSubscribed = await subStore.toggle(sellerId);
    notify(
      isNowSubscribed
        ? "Вы подписались на продавца"
        : "Вы отписались от продавца"
    );
  });
};
const showCallModal = ref(false);
const onShowNumberClick = () => {
  checkAuthAndRun(() => {
    isNumberShown.value = true;
  }, "Войдите, чтобы увидеть номер телефона");
};
const handleCall = (phone) => {
  // Стандартная команда браузеру на вызов
  window.location.href = `tel:${phone}`;
  showCallModal.value = false;
};
const onWriteClick = (e) => {
  if (!auth.isAuthenticated) {
    e.preventDefault(); 
    modal.openLogin();
    notify("Войдите, чтобы написать сообщение");}};
watch(() => seller.value?.id, (newId) => {
  if (newId) {
    reviewStore.fetchReviewsBySeller(newId);
  }
});
</script>
<style scoped>
.product-layout {
  display: grid;
  gap: 3.125rem;
  grid-template-columns: repeat(2, 1fr);
}
.product-left {
  flex: 1;
  background-color: white;
  border-radius: 1.25rem;
  padding: 1.375rem 1.875rem;
  width: 54.75rem;
}

.product-right {
  width: 20.813rem;
  height: fit-content;
}
/* Заголовок */
.product-title {
  margin-bottom: 1.563rem;
  font-weight: 600;
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.product-title .card-like{
  width: 2.188rem;
  height: 1.938rem;
}
/* Галерея */
.gallery {
  gap: 2rem;
  display: grid;
  grid-template-columns: repeat(1, 36.875rem 14.375rem);
}

.main-image {
  width: 36.875rem;
  height: 20.625rem;
  object-fit: cover;
  border-radius: 0.625rem;
  cursor: pointer;
}

.thumbs {
  width: 12.5rem;
  display: grid;
  gap: 0.875rem;
  grid-template-columns: repeat(2, 5.625rem);
  grid-template-rows: repeat(4, 4.25rem);
  grid-auto-flow: column;
  overflow: hidden;
}

.thumbs img {
  width: 5.625rem;
  height: 4.25rem;
  object-fit: cover;
  cursor: pointer;
  border-radius: 0.313rem;
  opacity: 0.6;
  transition: .3s;
}

.thumbs img.active {
  opacity: 1;
  border: 2px solid var(--btn-bg);
}

/* Детали */
.product-details {
  margin-top: 2.188rem;
}
.product-details h3{
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 0.625rem;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 20.75rem);
  gap: 0.625rem;
  font-size: 1.25rem;
}

.detail-row {
  display: flex;
  gap: 0.625rem;
}
.label {
  color: #888;
  font-size: 1.35rem;
}
.value {
  font-weight: 500;
  font-size: 1.35rem;
}
/* Описание */
.product-description {
  margin-top: 2.188rem;
}
.product-description h3{
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}
.product-description p{
  font-size: 1.35rem;
}
/* Правая колонка */
.price-card {
  background-color: white; 
  border-radius: 1.25rem;
  padding: 1.375rem 1.875rem;
}
.price-extra {
  color: #b7b7b7;
  font-size: 1rem;
  font-size: 1rem;
  font-weight: 400;
}
.seller-card__btns{
  display: flex;
  margin-top: 4.313rem;
  gap: 1rem;
}
.price {
  font-size: 2rem;
  font-weight: 600;
}
.location {
  margin: .5rem 0 0;
  color: #666;
}

.btn.secondary {
  background: #F5F5F5;
  width: 4.388rem;
  height: 3.438rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
}
.seller-card {
  margin-top: 0.625rem;
  background-color: white; 
  border-radius: 1.25rem;
  padding: 1rem 1rem 1.313rem 1rem;
}
.seller {
  display: flex;
  gap: 1.75rem;
}
.avatar {
  width: 4.525rem;
  height: 4.525rem;
  border-radius: 50%;
  margin-left: 0.938rem;
}
.name,.rating{
  margin-bottom: .5rem;
  transition: opacity .3s;
}
.rating{
  font-weight: 600;
  margin-top: 0.438rem;
}
.name:hover{
  opacity: 0.6;
}
.seller-card__block{
  font-size: 1.25rem;
}
.type{
  margin-bottom: 0.875rem;
}
.subscribe{
color: #64A07A;
  transition:
    opacity 0.3s
}
.subscribe:hover{
  opacity: 70%;
}
.primary{
  background-color: #64A07A;
  font-size: 1.25rem;
  color: white;
  width: 14.375rem;
  height: 3.438rem;
  text-align: center;
  border-radius: 1.25rem;
}
.secondary img{
  width: 2.575rem;
  height: 2.525rem;
}
.is-active{
  color: red;
}
.confirm-call-card {
  background: white;
  padding: 32px;
  border-radius: 28px; /* Сильное скругление */
  max-width: 440px;
  width: 90%;
  text-align: left;
}

.confirm-message {
  font-size: 18px;
  line-height: 1.4;
  color: #000;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-black {
  flex: 1;
  background: #000;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-gray {
  flex: 1;
  background: #E5E5E5; /* Светло-серый */
  color: #000;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Анимация появления */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>