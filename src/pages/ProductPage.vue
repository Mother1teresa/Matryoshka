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
        <!-- Левая колонка -->
        <div class="product-left">
          <h1 class="product-title">
            {{ product.title }}
            <img
              class="card-like"
              :src="favStore.isFavorite(product.id) ? heartFilled : heart"
              @click.stop="onLikeClick(product)"
            />
          </h1>
          
          <!-- Галерея -->
          <div class="gallery">
            <img class="main-image" :src="activeImage" @click="openFullGallery(0)" />
            <div class="thumbs" v-if="previewImages.length > 1">
              <img
                v-for="(img, i) in previewImages"
                :key="i"
                :src="img"
                @click="activeImage = img"
                :class="{ active: activeImage === img }"
              />
            </div>
          </div>

          <!-- Характеристики -->
          <div class="product-details">
            <div 
              v-for="(group, groupIndex) in fieldGroups" 
              :key="groupIndex"
              class="details-group"
            >
              <h3>{{ group.title }}</h3>
              <div class="details-grid">
                <div
                  v-for="field in group.fields"
                  :key="field.key"
                  :class="['detail-row', { 'full-width-row': field.type === 'chips' }]"
                >
                  <span class="label">{{ getLabel(field.key, field.label) }}</span>
                  
                  <!-- Чипсы -->
                  <div v-if="field.type === 'chips'" class="details-chips-group">
                    <span 
                      v-for="(chip, index) in formatValue(product.attributes?.[field.key], 'chips')" 
                      :key="index" 
                      class="detail-chip-item"
                      :class="{ 'chip-active': isChipActive(chip, field.key) }"
                    >
                      {{ chip }}
                    </span>
                  </div>
                  
                  <!-- Обычное значение -->
                  <span v-else class="value">
                    {{ formatValue(product.attributes?.[field.key], 'text', field.suffix) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Описание -->
          <div v-if="product.description" class="product-description">
            <h3>Описание</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- Карта -->
          <div v-if="product.address || mapCoordinates" class="product-address-section">
            <h3>Адрес</h3>
            <p class="address-text">{{ product.address }}</p>
            <div v-if="mapCoordinates" class="product-map">
              <yandex-map
                :settings="{ 
                  location: { 
                    center: mapCoordinates, 
                    zoom: 15 
                  } 
                }"
                width="100%"
                height="300px"
              >
                <yandex-map-default-scheme-layer />
                <yandex-map-default-features-layer />
                <yandex-map-marker :coordinates="mapCoordinates">
                  <div class="map-pin">📍</div>
                </yandex-map-marker>
              </yandex-map>
            </div>
            <div v-else-if="product.address && isGeocoding" class="no-map">
              <p>Определяем координаты на карте...</p>
            </div>
            <div v-else-if="product.address" class="no-map">
              <p>Не удалось определить местоположение на карте</p>
            </div>
          </div>
        </div>

        <!-- Правая колонка -->
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
            <div class="location">{{ product.city }}</div>
          </div>

          <!-- Продавец -->
          <div class="seller-card">
            <div class="seller">
              <router-link :to="{ name: 'SellerPage', params: { id: product?.sellerId } }">
                <img :src="seller?.avatar || '/src/assets/img/mask-avatar.png'" class="avatar" />
              </router-link>
              <div class="seller-card__block">
                <router-link :to="{ name: 'SellerPage', params: { id: product?.sellerId } }" class="name">
                  {{ sellerName }}
                </router-link>
                <div class="rating">{{ sellerRating }} ★★★★★</div>
                <div class="type">{{ sellerType }}</div>
                <button 
                  class="btn subscribe" 
                  @click="onSubscribeClick" 
                  :class="{ 'is-active': subStore.isSubscribed(product?.sellerId) }"
                >
                  {{ subStore.isSubscribed(product?.sellerId) ? 'Отписаться' : 'Подписаться' }}
                </button>
              </div>
            </div>
            <div class="seller-card__btns">
              <button class="btn primary" @click="onShowNumberClick">
                Показать номер
              </button>
              <button class="btn secondary" @click="onWriteClick">
                <img src="/src/assets/img/mes.svg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Похожие товары -->
      <div v-if="similarProducts.length" class="similar-products">
        <h3 class="similar-title">Похожие товары</h3>
        <div class="similar-list">
          <div v-for="item in similarProducts" :key="item.id" class="horizontal-card">
            <router-link
              :to="{ name: 'Product', params: { type: item.category, section: item.section || 'default', id: item.id } }"
              class="card-link-wrapper"
            >
              <img :src="getSimilarImageUrl(item)" class="card-img" alt="product image" />
            </router-link>
            <div class="card-content">
              <div class="card-header">
                <router-link :to="{ name: 'Product', params: { type: item.category, section: item.section || 'default', id: item.id } }">
                  <h3 class="card-title">{{ item.title }}</h3>
                </router-link>
              </div>
              <div class="card-price-row">
                <span class="card-price">{{ item.price?.toLocaleString() }} ₽</span>
              </div>
              <div class="card-location">
                <span class="city-text">{{ item.city }}</span>
              </div>
              <p class="card-description">{{ item.description }}</p>
              <div class="card-footer-info" v-if="item.subcategory || item.section">
                {{ getSubcategoryName(item) }}
              </div>
              <img
                class="card-like"
                :src="favStore.isFavorite(item.id) ? heartFilled : heart"
                @click.stop="onLikeClick(item)"
              />
            </div>
            <div class="card-content__rigth">
              <div class="card-content__rigth-btns">
                <a class="btn card-btn" @click="onWriteClick(item)">Написать</a>
                <button class="btn card-btn" @click="onShowNumberClick(item)">Показать номер</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модалка звонка -->
      <Transition name="fade">
        <div v-if="showCallModal" class="modal-overlay" @click.self="showCallModal = false">
          <div class="confirm-call-card">
            <p class="confirm-message">
              Позвонить <strong>{{ seller?.name || 'Продавцу' }}</strong>?
            </p>
            <div class="phone-display">
              {{ formatPhone(seller?.phone) }}
            </div>
            <div class="confirm-actions">
              <button class="btn-black" @click="handleCall(seller?.phone)">
                Позвонить
              </button>
              <button class="btn-gray" @click="showCallModal = false">Отмена</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
  
  <div v-else-if="!isReady" class="block__loading">Загрузка...</div>
  <NotFound v-else />
</template>
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "/src/stores/product.js";
import { productLabels, getLabel, formatValue, getFieldGroups, isChipActive } from "/src/stores/productLabels.js";
import { categories } from "/src/data/categories.js";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import Header from '../components/layout/Header.vue';
import NotFound from "../components/common/NotFound.vue";
import { notify } from "../utils/notify";
import { capitalizeFirst } from '/src/utils/formatters.js';

import { useFavoritesStore } from "/src/stores/favoritesStore";
import { useSubscriptionStore } from "../stores/subscriptionStore.js";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { useReviewStore } from '/src/stores/reviews.js';
import { geocodeByQuery } from '/src/utils/geocode.js';

import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const modal = useModalStore();
const productStore = useProductStore();
const favStore = useFavoritesStore();
const subStore = useSubscriptionStore();
const reviewStore = useReviewStore();

const isReady = ref(false);
const isNumberShown = ref(false);
const showCallModal = ref(false);
const activeImage = ref("");
const product = ref(null);
const similarProducts = ref([]);
const seller = ref(null);
const mapCoordinates = ref(null);
const isGeocoding = ref(false);

// === КАРТА ===
const hasCoordinatesFromApi = computed(() => {
  return Array.isArray(product.value?.coordinates) && 
         product.value.coordinates.length === 2 &&
         !isNaN(product.value.coordinates[0]) &&
         !isNaN(product.value.coordinates[1]);
});

// === ПРОДАВЕЦ ===
const sellerName = computed(() => {
  return seller.value?.name || seller.value?.username || 'Продавец';
});

const sellerType = computed(() => {
  return seller.value?.type === 'company' ? 'Компания' : 'Частное лицо';
});

const sellerRating = computed(() => {
  return reviewStore.getRatingById(product.value?.sellerId) || 0;
});

// === ГЕОКОДИРОВАНИЕ ===
// === ГЕОКОДИРОВАНИЕ ===
const resolveCoordinates = async () => {
  if (hasCoordinatesFromApi.value) {
    const [lng, lat] = product.value.coordinates;
    mapCoordinates.value = [Number(lng), Number(lat)];
    return;
  }

  let address = product.value?.address || product.value?.city;
  if (!address) {
    mapCoordinates.value = null;
    return;
  }

  // Автозаглавная первая буква
  if (address.length > 0 && address[0] !== address[0].toUpperCase()) {
    address = address[0].toUpperCase() + address.slice(1);
    // Обновляем в продукте тоже
    product.value.address = address;
  }

  isGeocoding.value = true;
  try {
    const result = await geocodeByQuery(address);
    if (result && result.coordinates) {
      const coords = Array.isArray(result.coordinates) 
        ? result.coordinates 
        : [result.coordinates.lng, result.coordinates.lat];
      mapCoordinates.value = coords;
    } else {
      mapCoordinates.value = null;
    }
  } catch (e) {
    console.error('Ошибка геокодирования:', e);
    mapCoordinates.value = null;
  } finally {
    isGeocoding.value = false;
  }
};

// === ТИП ТОВАРА ===
const productSection = computed(() => {
  const section = product.value?.section;
  const subcategory = product.value?.subcategory;
  
  const subToSection = {
    'uchastok': 'uchastok', 'land': 'uchastok',
    'office': 'office', 'commercial': 'office',
    'apartments': 'apartments', 'flat': 'apartments',
    'house': 'house', 'cottage': 'house',
    'cars': 'cars', 'auto': 'cars',
    'yachts': 'yachts', 'boats': 'yachts',
    'jobs': 'jobs', 'vacancy': 'jobs', 'resume': 'resume',
    'pets': 'pets', 'animals': 'pets',
    'ready_business': 'ready_business', 'business': 'ready_business',
    'tours': 'tours', 'travel': 'tours',
  };
  
  return subToSection[subcategory] || subToSection[section] || section || 'apartments';
});

const fieldGroups = computed(() => {
  if (!product.value) return [];
  return getFieldGroups(productSection.value);
});

// === ЗАГРУЗКА ПРОДАВЦА ===
const loadSeller = async (sellerId) => {
  if (!sellerId) {
    seller.value = null;
    return;
  }
  try {
    const profile = await auth.fetchProfileById(sellerId);
    seller.value = profile || {
      id: sellerId,
      name: 'Продавец',
      type: 'private',
      avatar: '/src/assets/img/mask-avatar.png',
      phone: '',
    };
  } catch (e) {
    console.error("Ошибка загрузки продавца:", e);
    seller.value = {
      id: sellerId,
      name: 'Продавец',
      type: 'private',
      avatar: '/src/assets/img/mask-avatar.png',
      phone: '',
    };
  }
};

// === ФОРМАТ ТЕЛЕФОНА ===
const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d|7|8)(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  return phone;
};

