<template>
  <div class="general-container favorites-page">
    <div class="favorites-header">
        <h2 class="page-title">Избранные
          <div class="custom-select-wrapper" v-click-outside="closeDropdown">
            <div class="select-header" @click="isDropdownOpen = !isDropdownOpen">
              <span>{{ selectedType === 'videos' ? 'Мини-видео' : 'Объявления' }}</span>
              <span class="arrow-icon" :class="{ 'is-rotated': isDropdownOpen }"></span>
            </div>
            <transition name="fade">
              <div v-if="isDropdownOpen" class="select-options">
                <div class="option" @click="changeType('videos')">Мини-видео</div>
                <div class="option" @click="changeType('items')">Объявления</div>
              </div>
            </transition>
          </div>
        </h2>
    </div>
    <div class="favorites-content">
      <div v-if="isLoading" class="loading-state">Загрузка...</div>
      <template v-else-if="currentItems.length > 0">
        <!-- Тип: Видео -->
        <template v-if="selectedType === 'videos'">
          <div v-for="video in currentItems" :key="video.id" class="fav-video-card">
            <div class="fav-video-card_block">
              <div class="fav-video-preview">
                <video
                  v-if="video.cdnUrl"
                  :src="video.cdnUrl"
                  preload="metadata"
                  muted
                  playsinline
                ></video>
                <img v-else :src="video.thumbnail || '/src/assets/img/video/placeholder.svg'" alt="thumbnail" />
              </div>
              <div class="fav-video-main">
                <router-link :to="{ name: 'shorts', params: { id: video.id } }">
                  <h3 class="video-title">{{ video.description || 'Без названия' }}</h3>
                </router-link>
                <div class="video-stats">
                  <div class="stat"><img src="/src/assets/img/icons/eye.svg" /> {{ video.views || 0 }}</div>
                  <div class="stat"><img src="/src/assets/img/icons/heart.svg" /> {{ video.likes || 0 }}</div>
                  <div class="stat"><img src="/src/assets/img/icons/comment.svg" /> {{ video.commentsCount || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="fav-video-right">
              <div class="fav-icon-active" @click="removeFromFavorites(video.id)">
                <img src="/src/assets/img/icons/heart-filled.svg" />
              </div>
              <div class="author-info">
                <img :src="video.author?.avatar || '/img/users/mask-avatar.png'" class="author-avatar" />
                <span class="author-name">{{ video.author?.username || 'Пользователь' }}</span>
              </div>
              <div class="action-btns">
                <router-link :to="{ name: 'shorts', params: { id: video.id } }">
                  <button class="btn btn-green">Посмотреть видео</button>
                </router-link>
              </div>
            </div>
          </div>
        </template>
        <!-- Тип: Объявления -->
        <template v-else>
          <div v-for="item in currentItems" :key="item.id" class="fav-ad-horizontal">
            <div class="ad-img-container">
              <router-link :to="productLink(item)">
                <img :src="item.image || '/src/assets/img/placeholder.png'" class="ad-main-img" />
              </router-link>
            </div>
            <div class="ad-content-info">
              <div class="ad-title-row">
                <router-link :to="productLink(item)">
                  <h3 class="ad-title">{{ item.title }}</h3>
                </router-link>
                <img
                  src="/src/assets/img/icons/heart-filled.svg"
                  class="fav-heart"
                  @click.stop="removeFromFavorites(item.id)"
                />
              </div>
              <div class="ad-price">{{ item.price.toLocaleString() }} ₽</div>
              <div class="ad-desc">{{ item.description }}</div>
              <div class="ad-location">
                <img src="/src/assets/img/icons/location-pin.svg" class="pin" />
                {{ item.address }}
              </div>
              <div class="ad-details-tags">
                <span>{{ getCategoryName(item.category) }}</span>
              </div>
            </div>
            <div class="ad-seller-actions">
              <div class="seller-brief">
                <img :src="item.seller?.avatar || '/img/users/mask-avatar.png'" class="seller-avatar" />
                <span class="seller-name">{{ item.seller?.name || 'Продавец' }}</span>
              </div>
              <div class="action-buttons" v-if="item.sellerId !== authStore.user?.id">
                <button class="btn btn-green" @click="onWriteClick(item)">Написать</button>
                <button class="btn btn-white" @click="onShowPhone(item)">Показать номер</button>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Пустое состояние -->
      <div v-else class="empty-messages">
        <h3>В избранном пока ничего нет</h3>
      </div>
    </div>

    <!-- Модалка звонка -->
    <Transition name="fade">
      <div v-if="showCallModal" class="modal-overlay" @click.self="showCallModal = false">
        <div class="confirm-call-card">
          <p class="confirm-message">
            Позвонить <strong>{{ callModalName }}</strong>?
          </p>
          <div class="phone-display">
            {{ formatPhone(callModalPhone) }}
          </div>
          <div class="confirm-actions">
            <button class="btn-black" @click="handleCall">Позвонить</button>
            <button class="btn-gray" @click="showCallModal = false">Отмена</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "/src/stores/authStore.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { notify } from "/src/utils/notify.js";
import { categories } from "/src/data/categories.js";

const router = useRouter();
const authStore = useAuthStore();
const favStore = useFavoritesStore();
const modal = useModalStore();
const enrichedItems = ref([]);

const isDropdownOpen = ref(false);
const selectedType = ref('videos');
const isLoading = ref(false);
const showCallModal = ref(false);
const callModalPhone = ref('');
const callModalName = ref('');

const closeDropdown = () => { isDropdownOpen.value = false; };

const currentItems = computed(() => {
  if (selectedType.value === 'videos') {
    return authStore.favoriteVideos;
  }
  return enrichedItems.value;
});

/** Ссылка на карточку товара (как в ProductPage.vue) */
const productLink = (item) => ({
  name: 'Product',
  params: {
    type: item.category,
    section: item.section || item.subCategory || 'default',
    id: item.id
  }
});

/** Форматирование телефона (как в ProductPage.vue) */
const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d|7|8)(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  return phone;
};

const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
  if (!authStore.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};

const loadData = async () => {
  if (!authStore.isAuthenticated) {
    notify('Войдите, чтобы увидеть избранное');
    return;
  }

  isLoading.value = true;
  enrichedItems.value = [];
  try {
    if (selectedType.value === 'videos') {
      await authStore.fetchFavorites(authStore.user?.id);
    } else {
      await favStore.fetchAdvertFavorites();
      const items = favStore.advertFavorites || [];
      enrichedItems.value = await Promise.all(
        items.map(async (fav) => {
          const id = fav.id || fav.advertId;
          if (!id) return fav;
          let fullAd = null;
          let seller = null;
          try {
            fullAd = await authStore.getAdvertById(id);
          } catch (e) {
            console.error('Ошибка загрузки товара:', e);
          }

          const sellerId = fullAd?.userId || fullAd?.sellerId || fav.sellerId || fav.userId;
          if (sellerId) {
            try {
              seller = await authStore.fetchProfileById(sellerId);
            } catch (e) {
              console.error('Ошибка загрузки профиля:', e);
            }
          }

          const pics = Array.isArray(fullAd?.pictureUrls)
            ? fullAd.pictureUrls
            : fullAd?.pictureUrls ? [fullAd.pictureUrls] : [];

          return {
            ...fav,
            id: fullAd?.id || fav.id,
            title: fullAd?.title || fav.title,
            price: Number(fullAd?.price) || Number(fav.price) || 0,
            image: pics[0] || fullAd?.thumbnailUrl || fav.image || '/src/assets/img/placeholder.png',
            category: fullAd?.category || fav.category,
            section: fullAd?.section || fullAd?.subCategory || fav.section || 'default',
            subcategory: fullAd?.subCategory || fav.subcategory || '',
            address: fullAd?.address || fullAd?.city || fav.address || '',
            city: fullAd?.city || fav.city || '',
            sellerId: sellerId,
            description: fullAd?.description || fav.description || '',
            seller: seller || fav.seller || null
          };
        })
      );
    }
  } catch (e) {
    notify('Не удалось загрузить избранное', 'error');
  } finally {
    isLoading.value = false;
  }
};
const getCategoryName = (slug) => {
  if (!slug) return '';
  const cat = categories.find(c => c.slug === slug);
  return cat?.name || slug;
};
const removeFromFavorites = async (id) => {
  if (!authStore.isAuthenticated) return;

  try {
    if (selectedType.value === 'videos') {
      await authStore.unmarkAsFavorite(id);
    } else {
      await favStore.removeAdvertFavorite(id);
    }
    notify('Удалено из избранного');
  } catch (e) {
    notify('Не удалось удалить', 'error');
  }
};

const changeType = (type) => {
  selectedType.value = type;
  isDropdownOpen.value = false;
  loadData();
};

/** Открыть чат с продавцом (как в ProductPage.vue) */
const onWriteClick = async (item) => {
  if (!item?.sellerId) {
    notify('Продавец не найден', 'error');
    return;
  }
  checkAuthAndRun(async () => {
    try {
      const roomId = await authStore.createPrivateRoom(item.sellerId);
      router.push({ name: 'ChatDetail', params: { id: roomId } });
    } catch (err) {
      notify("Не удалось открыть чат", "error");
    }
  }, "Войдите, чтобы написать сообщение");
};

/** Показать номер продавца (как в ProductPage.vue) */
const onShowPhone = (item) => {
  if (!item?.seller?.phone) {
    notify('Номер телефона не указан', 'error');
    return;
  }
  checkAuthAndRun(() => {
    callModalName.value = item.seller.name || 'Продавцу';
    callModalPhone.value = item.seller.phone;
    showCallModal.value = true;
  }, "Войдите, чтобы увидеть номер телефона");
};

const handleCall = () => {
  if (callModalPhone.value) {
    window.location.href = `tel:${callModalPhone.value}`;
  }
  showCallModal.value = false;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.favorites-header {display: grid;align-items: center;width: 100%;}
.custom-select-wrapper {position: relative;width: 15rem;display: flex;justify-content: flex-end;width: 100%;}
.page-title {width: 100%;padding: 1.125rem 1.25rem;display: flex;justify-content: space-between;align-items: center;gap: 1rem;}
.custom-select-wrapper {position: relative;width: 15.188rem; display: flex;justify-content: flex-end;}
.select-header span{font-size: 1.25rem;font-weight: 700;}
.arrow-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-right: 0.125rem solid var(--bg-defort);
  border-bottom: 0.125rem solid var(--bg-defort);
  transform: translateY(-0.25rem) rotate(45deg);
  transition: transform 0.3s ease;
  flex-shrink: 0; 
  margin-right: 0;
}
.arrow-icon.is-rotated {transform: translateY(0.25rem) rotate(-135deg);}
.is-rotated { transform: rotate(180deg); }
.select-header {
  background: var(--btn-bg);
  color: var(--bg-defort);
  padding: 1.125rem 1.5rem;
  border-radius: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
  gap: 1rem;
  position: relative;
}
.select-options {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  width: 100%;
  background: #518E68;
  border-radius: 1.25rem;
  overflow: hidden;
  z-index: 10;
  box-shadow: none;
}
.option {padding: 1.125rem 1.5rem;cursor: pointer;font-size: 1.25rem;color: var(--bg-defort);font-weight: 700;}
.option:hover {background: rgba(0, 0, 0, 0.08); }
.favorites-content{margin-top: 2.5rem;}
.fav-video-card {display: flex;gap: 1.5rem;justify-content: space-between;background: #fff;padding: 0.625rem 0.938rem;border-radius: 1.25rem;/* margin-bottom: 1.25rem; */box-shadow: 0 0.25rem 0.938rem rgba(0,0,0,0.03);}
.fav-video-card_block{display: flex; gap: 1.25rem;width: 100%;}
.fav-video-preview {width: 12.5rem;height: 15.625rem;flex-shrink: 0;}
.fav-video-preview img,.fav-video-preview video{width: 100%; height: 100%;border-radius: 0.938rem;object-fit: cover;}
.fav-video-main { width: 61%; display: grid;}
.video-title {
  font-size: 1.25rem;
  margin-bottom: 0.625rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3.6rem;
}
.video-stats {display: grid;gap: 0.313rem;margin-bottom: 0.625rem;}
.stat {display: flex; align-items: center; gap: 0.4rem;font-size: 0.875rem; color: #333}
.stat img { width: 1.688rem; }
.linked-product-box {
  background: #FBFBFB;
  border: 0.063rem solid #CCCCCC;
  border-radius: 0.938rem;
  padding: 0.313rem;
  display: flex;
  gap: 0.625rem;
  position: relative;
  width: 80%;
}
.prod-thumb { width: 4.375rem; height: 100%; object-fit: contain; border-radius: 0.625rem;}
.prod-info { display: flex; flex-direction: column; gap: 0.25rem; justify-content: space-between; }
.prod-name { font-size: 0.813rem; color: #2D2D2D; }
.prod-price { font-weight: 700; font-size: 1rem; }
.prod-city { position: absolute; right: 0.75rem; bottom: 0.438rem; font-size: 0.75rem; color: #7C7C7C; }

.write-btn {
  background: var(--btn-bg); color: #fff;
  padding: 0.188rem; border-radius: 0.313rem;
  font-size: 0.825rem; width: fit-content;
  width: 8.188rem;
  text-align: center;
}
.fav-video-right {
  display: flex; flex-direction: column;
  gap: 0.625rem;
  align-items: flex-end;
  width: 12.5rem;
}
.fav-icon-active img { width: 1.5rem; cursor: pointer; }
.author-info { display: flex; align-items: center; gap: 0.625rem; }
.author-avatar { width: 3.125rem; height: 3.125rem; border-radius: 50%; }
.author-name { font-weight: 400; font-size: 1rem; }
.action-btns { width: 11.313rem; display: flex; flex-direction: column; gap: 0.188rem; }
.btn-green { background: var(--btn-bg); color: white; padding: 0.313rem 0; text-align: center; border-radius: 0.313rem; border: none; cursor: pointer; font-size: 0.825rem;}
.btn-outline { background-color: white; border: 1px solid var(--btn-bg) !important; color: var(--btn-bg); padding: 0.313rem 0; text-align: center; font-size: 0.825rem; border-radius: 0.313rem; border: none; cursor: pointer; }
.fav-video-card + .fav-video-card{ margin-bottom: 1.25rem; }
.fav-ad-horizontal {
  display: flex;
  gap: 1.5rem;
  background: #fff;
  padding: 1.25rem;
  border-radius: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.03);
  position: relative;
}
/* Блок изображения */
.ad-img-container {
  width: 11.75rem;
  /* height: 10.625rem; */
  flex-shrink: 0;
  background: #F2F2F2;
  border-radius: 1.25rem;
  overflow: hidden;
  /* display: flex; */
  align-items: center;
  justify-content: center;
}
.ad-main-img { width: 100%; height: 100%; object-fit: cover; }
/* Контент */
.ad-content-info { width: 100%; display: grid; }
.ad-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.ad-title{ height: 3.5rem; margin-bottom: .4rem; overflow: hidden;}
.ad-title{
  font-size: 1.5rem;
  font-weight: 700;
  display: inline-block;
  text-transform: lowercase;
}
.ad-title::first-letter { text-transform: uppercase;}
.fav-heart { width: 1.5rem; cursor: pointer; }
.ad-price { font-size: 1.375rem; font-weight: 700; margin-bottom: 0.625rem; }
.ad-details-tags { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; color: #858685; font-size: 0.875rem; justify-content: flex-end;}
.ad-location { display: flex; align-items: center; font-size: 0.875rem; color: #333; margin-top: auto; gap: 0.438rem;font-weight: 700; font-size: 1rem;}
.pin { width: 1.563rem;height: 1.563rem; }
.ad-desc { font-size: 1rem; color: #858685; font-weight: 700; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ad-category-label { font-size: 0.813rem; color: #AAA; }
/* Правый блок */
.ad-seller-actions {
  width: 16.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3rem;
  align-items: center;
  border-left: 0.063rem solid #F0F0F0;
  padding-left: 1.5rem;
}
.seller-brief { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.seller-avatar { width: 3.75rem; height: 3.75rem; border-radius: 0.625rem; object-fit: cover; }
.seller-name { font-size: 1rem; font-weight: 700; text-align: center; }
.action-buttons { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; text-align: center;}
.ad-date { font-size: 0.75rem; color: #7C7C7C; margin-top: 0.5rem; text-align: right; width: 100%;}
.empty-messages {text-align: center;padding: 4rem 1rem;background: #fff;border-radius: 1.25rem;margin-top: 2.5rem;}
.empty-messages h3 {font-size: 1.0625rem;color: #888;font-weight: 500;}
</style>
