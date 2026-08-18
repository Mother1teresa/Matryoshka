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
            <img class="card-like" :src="favStore.isFavorite(product.id) ? heartFilled : heart" @click.stop="onLikeClick(product)" />
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
              <div class="details-grid" :class="{ 'details-grid--two-cols': isTwoColumnGrid }">
                <div v-for="field in group.fields" :key="field.key" :class="['detail-row', { 'full-width-row': field.type === 'chips' }]">
                  <span class="label">{{ getLabel(field.key, field.label) }}</span>

                  <!-- Чипсы -->
                  <div v-if="field.type === 'chips'" class="details-chips-group">
                    <span v-for="(chip, index) in formatValue(product[field.key] ?? product.attributes?.[field.key], 'chips', null, field.key)" :key="index" class="detail-chip-item" :class="{ 'chip-active': isChipActive(chip, field.key) }">
                      {{ chip }}
                    </span>
                  </div>
                  <!-- Обычное значение -->
                  <div v-else class="value">
                    <template v-if="field.key === 'services'">
                      <div
                        v-for="(service, index) in formatValue(
                          product[field.key] ?? product.attributes?.[field.key],
                          field.type,
                          field.suffix,
                          field.key
                        )"
                        :key="index"
                        class="service-item"
                      >
                        {{ service }}
                      </div>
                    </template>

                    <template v-else>
                      {{ formatValue(
                        product[field.key] ?? product.attributes?.[field.key],
                        field.type,
                        field.suffix,
                        field.key
                      ) }}
                    </template>
                  </div>
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
              <div ref="mapContainer" style="width: 100%; height: 100%;"></div>
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
            <div class="data">{{ formatDate(product.createdAt) }}</div>
          </div>
          <!-- Продавец -->
          <div class="seller-card">
            <div class="seller">

              <div class="seller-card__block">
                <router-link :to="{ name: 'SellerPage', params: { id: product?.sellerId } }" class="name">
                  {{ sellerName }}
                  <p>Кликните чтобы посмотреть профиль</p>
                </router-link>
                <div class="type">{{ sellerType }}</div>
                <div class="rating">
                  {{ sellerRating }}
                  <span class="stars">
                    <img
                      v-for="n in 5"
                      :key="n"
                      :src="n <= Math.round(sellerRating) ? '/img/users/star.png' : '/img/users/star_1.png'"
                      class="star-icon"
                      alt="★"
                    />
                  </span>
                </div>
                <!-- <button class="btn subscribe" @click="onSubscribeClick" :class="{ 'is-active': subStore.isSubscribed(product?.sellerId) }">{{ subStore.isSubscribed(product?.sellerId) ? 'Отписаться' : 'Подписаться' }} </button> -->
              </div>
              <router-link :to="{ name: 'SellerPage', params: { id: product?.sellerId } }">
                <img :src="seller?.avatar || '/img/users/mask-avatar.png'" class="avatar" />
              </router-link>
            </div>
            <div class="seller-card__btns">
              <button class="btn primary" @click="onShowNumberClick(product)">
                Показать номер
              </button>
              <button class="btn secondary" @click="onWriteClick(product)" v-if="!isOwnProduct">
                <img src="/src/assets/img/mes.svg" />
              </button>
            </div>
          </div>
          <!-- Видео с этим товаром -->
          <div v-if="allProductVideos.length" class="linked-videos-section">
            <!-- <h3 class="similar-title">Видео</h3> -->
            <div class="videos-grid">
              <div v-for="video in allProductVideos" :key="video.id" class="fav-video-card" >
                <button class="video-fav-btn" :class="{ 'is-favorite': video.isFavorite }"@click.stop="onVideoFavoriteClick(video, $event)" title="Добавить в избранное">
                  <img :src="video.isFavorite ? bookmarkFilledIcon : bookmarkIcon" class="video-fav-icon" alt="bookmark"/>
                </button>
                <div class="fav-video-card_block">
                  <div class="fav-video-preview" @click="router.push({ name: 'shorts', params: { id: video.id } })">
                    <video v-if="video.cdnUrl" :src="video.cdnUrl" preload="metadata" muted playsinline></video>
                    <img v-else :src="video.thumbnail || '/src/assets/img/video/placeholder.svg'" alt="thumbnail"/>
                    <div class="video-overlay">
                      <span class="duration">{{ video.duration || "0:11" }}</span>
                    </div>
                  </div>
                  <div class="fav-video-main">
                    <h3 class="video-title">{{ video.description || 'Без названия' }}</h3>
                    <div class="video-stats">
                      <div class="stat">
                        <img src="/src/assets/img/icons/eye.svg" />
                        {{ video.viewsCount || 0 }}
                      </div>
                      <div class="stat">
                        <img src="/src/assets/img/icons/heart.svg" />
                        {{ video.likes || 0 }}
                      </div>
                      <div class="stat">
                        <img src="/src/assets/img/icons/comment.svg" />
                        {{ video.commentsCount || 0 }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Похожие товары -->
      <div v-if="similarProducts.length" class="similar-products">
        <h3 class="similar-title">Похожие товары</h3>
        <div class="similar-list">
          <div v-for="item in similarProducts" :key="item.id" class="horizontal-card">
            <router-link :to="{ name: 'Product', params: { type: item.category, section: item.section || 'default', id: item.id } }" class="card-link-wrapper">
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
              <img class="card-like" :src="favStore.isFavorite(item.id) ? heartFilled : heart" @click.stop="onLikeClick(item)"/>
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
            <p class="confirm-message">Позвонить <strong>{{ callModalName  }}</strong>?</p>
            <div class="phone-display">{{ formatPhone(callModalPhone) }}</div>
            <div class="confirm-actions">
              <button class="btn-black" @click="handleCall(callModalPhone)">Позвонить</button>
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
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from "vue";
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

import { useSubscriptionStore } from "../stores/subscriptionStore.js";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { geocodeByQuery } from '/src/utils/geocode.js';

import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import { formatDate } from "/src/utils/formatters.js"

import bookmarkIcon from "/src/assets/img/icons/bookmark.svg";
import bookmarkFilledIcon from "/src/assets/img/icons/bookmark-fill.svg";
const favStore = useFavoritesStore();

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const authStore = useAuthStore();
const modal = useModalStore();
const productStore = useProductStore();
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
const isClient = typeof window !== 'undefined';
let productMap = null;
let productPlacemark = null;
let ymapsReady = false;
const callModalPhone = ref('');
const callModalName = ref('');
const linkedVideos = ref([]);
const mapContainer = ref(null);
const productVideoDetails = ref(null);
const localVideoFavCache = ref(new Map());

const loadProductVideoDetails = async () => {
  if (!product.value?.video?.id) {
    productVideoDetails.value = null;
    return;
  }
  try {
    const details = await auth.fetchVideo(product.value.video.id);
    productVideoDetails.value = details || null;
  } catch (e) {
    console.error('Ошибка загрузки деталей видео товара:', e);
    productVideoDetails.value = null;
  }
};
// === ВИДЕО ТОВАРА (из API /adverts/{id}) ===
const productVideo = computed(() => {
  const v = product.value?.video;
  if (!v || !v.cdnUrl) return null;
  return v;
});
const allProductVideos = computed(() => {
  const list = [];
  const productVideoId = productVideo.value?.id;

  if (productVideo.value) {
    const details = productVideoDetails.value;
    const cached = localVideoFavCache.value.get(productVideo.value.id);
    const isFav = cached !== undefined ? cached : (details?.isFavorite ?? false);
    list.push({
      id: productVideo.value.id,
      cdnUrl: productVideo.value.cdnUrl,
      thumbnail: productVideo.value.cdnUrl,
      description: details?.description || 'Видео товара',
      duration: '',
      viewsCount: details?.views || 0,
      likes: details?.likes || 0,
      commentsCount: details?.commentsCount || 0,
      isFavorite: isFav,
      isProductVideo: true,
    });
  }

  linkedVideos.value.forEach(v => {
    if (v.id !== productVideoId) {
      const cached = localVideoFavCache.value.get(v.id);
      list.push({
        ...v,
        isFavorite: cached !== undefined ? cached : (v.isFavorite ?? false),
      });
    }
  });

  return list;
});

const loadLinkedVideos = async () => {
  if (!product.value?.sellerId || !product.value?.id) return;
  try {
    const allVideos = await auth.fetchVideosByUser(product.value.sellerId);
    linkedVideos.value = allVideos.filter(v => v.productId === product.value.id);
  } catch (e) {
    console.error('Ошибка загрузки видео для товара:', e);
    linkedVideos.value = [];
  }
};
const onVideoFavoriteClick = async (video, event) => {
  event.stopPropagation();
  if (!authStore.isAuthenticated) {
    modal.openLogin();
    notify("Авторизуйтесь, чтобы добавить в избранное");
    return;
  }

  const currentlyFav = video.isFavorite ?? false;
  const nextFav = !currentlyFav;

  localVideoFavCache.value.set(video.id, nextFav);
  if (video.isProductVideo && productVideoDetails.value) {
    productVideoDetails.value.isFavorite = nextFav;
  } else {
    const linked = linkedVideos.value.find(v => v.id === video.id);
    if (linked) linked.isFavorite = nextFav;
  }

  try {
    if (currentlyFav) {
      await authStore.unmarkAsFavorite(video.id);
    } else {
      await authStore.markAsFavorite(video.id);
    }
    notify(currentlyFav ? "Удалено из избранного" : "Добавлено в избранное");
    localVideoFavCache.value.delete(video.id);
  } catch (e) {
    localVideoFavCache.value.delete(video.id);
    if (video.isProductVideo && productVideoDetails.value) {
      productVideoDetails.value.isFavorite = currentlyFav;
    } else {
      const linked = linkedVideos.value.find(v => v.id === video.id);
      if (linked) linked.isFavorite = currentlyFav;
    }
    notify("Ошибка избранного", "error");
  }
};
const isOwnProduct = computed(() => {
  if (!product.value?.sellerId || !authStore.user?.id) return false;
  return String(product.value.sellerId) === String(authStore.user.id);
});
function waitForYmaps(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(resolve);
      return;
    }
    const start = Date.now();
    const check = () => {
      if (window.ymaps) {
        window.ymaps.ready(resolve);
      } else if (Date.now() - start > timeout) {
        reject(new Error('Yandex Maps API не загрузился'));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

function destroyProductMap() {
  if (!isClient) return;
  if (productMap) {
    try { productMap.destroy(); } catch (e) {}
    productMap = null;
    productPlacemark = null;
  }
}

function initProductMap(coords) {
  if (!isClient || !window.ymaps || !mapContainer.value) {
    console.warn('Карта недоступна: нет DOM или API');
    return;
  }

  const center = Array.isArray(coords) && coords.length === 2
    ? [Number(coords[0]), Number(coords[1])]
    : coords;

  if (!center || Math.abs(center[0]) > 90 || Math.abs(center[1]) > 180) {
    console.error('Невалидные координаты:', center);
    return;
  }

  window.ymaps.ready(() => {
    try {
      if (productMap && productMap.getContainer() !== mapContainer.value) {
        destroyProductMap();
      }
      if (productMap) {
        productMap.setCenter(center, 15);
        if (productPlacemark) {
          productPlacemark.geometry.setCoordinates(center);
        } else {
          productPlacemark = new window.ymaps.Placemark(center, {}, {
            preset: 'islands#redIcon'
          });
          productMap.geoObjects.add(productPlacemark);
        }
        productMap.container.fitToViewport();
        return;
      }
      productMap = new window.ymaps.Map(mapContainer.value, {
        center: center,
        zoom: 15,
        controls: ['zoomControl']
      }, {
        copyrightLogoVisible: false,
        copyrightProvidersVisible: false,
        copyrightUaVisible: false,
        suppressMapOpenBlock: true
      });

      productPlacemark = new window.ymaps.Placemark(center, {}, {
        preset: 'islands#redIcon'
      });
      productMap.geoObjects.add(productPlacemark);

      setTimeout(() => {
        if (productMap && productMap.container) {
          productMap.container.fitToViewport();
        }
      }, 100);
    } catch (e) {
      console.error('Ошибка создания карты:', e);
    }
  });
}
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
  return seller.value?.rating || 0;
});
// === УНИВЕРСАЛЬНАЯ НОРМАЛИЗАЦИЯ КООРДИНАТ ===
const normalizeCoords = (coords) => {
  if (!coords) return null;

  let lat, lng;
  if (Array.isArray(coords)) {
    [lat, lng] = coords.map(Number);
  } else {
    lat = Number(coords.lat);
    lng = Number(coords.lng);
  }

  if (isNaN(lat) || isNaN(lng)) return null;
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }

  return [lat, lng];
};

