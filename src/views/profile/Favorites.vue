<template>
  <div class="general-container favorites-page">
    <div class="favorites-header">
      <div class="header-row">
        <h2 class="page-title">Избранные</h2>
      </div>
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
    </div>
    <div class="favorites-content">
      <div v-if="isLoading" class="loading-plug">Загрузка...</div>
      <template v-else-if="currentItems.length > 0"><!-- Тип: Видео -->
        <template v-if="selectedType === 'videos'">
          <div v-for="video in currentItems" :key="video.id" class="fav-video-card">
            <div class="fav-video-card_block">
              <div class="fav-video-preview">
                <img :src="video.thumbnail" alt="thumbnail" />
              </div>
              <div class="fav-video-main">
                <router-link :to="'/video/' + video.id">
                  <h3 class="video-title">{{ video.title }}</h3>
                </router-link>
                <div class="video-stats">
                  <div class="stat"><img src="/src/assets/img/icons/eye.svg" /> {{ video.views }}</div>
                  <div class="stat"><img src="/src/assets/img/icons/heart.svg" /> {{ video.likes }}</div>
                  <div class="stat"><img src="/src/assets/img/icons/comment.svg" /> {{ video.comments_count }}</div>
                </div>
                <div class="linked-product-box" v-if="video.product">
                  <img :src="video.product.image" class="prod-thumb" />
                  <div class="prod-info">
                    <router-link :to="'/ads/' + video.product.id">
                      <span class="prod-name">{{ video.product.name }}</span>
                    </router-link>
                    <span class="prod-price">{{ video.product.price }} р</span>
                    <button class="btn write-btn" @click="contactSeller(video.product.user_id)">Написать</button>
                  </div>
                  <span class="prod-city">{{ video.product.city }}</span>
                </div>
              </div>
            </div>
            <div class="fav-video-right">
              <div class="fav-icon-active" @click="removeFromFavorites(video.id)">
                <img src="/src/assets/img/icons/heart-filled.svg" />
              </div>
              <div class="author-info">
                <img :src="video.author?.avatar" class="author-avatar" />
                <span class="author-name">{{ video.author?.name }}</span>
              </div>
              <div class="action-btns">
                <button class="btn btn-green">Посмотреть видео</button>
                <button class="btn btn-outline">Посмотреть объявление</button>
              </div>
            </div>
          </div>
        </template><!-- Тип: Объявления -->
        <template v-else>
          <div v-for="item in currentItems" :key="item.id" class="fav-ad-horizontal">
            <div class="ad-img-container">
              <img :src="item.image || '/src/assets/img/placeholder.png'" class="ad-main-img" />
            </div>
            <div class="ad-content-info">
              <div class="ad-title-row">
                <h3 class="ad-title">{{ item.title }}</h3>
                <img src="/src/assets/img/icons/heart-filled.svg" class="fav-heart" @click="removeFromFavorites(item.id)" />
              </div>
              <div class="ad-price">{{ item.price }} ₽</div>
              <div class="ad-details-tags">
                <span v-if="item.category === 'jobs'">{{ item.experience }}</span>
                <span v-else>{{ item.params }}</span>
              </div>
              <div class="ad-location">
                <img src="/src/assets/img/icons/location-pin.svg" class="pin" />
                {{ item.location }}
              </div>
              <p class="ad-desc">{{ item.description }}</p>
              <div class="ad-category-label">{{ item.category_name }}</div>
            </div>
            <div class="ad-seller-actions">
              <div class="seller-brief">
                <img :src="item.seller?.avatar" class="seller-avatar" />
                <span class="seller-name">{{ item.seller?.name }}</span>
              </div>
              <div class="action-buttons">
                <button class="btn btn-green" @click="onWriteClick(item)">Написать</button>
                <button class="btn btn-white" @click="onShowPhone(item)">Показать номер</button>
              </div>
              <span class="ad-date">{{ item.created_at_formatted }}</span>
            </div>
          </div>
        </template>
      </template><!-- Пустое состояние -->
      <div v-else class="empty-state">
        <p>В избранном пока ничего нет</p>
      </div>
    </div>
  </div>
</template>
<!-- <script setup>
import { ref } from 'vue';
const isDropdownOpen = ref(false);
const selectedType = ref('videos');
const favoriteVideos = ref([
  {
    id: 1,
    title: 'Собака стоит на террасе и смотрит на панно которые сделал фонарь светодиода',
    thumbnail: '/img/roliks/rolik.png',
    author: { name: 'Владимир', avatar: '/src/assets/img/mask-avatar.png' },
    product: {
      name: 'Панно фонаря светодиода',
      price: 79,
      city: 'г.Краснодар',
      image: '/img/products/img-prod.jpg'
    }
  },
]);
const favoriteAds = ref([
  {
    id: 1,
    title: 'Агент-менеджер',
    category: 'jobs',
    categoryName: 'Продажи',
    price: '70 000 - 90 000 ₽',
    experience: '36 лет Опыт: 6 лет',
    gender: 'жен.',
    location: 'Краснодар, р-н Центральный',
    description: 'Предлагаю своё резюме',
    image: '/img/temp/resume-photo.jpg',
    date: '4 января 13:52',
    seller: { name: 'Лилия Степановна', avatar: '/src/assets/img/mask-avatar.png' }
  },
  {
    id: 2,
    title: 'Honda Partner 1,5 AT, 2002',
    category: 'transport',
    categoryName: 'Автомобили',
    price: '422 000 ₽',
    params: '1.5 AT (105 л.с.), седан, передний привод, бензин',
    location: 'Краснодар, р-н Центральный',
    description: 'Тачка огонь, берите не пожалеете, всё работает...',
    image: '/img/products/car.jpg',
    date: '4 января 13:52',
    seller: { name: 'Павел Геннадьевич', avatar: '/src/assets/img/mask-avatar.png' }
  }
]);
const selectType = (type) => {
  selectedType.value = type;
  isDropdownOpen.value = false;
};
const closeDropdown = () => isDropdownOpen.value = false;
</script> -->
<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from "/src/stores/authStore.js";

