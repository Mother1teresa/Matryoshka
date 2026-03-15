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
    <Header />
    <router-view />
    <MegaMenu />
    <AuthModal />
    <RegionModal/>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import RegionModal from "./components/layout/RegionModal.vue"
import MegaMenu from "./components/layout/MegaMenu.vue";
import AuthModal from "./modals/AuthModal.vue";
import zagluhIcon from '/src/assets/img/zagluh/icon-zagluhka.svg'
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
@media (max-width: 48em) {
  .mobile-block {
    display: flex;
    padding: 0.938rem;
  }
  .desktop-content {
    display: none;
  }
}
</style>