// === ЗАГРУЗКА ТОВАРА ===
const loadProduct = async (id) => {
  if (!id) {
    product.value = null;
    isReady.value = true;
    return;
  }

  isReady.value = false;
  product.value = null;
  similarProducts.value = [];
  seller.value = null;
  mapCoordinates.value = null;

  try {
    const cached = productStore.products.find(p => String(p.id) === String(id));
    
    if (cached && cached.pictures?.length) {
      product.value = {
        ...cached,
        images: cached.images || cached.pictures?.map(p => p.pictureUrl || p.url) || [],
        image: cached.image || cached.pictures?.[0]?.pictureUrl || '/src/assets/img/placeholder.png',
        attributes: cached.attributes || {},
        coordinates: cached.coordinates || null,
        address: cached.address || cached.city || '',
      };
    } else {
      const data = await auth.getAdvertById(id);
      
      if (!data || !data.id) {
        notify("Объявление не найдено", "error");
        product.value = null;
        isReady.value = true;
        return;
      }

      product.value = {
        id: data.id,
        title: data.title || 'Без названия',
        price: Number(data.price) || 0,
        description: data.description || '',
        city: data.address || data.city || '',
        address: data.address || '',
        coordinates: data.coordinates || null,
        category: data.category || 'tovary',
        section: data.section || data.subCategory || 'default',
        subcategory: data.subCategory || data.subcategory || '',
        sellerId: data.userId || data.sellerId,
        images: data.pictures?.map(p => p.pictureUrl || p.url) || [],
        image: data.pictures?.[0]?.pictureUrl || data.thumbnailUrl || '/src/assets/img/placeholder.png',
        attributes: data.attributes || {},
        ...data
      };
    }

    if (product.value?.sellerId) {
      await Promise.all([
        loadSeller(product.value.sellerId),
        reviewStore.fetchReviewsBySeller(product.value.sellerId),
      ]);
    }

    await resolveCoordinates();
    activeImage.value = product.value.images?.[0] || product.value.image || '';
    await loadSimilarProducts();

  } catch (err) {
    console.error("Ошибка загрузки товара:", err);
    notify("Ошибка загрузки объявления", "error");
    product.value = null;
  } finally {
    isReady.value = true;
  }
};

