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
    <!-- 🔔 уведомление -->
      <transition name="slide">
        <div v-if="showNotification" class="notification">
          {{ notificationText }}
        </div>
      </transition>
    <router-view :key="$route.fullPath" />
    <MegaMenu />
    <AuthModal />
    <MaintenanceModal ref="maintenanceRef" />
    <RegionModal/>
    <Footer />
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted, provide, onMounted } from 'vue';
import Footer from './components/layout/Footer.vue';
import RegionModal from "./components/layout/RegionModal.vue"
import MegaMenu from "./components/layout/MegaMenu.vue";
import MaintenanceModal from './modals/MaintenanceModal.vue';
import AuthModal from "./modals/AuthModal.vue";
import zagluhIcon from '/src/assets/img/zagluh/icon-zagluhka.svg';

import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { useProductStore } from "/src/stores/product.js";
import { notify } from "/src/utils/notify";

const showNotification = ref(false);
const notificationText = ref("");
const auth = useAuthStore();
const reviewStore = useReviewStore();
const productStore = useProductStore();
const maintenanceRef = ref(null);
let globalPolling = null;
let isInitializing = false;
let lastPollTime = 0;

const handleNotify = (e) => {
  notificationText.value = e.detail;
  showNotification.value = true;
  setTimeout(() => { showNotification.value = false }, 3000);
};

const doPoll = () => {
  const now = Date.now();
  if (now - lastPollTime < 5000) {
    console.log('⏭️ Пропуск дубля, прошло', now - lastPollTime, 'мс');
    return;
  }
  lastPollTime = now;
  if (!document.hidden && auth.isAuthenticated && auth.user?.id) {
    console.log('📡 Poll:', new Date().toLocaleTimeString());
    auth.fetchUserChats().catch(console.error);
    auth.fetchUserNotifications().catch(console.error);
  }
};

const stopGlobalPolling = () => {
  if (globalPolling) {
    clearInterval(globalPolling);
    globalPolling = null;
  }
};

const startGlobalPolling = () => {
  if (globalPolling) return;
  
  doPoll();
  globalPolling = setInterval(doPoll, 300000);
};

const handleVisibilityChange = () => {
  if (!document.hidden && auth.isAuthenticated) {
    doPoll();
  }
};

provide('openMaintenance', () => {
  maintenanceRef.value?.open() ?? console.log("MaintenanceModal ещё не инициализирован");
});
watch(
  () => auth.isAuthenticated,
  async (isAuth) => {
    if (!isAuth) {
      stopGlobalPolling();
      return;
    }
    if (isInitializing) return;
    isInitializing = true;
    
    try {
      await auth.fetchProfile();
      
      if (!auth.user?.id) {
        console.warn("isAuthenticated=true, но user.id отсутствует");
        return;
      }
      startGlobalPolling();
      await reviewStore.initUserReviews(auth.user.id);
      
    } catch (e) {
      console.error('Ошибка инициализации пользователя:', e);
    } finally {
      isInitializing = false;
    }
  },
  { immediate: true }
);
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  productStore.fetchAdverts();
  window.addEventListener("notify", handleNotify);
});

onUnmounted(() => {
  stopGlobalPolling();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener("notify", handleNotify);
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