// === ГЕОКОДИРОВАНИЕ ===
const resolveCoordinates = async () => {
  if (hasCoordinatesFromApi.value) {
    const norm = normalizeCoords(product.value.coordinates);
    if (norm) {
      mapCoordinates.value = norm;
      nextTick(() => setTimeout(() => initProductMap(mapCoordinates.value), 300));
    } else {
      mapCoordinates.value = null;
    }
    return;
  }

  const address = product.value?.address || product.value?.city;
  if (!address) {
    mapCoordinates.value = null;
    return;
  }

  isGeocoding.value = true;
  try {
    await waitForYmaps();
    let res = await window.ymaps.geocode(address, { results: 1 });
    let first = res.geoObjects.get(0);
    if (!first && address.includes(',')) {
      const cityOnly = address.split(',')[0].trim();
      res = await window.ymaps.geocode(cityOnly, { results: 1 });
      first = res.geoObjects.get(0);
    }
    if (!first && product.value?.city && product.value.city !== address) {
      res = await window.ymaps.geocode(product.value.city, { results: 1 });
      first = res.geoObjects.get(0);
    }

    if (first) {
      const coords = first.geometry.getCoordinates();
      console.log('[Geocode] Адрес:', address, '→', coords);
      mapCoordinates.value = coords;
      nextTick(() => setTimeout(() => initProductMap(coords), 300));
    } else {
      console.warn('[Geocode] Не найдено:', address);
      mapCoordinates.value = null;
    }
  } catch (e) {
    console.error('Ошибка геокодирования:', e);
    try {
      const result = await geocodeByQuery(address);
      const coords = normalizeCoords(result?.coordinates);
      if (coords) {
        mapCoordinates.value = coords;
        nextTick(() => setTimeout(() => initProductMap(coords), 300));
      } else {
        mapCoordinates.value = null;
      }
    } catch (e2) {
      mapCoordinates.value = null;
    }
  } finally {
    isGeocoding.value = false;
  }
};