const loadSimilarProducts = async () => {
  if (!product.value) return;
  try {
    // const res = await api.get('/advert/similar', { ... });
    // similarProducts.value = res.data || [];
  } catch (e) {
    console.error('Ошибка загрузки похожих:', e);
    similarProducts.value = [];
  }
};

const getSimilarImageUrl = (item) => {
  if (item.images?.length) return item.images[0];
  if (item.pictures?.[0]) return item.pictures[0].url || item.pictures[0];
  if (item.image) return item.image;
  return '/src/assets/img/placeholder.png';
};

const getSubcategoryName = (item) => {
  const targetSlug = item.subcategory || item.section;
  if (!targetSlug) return "";
  for (const cat of categories) {
    for (const section of cat.sections) {
      for (const link of section.links) {
        if (link.slug === targetSlug) return link.name;
        if (link.subLinks) {
          const sub = link.subLinks.find(s => s.slug === targetSlug);
          if (sub) return sub.name;
        }
      }
    }
  }
  return "";
};

const currentCategory = computed(() => {
  if (!product.value) return null;
  return categories.find((c) => c.slug === product.value.category);
});

const activeTabItem = computed(() => {
  if (!currentCategory.value || !product.value) return null;
  return (
    currentCategory.value.sections.find((s) => s.slug === product.value.section) ||
    currentCategory.value.sections.flatMap((s) => s.links || []).find((l) => l.slug === product.value.section)
  );
});