const authStore = useAuthStore();
const isDropdownOpen = ref(false);
const selectedType = ref('videos');
const isLoading = ref(false);
const currentItems = ref([]);

// Вызываем метод из стора
const loadData = async () => {
  if (!authStore.isAuthenticated) return;
  isLoading.value = true;
  currentItems.value = await authStore.fetchFavorites(selectedType.value);
  isLoading.value = false;
};

const toggleFavorite = async (id) => {
  const success = await authStore.removeFromFavorites(id);
  if (success) {
    currentItems.value = currentItems.value.filter(item => item.id !== id);
  }
};

const changeType = (type) => {
  selectedType.value = type;
  isDropdownOpen.value = false;
  loadData();
};

const closeDropdown = () => isDropdownOpen.value = false;
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.favorites-header {
  display: grid;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}
.custom-select-wrapper {
  position: relative;
  width: 15rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.select-header {
  background: #fff;
  padding: 1.063rem;
  border-radius: 1.25rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
  width: 18.25rem;
  gap: 3.625rem;
  position: relative;
}
.select-header span{
    font-size: 1.5rem;
    font-weight: 1;
}
.arrow-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-right: 0.125rem solid #000;
  border-bottom: 0.125rem solid #000;
  transform: translateY(-0.25rem) rotate(45deg);
  transition: transform 0.3s ease;
  flex-shrink: 0; 
  margin-right: 1.25rem;
}

.arrow-icon.is-rotated {
  transform: translateY(0.25rem) rotate(-135deg);
}
.is-rotated { transform: rotate(180deg); }

.select-options {
  position: absolute;
  top: 110%;
  right: 0;
  width: fit-content;
  background: #fff;
  border-radius: 1.25rem;
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 0.5rem 1.25rem rgba(0,0,0,0.1);
  width: 18.25rem;
}

.option {
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-size: 1.25rem;
}
.option:hover { background: #f5f5f5; }
.favorites-content{
   border: 1px solid #D9D9D9;
   padding: 0.625rem;
   border-radius: 0.625rem;
}
.fav-video-card {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  background: #fff;
  padding: 0.625rem 0.938rem;
  border-radius: 1.25rem;
  /* margin-bottom: 1.25rem; */
  box-shadow: 0 0.25rem 0.938rem rgba(0,0,0,0.03);
}
.fav-video-card_block{
  display: flex; gap: 1.25rem;
  width: 100%;
}

.fav-video-preview {
  width: 12.5rem;
  height: 15.625rem;
  flex-shrink: 0;
}
.fav-video-preview img {
  width: 100%; height: 100%;
  border-radius: 0.938rem;
  object-fit: cover;
}

.fav-video-main { width: 61%; display: grid;}

.video-title {
  font-size: 1.25rem;
  margin-bottom: 0.625rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-stats {
  display: grid;
  gap: 0.313rem;
  margin-bottom: 0.625rem;
}
.stat {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.875rem; color: #333;
}
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
.fav-video-card + .fav-video-card{
    margin-bottom: 1.25rem;
}
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
  width: 13.75rem; /* 220px */
  height: 10.625rem; /* 170px */
  flex-shrink: 0;
  background: #F2F2F2;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ad-main-img { width: 100%; height: 100%; object-fit: cover; }

/* Контент */
.ad-content-info { width: 100%;
    display: grid; }

.ad-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.ad-title { font-size: 1.25rem; font-weight: 600; color: #000; margin-bottom: 0.5rem; }
.fav-heart { width: 1.5rem; cursor: pointer; }

.ad-price { font-size: 1.375rem; font-weight: 700; margin-bottom: 0.625rem; }

.ad-details-tags { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; color: #333; font-size: 0.875rem; }

.ad-location { display: flex; align-items: center; gap: 0.313rem; font-size: 0.875rem; color: #333; margin-bottom: 0.625rem; }
.pin { width: 0.875rem; }

.ad-desc { font-size: 0.875rem; color: #888; line-height: 1.3; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.ad-category-label { font-size: 0.813rem; color: #AAA; }

/* Правый блок */
.ad-seller-actions {
  width: 12.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border-left: 0.063rem solid #F0F0F0;
  padding-left: 1.5rem;
}

.seller-brief { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.seller-avatar { width: 3.75rem; height: 3.75rem; border-radius: 0.625rem; object-fit: cover; }
.seller-name { font-size: 0.875rem; font-weight: 500; text-align: center; }

.action-buttons { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }

.ad-date { font-size: 0.75rem; color: #7C7C7C; margin-top: 0.5rem; text-align: right; width: 100%;}
</style>
