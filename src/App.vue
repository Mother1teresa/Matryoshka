<template>
  <!-- Мобильная заглушка -->
  <div class="mobile-block">
    <div class="mobile-card">
      <div class="icon">
        <img :src="zagluhIcon" alt="" />
      </div>
      <div class="zagluh-title">У нас для вас прекрасная новость!</div>
      <p>
        Матрешка есть в App Store и Google Play и вы можете скачать наше
        приложение нажав на кнопку
      </p>
      <a href="#" class="btn">Скачать в App Store</a>
      <a href="#" class="btn">Скачать в Google Play</a>
    </div>
  </div>

  <!-- Основной сайт -->
  <div class="desktop-content">
    <router-view :key="$route.fullPath" />
    <MegaMenu />
    <AuthModal />
    <RegionModal/>
    <Footer />
  </div>
</template>

<script setup>
import { watch,onUnmounted } from 'vue';
import Footer from './components/layout/Footer.vue';
import RegionModal from "./components/layout/RegionModal.vue"
import MegaMenu from "./components/layout/MegaMenu.vue";
import AuthModal from "./modals/AuthModal.vue";
import zagluhIcon from '/src/assets/img/zagluh/icon-zagluhka.svg';

import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
const auth = useAuthStore();
const reviewStore = useReviewStore();
let globalPolling = null;
const startGlobalPolling = () => {
  // Каждые 30 секунд проверяем новые чаты и уведомления в фоне
  globalPolling = setInterval(() => {
    auth.fetchUserChats();
    auth.fetchUserNotifications();
  }, 30000); 
};
watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await auth.fetchProfile(); 
      auth.fetchUserChats();
      auth.fetchUserNotifications();
      await auth.fetchVideos();
      // 2. Если ID появился, тянем отзывы для рейтинга в шапке
      if (auth.allVideos?.length > 0) {
        auth.allVideos.forEach(video => {
          if (video.thumbnail) {
            const img = new Image();
            img.src = video.thumbnail;
          }
        });
      }
      if (auth.user?.id) {
        await reviewStore.initUserReviews(auth.user.id);
      }
      startGlobalPolling();
    } else {
      if (globalPolling) clearInterval(globalPolling);
    }
  },
  { immediate: true } 
);
onUnmounted(() => {
  if (globalPolling) clearInterval(globalPolling);
});
</script>

<style scoped>
.mobile-block {
  display: none;
  height: 100vh;
  background: #f2f2f2;
  justify-content: center;
  margin-top: 2.813rem;
}

.mobile-card {
  text-align: center;
  /* max-width: 320px; */
}

.zagluh-title {
  font-weight: 700;
  margin-bottom: 0.625rem;
  margin-left: 1.563rem;
  margin-right: 1.563rem;
}

.mobile-card p {
  font-size: 0.875rem;
  margin-bottom: 2.125rem;
  margin-left: 2.2rem;
  margin-right: 2.2rem;
}

.btn {
  display: block;
  background: #5d8f6e;
  color: white;
  padding: 1rem;
  border-radius: 2.25rem;
  text-decoration: none;
  margin-bottom: 0.313rem;
  font-size: 0.875rem;
}
.icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.313rem;
}
.icon img {
  width: 2.625rem;
  height: 1.688rem;
}
@media (max-width: 61.813rem) {
  .mobile-block {
    display: flex;
    padding: 0.938rem;
  }
  .desktop-content {
    display: none;
  }
}
</style>