const breadcrumbSectionName = computed(() => activeTabItem.value?.title || activeTabItem.value?.name);

const breadcrumbSubName = computed(() => {
  const subSlug = product.value?.subcategory;
  if (!currentCategory.value || !subSlug) return null;
  for (const section of currentCategory.value.sections) {
    const directLink = section.links?.find(l => l.slug === subSlug);
    if (directLink) return directLink.name;
    if (section.links) {
      for (const link of section.links) {
        const deepLink = link.subLinks?.find(sl => sl.slug === subSlug);
        if (deepLink) return deepLink.name;
      }
    }
  }
  return null;
});

const previewImages = computed(() => product.value?.images?.slice(0, 8) || []);
const formatPrice = (price) => price ? price.toLocaleString("ru-RU") : "0";

const openFullGallery = (index = 0) => {
  const allImages = product.value.images.map(src => ({ src, type: "image" }));
  Fancybox.show(allImages, { startIndex: index });
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
    notify(favStore.isFavorite(item.id) ? "Добавлено в избранное" : "Удалено из избранного");
  }, "Войдите, чтобы добавить в избранное");
};

const onSubscribeClick = () => {
  const sellerId = product.value?.sellerId;
  if (!sellerId) return;
  checkAuthAndRun(async () => {
    const isNowSubscribed = await subStore.toggle(sellerId);
    notify(isNowSubscribed ? "Вы подписались на продавца" : "Вы отписались от продавца");
  });
};

const onShowNumberClick = () => {
  checkAuthAndRun(() => { 
    isNumberShown.value = true; 
    showCallModal.value = true; 
  }, "Войдите, чтобы увидеть номер телефона");
};

const onWriteClick = async () => {
  checkAuthAndRun(async () => {
    try {
      const roomId = await auth.createPrivateRoom(product.value.sellerId);
      router.push({ name: 'ChatDetail', params: { id: roomId } });
    } catch (err) {
      notify("Не удалось открыть чат", "error");
    }
  }, "Войдите, чтобы написать сообщение");
};

const handleCall = (phone) => {
  window.location.href = `tel:${phone}`;
  showCallModal.value = false;
};

watch(() => route.params.id, (newId) => {
  if (newId) loadProduct(newId);
}, { immediate: true });

onMounted(() => {
  Fancybox.bind("[data-fancybox='gallery']", { Hash: false });
});