// === ТИП ТОВАРА ===
const productSection = computed(() => {
  const section = product.value?.section;
  const subcategory = product.value?.subcategory;

  const subToSection = {
    // Недвижимость
    'uchastok': 'uchastok',
    'land': 'uchastok',
    'office': 'office',
    'commercial': 'office',
    'apartments': 'apartments',
    'flat': 'apartments',
    'house': 'house',
    'cottage': 'house',

    // Транспорт
    'cars': 'cars',
    'auto': 'cars',
    'moto': 'moto',
    'yachts': 'yachts',
    'boats': 'yachts',

    // Работа
    'jobs': 'jobs',
    'vacancy': 'jobs',
    'resume': 'resume',

    // Животные
    'pets': 'pets',
    'animals': 'pets',

    // Бизнес
    'ready_business': 'ready_business',
    'business': 'ready_business',

    // Туризм
    'tours': 'tours',
    'travel': 'tours',

    // Услуги
    'all_services': 'uslugi',
  };

  // Если категория — услуги, сразу используем группу uslugi
  if (product.value?.category === 'uslugi') {
    return 'uslugi';
  }

  return subToSection[subcategory]
    || subToSection[section]
    || section
    || 'apartments';
});

const fieldGroups = computed(() => {
  if (!product.value) return [];
  return getFieldGroups(productSection.value);
});
const TWO_COLUMN_SECTIONS = ['cars', 'moto', 'yachts'];

