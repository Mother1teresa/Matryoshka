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
    <MaintenanceModal ref="maintenanceRef" />
    <RegionModal/>
    <Footer />
  </div>
</template>
<script setup>
import { ref,watch,onUnmounted,provide,onMounted } from 'vue';
import Footer from './components/layout/Footer.vue';
import RegionModal from "./components/layout/RegionModal.vue"
import MegaMenu from "./components/layout/MegaMenu.vue";
import MaintenanceModal from './modals/MaintenanceModal.vue';
import AuthModal from "./modals/AuthModal.vue";
import zagluhIcon from '/src/assets/img/zagluh/icon-zagluhka.svg';

import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { useProductStore } from "/src/stores/product.js";

const auth = useAuthStore();
const reviewStore = useReviewStore();
const maintenanceRef = ref(null);
const productStore = useProductStore();
let globalPolling = null;
const loadVideos = async () => {
  await auth.fetchVideos();
};
const startGlobalPolling = () => {
  if (globalPolling) clearInterval(globalPolling);
  globalPolling = setInterval(() => {
    auth.fetchUserChats();
    auth.fetchUserNotifications();
  }, 30000);
};
onMounted(() => {
  console.log('App.vue onMounted')
  loadVideos();
  console.log('Calling fetchAdverts...')
  productStore.fetchAdverts().then(() => {
    console.log('fetchAdverts done, products:', productStore.products.length)
  })
});
watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      // Только для авторизованных: профиль, чаты, уведомления
      await auth.fetchProfile();
      auth.fetchUserChats();
      auth.fetchUserNotifications();
      
      if (auth.user?.id) {
        await reviewStore.initUserReviews(auth.user.id);
      }
      startGlobalPolling();
    } else {
      // Очищаем polling при выходе
      if (globalPolling) clearInterval(globalPolling);
      globalPolling = null;
    }
  },
  { immediate: true }
);
onUnmounted(() => {
  if (globalPolling) clearInterval(globalPolling);
});
provide('openMaintenance', () => {
  if (maintenanceRef.value) {
    maintenanceRef.value.open();
  } else {
    console.warn("MaintenanceModal еще не инициализирован");
  }
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
.icon { display: flex; justify-content: center; margin-bottom: 0.313rem;}
.icon img { width: 2.625rem; height: 1.688rem;}
@media (max-width: 61.813rem) {
  .mobile-block { display: flex; padding: 0.938rem;}
  .desktop-content { display: none;}
}
</style>