watch(() => product.value?.title, (newTitle) => {
  if (newTitle) {
    document.title = `${newTitle} — купить на Матрешка`;
  }
}, { immediate: true });
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
  object-fit: cover;
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
color: var(--btn-bg);
  transition:
    opacity 0.3s
}
.subscribe:hover{
  opacity: 70%;
}
.primary{
  background-color: var(--btn-bg);
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
  padding: 2rem 1.75rem 1.475rem 1.75rem;
  border-radius: 2.188rem;
  max-width: 39.063rem;
  width: 100%;
  text-align: left;
}

.confirm-message {
  font-size: 1.25rem;
  color: #000;
  margin-bottom: 1.25rem;
}
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
}
.btn-black {
  /* flex: 1; */
  text-align: center;
  width: 10.375rem;
  height: 3.563rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 1rem;
  font-weight:500;
  cursor: pointer;
  font-size: 1.25rem;
}

.btn-gray {
  /* flex: 1; */
  width: 10.375rem;
  height: 3.563rem;
  text-align: center;
  background: #D8D8D8; 
  color: #000;
  border: none;
  border-radius: 1rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 1.25rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 3rem;
  row-gap: 1rem;
  margin-top: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 0.25rem;
}

.detail-row.full-width-row {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  border-bottom: none;
  padding-bottom: 0;
  margin-top: 0.5rem;
}

.details-chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
}

@media (max-width: 77rem) {
  .product-left {
    width: 47.75rem;
  }
  .main-image{
    width: 100%;
  }
  .gallery{
    grid-template-columns: repeat(1, 29.8rem 12.375rem);
  }
}
/* Группы деталей */
.details-group {
  margin-bottom: 2rem;
}

.details-group h3 {
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
}

/* Сетка для обычных полей */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 2rem;
}

/* Строка детали */
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e0e0e0;
}

.detail-row.full-width-row {
  grid-column: span 2;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  border-bottom: none;
}

/* Чипсы */
/* .details-chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
} */

.detail-chip-item {
  background-color: #e8e8e8;
  color: #666;
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.detail-chip-item.chip-active {
  background-color: #5b9279;
  color: white;
}
.product-address-section {
  margin-top: 2.188rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1.25rem;
}
.product-address-section h3 {
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.address-text {
  font-size: 1.15rem;
  color: #333;
  margin-bottom: 1rem;
}
.product-map {
  width: 100%;
  height: 18.75rem;
  border-radius: 0.625rem;
  overflow: hidden;
}
.map-pin {
  font-size: 2rem;
  transform: translate(-50%, -100%);
}

.similar-products {
  margin-top: 3rem;
  margin-bottom: 3rem;
}
.similar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.similar-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.horizontal-card {
  display: flex;
  gap: 1.25rem;
  background: white;
  padding: 1.25rem;
  border-radius: 1.25rem;
  width: 60.875rem;
}
.card-img {
  width: 7.875rem;
  height: 11.188rem;
  object-fit: cover;
  border-radius: 1.25rem;
}
.card-title {
  font-weight: 400;
  width: 90%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem;
}
.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0.5rem 0;
}
.card-price {
  font-size: 1.45rem;
  font-weight: 600;
  color: #000;
}
.card-location {
  color: #666;
  font-size: 0.9rem;
}
.card-description {
  color: #7c7c7c;
  font-size: 0.938rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer-info {
  margin-top: auto;
  color: #b0b0b0;
  font-size: 0.875rem;
  text-transform: capitalize;
}
.card-content__rigth {
  display: none;
  transition: all 0.3s;
}
.horizontal-card:hover .card-content__rigth {
  display: block;
}
.card-content__rigth-btns {
  display: grid;
  align-content: center;
  align-items: center;
  height: 100%;
  width: 12.813rem;
  gap: 0.688rem;
}
.card-like {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.563rem;
  height: 1.5rem;
}
.card-content {
  display: flex;
  flex-direction: column;
  width: 35.125rem;
  min-height: 100%;
  position: relative;
}
.card-btn {
  background: var(--btn-bg);
  color: white;
  padding: 0.5rem 0;
  text-align: center;
  border-radius: 0.313rem;
  border: none;
  cursor: pointer;
}
.card-btn:last-child {
  background-color: white;
  border: 1px solid var(--btn-bg);
  color: var(--btn-bg);
}
</style>