const isTwoColumnGrid = computed(() =>
  TWO_COLUMN_SECTIONS.includes(productSection.value)
);
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
      avatar: '/img/users/mask-avatar.png',
      phone: '',
    };
  } catch (e) {
    console.error("Ошибка загрузки продавца:", e);
    seller.value = {
      id: sellerId,
      name: 'Продавец',
      type: 'private',
      avatar: '/img/users/mask-avatar.png',
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
  productVideoDetails.value = null;

  try {
    // const cached = productStore.products.find(p => String(p.id) === String(id));
    
    //   if (cached && (cached.images?.length || cached.pictureUrls?.length)) {
    //     product.value = {
    //       ...cached,
    //       images: cached.images || cached.pictureUrls || [],
    //       image: cached.image || cached.pictureUrls?.[0] || '/src/assets/img/placeholder.png',
    //       attributes: cached.attributes || {},
    //       coordinates: cached.coordinates || null,
    //       address: raw.address || raw.city || raw.location || '',
    //     };
    //   } else {
        const data = await auth.getAdvertById(id);
        const raw = Array.isArray(data) ? data[0] : data;

        if (!raw || !raw.id) {
          notify("Объявление не найдено", "error");
          product.value = null;
          isReady.value = true;
          return;
        }

        const pics = Array.isArray(raw.pictureUrls) 
          ? raw.pictureUrls 
          : raw.pictureUrls 
            ? [raw.pictureUrls] 
            : []

        product.value = {
          id: raw.id,
          title: raw.title || 'Без названия',
          price: Number(raw.price) || 0,
          description: raw.description || '',
          city: raw.city || raw.address || '',
          address: raw.address || raw.city || '',
          coordinates: raw.coordinates || null,
          category: raw.category || 'tovary',
          section: raw.section || raw.subCategory || 'default',
          subcategory: raw.subCategory || raw.subcategory || '',
          sellerId: raw.userId || raw.sellerId,
          images: pics,
          image: pics[0] || raw.thumbnailUrl || '',
          attributes: raw.attributes || raw || {},
          ...raw
        };
      // }

    if (product.value?.sellerId) {
      await Promise.all([
        loadSeller(product.value.sellerId),
        reviewStore.fetchReviewsBySeller(product.value.sellerId),
      ]);
    }
    await resolveCoordinates();
    activeImage.value = product.value.images?.[0] || product.value.image || '';
    await Promise.all([
      loadProductVideoDetails(),
      loadLinkedVideos(),
    ]); 
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
    await productStore.fetchAdverts({
      category: product.value.category,
      section: product.value.section,
      subCategory: product.value.subcategory || product.value.section,
      city: product.value.city,
      take: 10
    }, true);
    
    const currentId = String(product.value.id);
    const currentSection = product.value.section;
    const currentSubcategory = product.value.subcategory;
    const currentCity = product.value.city;

    // Фильтруем похожие: тот же section/subcategory + тот же город
    const filtered = productStore.products.filter(p => {
      if (String(p.id) === currentId) return false;

      const pSection = p.section || p.subcategory || '';
      const pSubcategory = p.subcategory || '';
      
      // Совпадение по секции ИЛИ подкатегории
      const sectionMatch = pSection === currentSection || pSubcategory === currentSubcategory;
      
      // Город
      const cityMatch = !currentCity || (p.city || '').toLowerCase() === currentCity.toLowerCase();

      return sectionMatch && cityMatch;
    }).slice(0, 5);

    similarProducts.value = await Promise.all(
      filtered.map(async (ad) => {
        const sellerId = ad.userId || ad.sellerId;
        let seller = null;

        if (sellerId) {
          try {
            seller = await auth.fetchProfileById(sellerId);
          } catch (e) {
            console.warn(`Профиль продавца ${sellerId} не загрузился:`, e);
          }
        }

        return {
          id: ad.id,
          title: ad.title || 'Без названия',
          price: ad.price,
          city: ad.city || '',
          category: ad.category,
          section: ad.section,
          subcategory: ad.subcategory,
          images: ad.images || ad.pictureUrls,
          image: ad.image || ad.pictureUrls?.[0] || ad.thumbnailUrl || '/src/assets/img/placeholder.png',
          description: ad.description || '',
          sellerId: sellerId,
          seller: seller || {
            name: 'Продавец',
            avatar: '/img/users/mask-avatar.png',
            phone: ''
          }
        };
      })
    );

  } catch (e) {
    console.error('Ошибка загрузки похожих:', e);
    similarProducts.value = [];
  }
};
const getSimilarImageUrl = (item) => {
  if (item.images?.length) return item.images[0];
  if (item.pictureUrls?.length) return item.pictureUrls[0];
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
const formatPrice = (price) => {const num = Number(price); return num ? num.toLocaleString("ru-RU") : "0";};

const openFullGallery = (index = 0) => {
  if (!product.value?.images?.length) return;
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
  checkAuthAndRun(async () => {
    await favStore.toggleAdvertFavorite(item.id);
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
const onShowNumberClick = (item) => {
  const target = item || product.value;
  const phone = target?.seller?.phone || seller.value?.phone;
  const name = target?.seller?.name || seller.value?.name || 'Продавцу';
  if (!phone) {
    notify('Номер телефона не указан', 'error');
    return;
  }
  checkAuthAndRun(() => { 
    callModalPhone.value = phone;
    callModalName.value = name;
    showCallModal.value = true; 
  }, "Войдите, чтобы увидеть номер телефона");
};
const onWriteClick = async (item) => {
  const targetId = item?.sellerId || item?.seller?.id || product.value?.sellerId;
  const productId = item?.id || product.value?.id || null; 
  if (!targetId) {
    notify('Продавец не найден', 'error');
    return;
  }
  checkAuthAndRun(async () => {
    try {
      const roomId = await auth.createPrivateRoom(targetId, productId);
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
watch(mapContainer, (el) => {
  if (el && mapCoordinates.value && window.ymaps) {
    initProductMap(mapCoordinates.value);
  }
});
onMounted(async () => {
  if (isClient && window.ymaps) {
    try { await waitForYmaps(); } catch (e) { console.warn('Карта недоступна:', e); }
  }
  Fancybox.bind("[data-fancybox='gallery']", { Hash: false });
});

watch(() => product.value?.title, (newTitle) => {
  if (newTitle) {
    document.title = `${newTitle} — купить на Матрешка`;
  }
}, { immediate: true });
onBeforeUnmount(() => {
  destroyProductMap();
});
</script>
<style scoped>
.service-item {margin-bottom: 0.25rem;}
.product-layout { display: grid; gap: 3.125rem; grid-template-columns: repeat(2, 1fr);}
.product-left { flex: 1; background-color: white; border-radius: 1.25rem; padding: 1.375rem 1.875rem; width: 54.75rem; position: relative;}
.product-right { min-width: 20.813rem; height: fit-content;}
/* Заголовок */
.product-title { margin-bottom: 1.563rem; font-weight: 700; display: flex; align-items: start; justify-content: space-between; }
.product-title{
  display: inline-block;
  text-transform: lowercase;
}
.product-title::first-letter { text-transform: uppercase;}
.product-title .card-like{ width: 2.188rem; height: 1.938rem; z-index: 1;}
/* Галерея */
.gallery { gap: 2rem; display: grid; grid-template-columns: repeat(1, 36.875rem 14.375rem);}
.main-image { width: 36.875rem; height: 20.625rem; object-fit: cover; border-radius: 0.625rem; cursor: pointer;}
.thumbs { width: 12.5rem; display: grid; gap: 0.875rem; grid-template-columns: repeat(2, 5.625rem); grid-template-rows: repeat(4, 4.25rem); grid-auto-flow: column; overflow: hidden;}
.thumbs img { width: 5.625rem; height: 4.25rem; object-fit: cover; cursor: pointer; border-radius: 0.313rem; opacity: 0.6; transition: .3s;}
.thumbs img.active { opacity: 1; border: 2px solid var(--btn-bg);}
/* Детали */
.product-details { margin-top: 2.188rem;}
.product-details h3{ font-weight: 600; font-size: 1.5rem; margin-bottom: 0.625rem;}
/* .details-grid { display: grid; grid-template-columns: repeat(2, 20.75rem); gap: 0.625rem; font-size: 1.25rem;}
.detail-row { display: flex; gap: 0.625rem;} */
.label { color: #8E8C8C; font-size: 1.25rem;}
.value { font-size: 1.25rem;}
.product-description { margin-top: 2.188rem;}
.product-description h3{ font-weight: 600; font-size: 1.5rem; margin-bottom: 1.5rem;}
.product-description p{ font-size: 1.35rem;}
.price-card { background-color: white;border-radius: 1.25rem; padding: 1.063rem 2rem 1.375rem 1.625rem;}
.price-extra { color: #b7b7b7; font-size: 1rem; font-size: 1rem; font-weight: 400;}
.seller-card__btns{ display: flex; margin-top: 1.313rem; gap: 1rem;}
.price { font-size: 1.5rem; padding: 0.438rem 1rem; background: var(--btn-bg); font-weight: 700; width: fit-content; color: var(--bg-defort); border-radius: 0.625rem;}
.location { margin: 1.3755rem 0 0; color: #242424; font-size: 1.25rem; font-weight: 700;}
.data{font-size: .8rem; color: #888; text-align: right; margin-top: .5rem;}
.btn.secondary { background: #F5F5F5; width: 4.188rem; height: 3.438rem; display: flex; align-items: center; justify-content: center; border-radius: 1.25rem;}
.seller-card {margin-top: 0.625rem; background-color: white; border-radius: 1.25rem; padding:1.25rem 1.25rem 1.25rem 1.875rem;}
.seller { display: flex; gap: 1rem;}
.avatar { width: 5.125rem; height: 5.125rem; border-radius: 50%; object-fit: cover; image-rendering: auto; transform: translateZ(0); backface-visibility: hidden; -webkit-mask-image: -webkit-radial-gradient(white, black);}
.name{font-size: 2rem; font-weight: 700; color: #242424; }
.name p{font-size: 1rem; color: #858685; margin-top: 0.25rem;margin-bottom: 0.875rem; font-weight: 400;}
.rating{ font-size: 1.25rem; font-weight: 700; margin-bottom: .5rem; transition: opacity .3s; display: flex;align-items: flex-start; gap: 0.25rem; color: #262626;}
.rating .stars {display: inline-flex;gap: 0.125rem;margin-left: 0.25rem;vertical-align: middle;}
.star-icon {width: 1.25rem;height: 1.25rem;}
.name:hover{ opacity: 0.6;}
.seller-card__block{ font-size: 1.25rem;width: 20rem;}
.type{ margin-bottom: 0.875rem; margin-top: 0.438rem;font-size: 1.25rem; font-weight: 700;}
.subscribe{ color: var(--btn-bg);transition:opacity 0.3s}
.subscribe:hover{ opacity: 70%;}
.primary{ background-color: var(--btn-bg); font-size: 1.25rem; color: white; width: 14.375rem; height: 3.438rem; text-align: center; border-radius: 1.25rem;}
.secondary img{ width: 2.575rem; height: 2.525rem;}
.is-active{ color: red;}
.confirm-call-card { background: white; padding: 2rem 1.75rem 1.475rem 1.75rem; border-radius: 2.188rem; max-width: 39.063rem; width: 100%; text-align: left;}
.confirm-message { font-size: 1.75rem; color: #000; margin-bottom: 1.25rem;}
.confirm-actions { display: flex; justify-content: center; gap: 1.25rem;}
.btn-black { text-align: center; width: 10.375rem; height: 3.563rem; background: #000; color: #fff; border: none; border-radius: 1rem; font-weight:500; cursor: pointer; font-size: 1.25rem;}
.btn-gray { width: 10.375rem; height: 3.563rem; text-align: center; background: #D8D8D8;  color: #000; border: none; border-radius: 1rem; font-weight: 500; cursor: pointer; font-size: 1.25rem;}
/* Детали */
.details-grid { display: grid; grid-template-columns: 1fr; row-gap: 0.688rem; font-size: 1.25rem; }
.details-grid--two-cols { grid-template-columns: repeat(2, 1fr); column-gap: 3rem; }
.detail-row { display: flex; align-items: center; gap: 0.688rem; }
.detail-row.full-width-row { grid-column: 1 / -1; flex-direction: column; align-items: flex-start; gap: 0.75rem; border-bottom: none; }
.details-chips-group {display: flex;flex-wrap: wrap;gap: 0.75rem;width: 100%;}
@media (max-width: 77rem) { .product-left { width: 47.75rem; } .main-image{ width: 100%;} .gallery{ grid-template-columns: repeat(1, 29.8rem 12.375rem);}}
.details-group { margin-bottom: 2rem;}
.details-group h3 { font-weight: 600; font-size: 1.5rem; margin-bottom: 2.5rem;}

/* Чипсы */
/* .details-chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
} */
 /* background-color: #e8e8e8; color: #666; */
.detail-chip-item {  background-color: #5b9279; color: white; padding: 0.875rem 1.375rem; min-width: 11.813rem; border-radius: 0.938rem; font-size: 1.25rem; transition: all 0.2s;}
/* .chip-active */
.detail-chip-item { background-color: #5b9279; color: white;}
.product-address-section { margin-top: 2.188rem; padding: 1.5rem; background: white; border-radius: 1.25rem;}
.product-address-section h3 { font-weight: 600; font-size: 1.5rem; margin-bottom: 1rem;}
.address-text { font-size: 1.15rem; color: #333; margin-bottom: 1rem;}
.product-map { width: 100%; height: 18rem; border-radius: 0.625rem; overflow: hidden; margin-top: 0.75rem;}
.map-pin { font-size: 2rem; transform: translate(-50%, -100%);}
.similar-products { margin-top: 3rem; margin-bottom: 3rem; width: 54.75rem;}

.similar-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem;}
.similar-list { display: flex; flex-direction: column; gap: 0.625rem;}
.horizontal-card { display: flex; gap: 1.25rem; background: white; padding: 1.25rem; border-radius: 1.25rem; width: 54.75rem;}
.card-img { width: 7.875rem; height: 11.188rem; object-fit: cover; border-radius: 1.25rem;}
.card-title { font-weight: 400; width: 90%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3rem;}
.card-price-row { display: flex; align-items: baseline;gap: 0.6rem;margin: 0.5rem 0;}
.card-price { font-size: 1.45rem; font-weight: 600; color: #000;}
.card-location { color: #666; font-size: 0.9rem;}
.card-description {color: #7c7c7c;font-size: 0.938rem;margin-top: 0.5rem;margin-bottom: 0.5rem; display: -webkit-box;-webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;}
.card-footer-info { margin-top: auto; color: #b0b0b0; font-size: 0.875rem; text-transform: capitalize;}
.card-content__rigth { display: none; transition: all 0.3s;}
.horizontal-card:hover .card-content__rigth { display: block;}
.card-content__rigth-btns { display: grid; align-content: center; align-items: center; height: 100%; width: 12.813rem; gap: 0.688rem;}
.card-like { position: absolute; top: 1.375rem; right: 1.875rem; width: 1.563rem; height: 1.5rem;}
.card-content { display: flex; flex-direction: column; width: 28rem; min-height: 100%; position: relative;}
.card-btn { background: var(--btn-bg); color: white; padding: 0.5rem 0; text-align: center; border-radius: 0.313rem; border: none; cursor: pointer;}
.card-btn:last-child { background-color: white; border: 1px solid var(--btn-bg); color: var(--btn-bg);}
.product-map { width: 100%; height: 18.75rem; border-radius: 0.625rem; overflow: hidden; background: #f5f5f5;}
.linked-videos-section {margin-top: 2.063rem;}
.videos-grid {display: grid;grid-template-columns: repeat(1, 1fr);gap: 1.25rem;}
.fav-video-card {background: #fff;padding: 1.25rem 1.5rem 1.375rem 1.5rem;border-radius: 1.25rem;position: relative;overflow: hidden; cursor: pointer;transition: transform 0.2s ease, box-shadow 0.2s ease;}
.fav-video-card:hover {box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.06);}
.fav-video-card_block {width: 18.75rem;}
.fav-video-preview {width: 100%;height: 27.938rem; aspect-ratio: 9/16;flex-shrink: 0;position: relative;overflow: hidden;}
.fav-video-preview img,.fav-video-preview video {width: 100%;height: 100%;border-radius: 1.25rem;object-fit: cover;}
.author-avatar {width: 3.5rem !important;height: 3.5rem !important;border-radius: 0 3.125rem 0 1.25rem !important;position: absolute;bottom: -0.5rem;left: -0.5rem;object-fit: cover;border: 2px solid #fff;z-index: 2;}
.video-overlay {position: absolute;bottom: 0;right: 0;color: #fff;padding: 0.125rem 0.5rem;border-radius: 0.375rem;font-size: 0.75rem;font-weight: 500;z-index: 1;}
.duration{bottom: 0; right: 0;}
.fav-video-main {width: 100%;display: grid;margin-top: 1.25rem;}
.video-title {font-size: 1rem;font-weight: 700;margin-bottom: 1.5rem;display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;overflow: hidden;text-transform: lowercase;line-height: 1;}
.video-title::first-letter {text-transform: uppercase;}
.video-stats {display: flex; justify-content: center;gap: 1.5rem;}
.stat {display: flex; align-items: flex-end;gap: 0.5rem;font-size: 1rem; font-weight: 700;}
.stat img {width: 1.563rem;height: 1.375rem;}
/* Кнопка */
.video-fav-btn {position: absolute;top: 0;right: 0;width: 4rem;height: 4.5rem;background: #8E8C8C;border: none;border-radius: 0 0 0 1.25rem;display: flex;align-items: center;justify-content: center;cursor: pointer;z-index: 3;padding: 1rem 0.75rem;box-shadow: 0 2px 8px rgba(0,0,0,0.08);transition: transform 0.2s ease, background 0.2s ease;}
.video-fav-btn.is-favorite {background: #64A07A;}
.video-fav-btn.is-favorite:hover {background: #64A07A;}
.video-fav-icon {width: 2rem;height: 2rem;filter: brightness(0) saturate(100%) invert(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3));transition: filter 0.2s ease, transform 0.2s ease;}
.video-fav-btn:hover .video-fav-icon {filter: brightness(0) saturate(100%) invert(100%) drop-shadow(0 1px 4px rgba(0,0,0,0.4));}
.video-fav-btn.is-favorite .video-fav-icon {filter: brightness(0) saturate(100%) invert(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.25));}
.video-fav-btn.is-favorite:hover .video-fav-icon {filter: brightness(0) saturate(100%) invert(100%) drop-shadow(0 1px 4px rgba(0,0,0,0.35));}
@media (max-width: 77rem) {.videos-grid {grid-template-columns: repeat(3, 1fr);}
.similar-products .horizontal-card{width: 47.75rem;}  
.similar-products .card-content{width: 21.125rem;}}
</style>