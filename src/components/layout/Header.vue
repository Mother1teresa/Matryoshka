<template>
  <header class="header">
    <div class="container">
      <!-- 🔔 уведомление -->
      <transition name="slide">
        <div v-if="showNotification" class="notification">
          {{ notificationText }}
        </div>
      </transition>

      <div class="header__top">
        <router-link to="/" class="logo">
          <span>Матрёшка</span>
        </router-link>
        <div class="header__center">
          <a href="#" class="btn-primary btn">
            <img src="/src/assets/img/icon-primary.svg" />
            Объявление
          </a>
          <router-link to="/profile/videos" class="btn-primary btn">
            <img src="/src/assets/img/icon-primary.svg" />
            Мини-видео
          </router-link>
        </div>
        <div class="header__right">
          <!-- НЕ авторизован -->
          <template v-if="!auth.isAuthenticated">
            <div class="header__right-false">
              <button class="btn-light btn-login" @click="modal.openLogin">
                Войти
              </button>
              <button class="btn-light" @click="region.open()">
                <img src="/src/assets/img/location_on.svg" />
                {{ region.selectedRegion || "Регион"  }}
              </button>
            </div>
          </template>

          <!-- авторизован -->
          <template v-else>
            <div class="header__right-true">
              <div class="header__right-block">
                <div class="header__right-icons">
                  <router-link to="/profile/notifications" class="icon">
                    <img src="/src/assets/img/uved.svg" />
                    <span v-if="auth.unreadNotificationsCount > 0" class="badge-count">
                      {{ auth.unreadNotificationsCount }}
                    </span>
                  </router-link>

                  <!-- Ссылка на сообщения (список чатов) -->
                  <router-link to="/profile/messages" class="icon">
                    <img src="/src/assets/img/mes.svg" />
                    <span v-if="auth.unreadMessagesCount > 0" class="badge-count">
                      {{ auth.unreadMessagesCount }}
                    </span>
                  </router-link>
                </div>
                <button class="btn-light" @click="region.open()">
                  <img src="/src/assets/img/location_on.svg" />
                  {{ currentRegionName }}
                </button>
              </div>
              <!-- профиль -->
              <div class="profile-wrapper" ref="profileWrapper">
                <div class="profile" @click.prevent.stop="toggleProfileMenu">
                  <div class="profile-block">
                    <img :src="auth.userAvatar" class="avatar" />
                    <img
                      src="/src/assets/img/arrow-profil.svg"
                      class="arr-profil"
                      :class="{ rotate: showProfileMenu }"/>
                  </div>
                  <span>
                    {{ auth.user?.name || 'Загрузка...' }}
                  </span>
                </div>
                <!-- dropdown -->
                <transition name="fade">
                  <div v-if="showProfileMenu" class="profile-menu">
                    <div class="rating" v-if="auth.user?.id">{{ reviewStore.getRatingById(auth.user.id) }}
                      <span>★★★★★</span></div> 
                      <div class="profile-menu_links">
                      <!-- {{ reviewStore.renderStars(reviewStore.getRatingById(auth.user.id)) }} -->
                      <router-link to="/profile/info" @click="showProfileMenu = false" class="profile-menu_link">Мои данные</router-link>
                      <router-link to="/profile/videos" @click="showProfileMenu = false" class="profile-menu_link">Мои ролики</router-link>
                      <router-link to="/profile/advertisements" @click="showProfileMenu = false" class="profile-menu_link">Мои объявления</router-link>
                      <router-link to="/create-ad" @click="showProfileMenu = false" class="profile-menu_link">Создать объявление</router-link>
                      <router-link to="/profile/orders" @click="showProfileMenu = false" class="profile-menu_link">Заказы</router-link>
                      <router-link to="/profile/favorites" @click="showProfileMenu = false" class="profile-menu_link">Избранное</router-link>
                      <router-link to="/profile/referral" @click="showProfileMenu = false" class="profile-menu_link">Приглашайте друзей</router-link>
                      <router-link to="/profile/responses" @click="showProfileMenu = false" class="profile-menu_link">Отклики</router-link>
                      <router-link to="/profile/messages" @click="showProfileMenu = false" class="profile-menu_link">Сообщения 
                        <span v-if="auth.unreadMessagesCount > 0" class="badge-count">
                        {{ auth.unreadMessagesCount }}
                      </span></router-link>
                      <router-link to="/profile/notifications" @click="showProfileMenu = false" class="profile-menu_link">Уведомления
                        <span v-if="auth.unreadNotificationsCount > 0" class="badge-count">
                          {{ auth.unreadNotificationsCount }}
                        </span>
                      </router-link>
                      <div class="profile-menu_link logout" @click.stop="askLogout">Выйти</div>
                      </div>
                  </div>
                </transition>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="header__bottom">
        <div class="search-input__box">
          <div class="search-img">
            <img src="/src/assets/img/Icon-search.svg" />
            <input type="text" placeholder="Поиск" class="search-input" />
          </div>
          <button class="btn-search btn">Найти</button>
        </div>
        <button class="btn-category btn" @click="menu.open()">
          <img src="/src/assets/img/header-catalog.svg" />
          Категории
        </button>
      </div>
    </div>
  </header>

  <!-- logout modal -->
  <transition name="fade">
    <div v-if="showLogoutConfirm" class="logout-modal">
      <div class="logout-box">
        <p>Вы точно хотите выйти?</p>
        <div class="logout-actions">
          <button class="btn-search btn" @click="confirmLogout">Да</button>
          <button class="btn-light btn" @click="cancelLogout">Нет</button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { useMenuStore } from "/src/stores/menu.js";
import { useRegionModalStore } from "/src/stores/regionModal.js";
import { useReviewStore } from '/src/stores/reviews.js';

const modal = useModalStore();
const menu = useMenuStore();
const auth = useAuthStore();
const region = useRegionModalStore();
const reviewStore = useReviewStore();

const showNotification = ref(false);
const notificationText = ref("");
const profileWrapper = ref(null);
const showProfileMenu = ref(false);
const showLogoutConfirm = ref(false);

const currentRegionName = computed(() => region.selectedRegion || "Регион");
function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
}
function askLogout() {
  showLogoutConfirm.value = true;
}
function confirmLogout() {
  auth.logout();
  showProfileMenu.value = false;
  showLogoutConfirm.value = false;
  notificationText.value = "Вы вышли из аккаунта";
  showNotification.value = true;
  setTimeout(() => { showNotification.value = false; }, 3000);
}
function cancelLogout() {
  showLogoutConfirm.value = false;
}

function handleClickOutside(event) {
  if (profileWrapper.value && !profileWrapper.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
}
const handleNotify = (e) => {
  notificationText.value = e.detail;
  showNotification.value = true;
  setTimeout(() => { showNotification.value = false }, 3000);
};
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("notify", handleNotify);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("notify", handleNotify);
});
watch(
  () => auth.user?.id,
  (newId) => {
    if (newId) {
      reviewStore.fetchReviewsBySeller(newId);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.header {
  position: relative;
  background: #fff;
  padding: 1.375rem 0 1.813rem;
  /* box-shadow: 0 2px 5px rgba(0,0,0,0.05); */
  border-bottom: 6px solid #dddddd;
}

/* -------- Плашка -------- */
.notification {
  position: absolute;
  top: 3.45rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1.2rem 1.5rem;
  border-radius: 2.125rem;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  font-weight: 400;
  font-size: 1.25rem;
  z-index: 6;
}

/* Анимация */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* -------- Layout -------- */

.header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header__center {
  display: flex;
  gap: 15px;
}

.header__right {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  width: 17.5rem;
  justify-content: flex-end;
  height: 6.625rem;
}
.header__right-false {
  display: grid;
  gap: 0.813rem;
}
.header__bottom {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* -------- Элементы -------- */
.search-input {
  font-size: 1.25rem;
  border: none;
  width: 90%;
}
.search-input::placeholder {
  color: #929292;
  font-size: 1.25rem;
}
.search-img {
  display: flex;
  align-items: center;
  gap: 0.825rem;
  padding-top: 0.15rem;
}
.search-input__box {
  flex: 0.55;
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.26rem 0.27rem 0.75rem;
  border-radius: 1.625rem;
  border: 1px solid #ddd;
  height: 3.17rem;
}
.search-input__box img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: fill;
}

.btn-light {
  background: var(--bg-profil);
  border: none;
  cursor: pointer;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 0.938rem;
  height: 2.125rem;
  padding: 0.625rem 1.5rem;
}
.btn-login {
  padding: 0.625rem 1.188rem;
  height: auto;
}
.btn-light img {
  width: 1.5rem;
  height: 1.5rem;
}

.btn-search {
  background: var(--btn-bg);
  color: white;
  border: none;
  padding: 0.688rem 1.969rem;
  border-radius: 1.25rem;
  cursor: pointer;
}

.btn-category {
  background: white;
  border: 1px solid var(--btn-bg);
  color: var(--btn-bg);
  padding: 0.563rem 0.688rem 0.563rem 0.313rem;
  border-radius: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 400;
  transition: opacity 0.3s;
}

.btn-category img {
  width: 2.063rem;
  height: auto;
}

.profile {
  display: grid;
  align-items: center;
  gap: 0.313rem;
  cursor: pointer;
  background-color: var(--bg-profil);
  border-radius: 1rem;
  padding: 0.563rem 0.675rem 0.375rem 1.25rem;
  height: -webkit-fill-available;
  height: stretch;
}

.avatar {
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 50%;
  object-fit: cover;
}
.header__right-true {
  display: flex;
  gap: 0.5rem;
}
.header__right-icons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.header__right-block {
  display: grid;
  gap: 0.75rem;
}
.icon {
  background-color: var(--bg-profil);
  border-radius: 1rem;
  width: 3.75rem;
  height: 3.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.icon img {
  width: auto;
  height: auto;
}
.icon:first-child img {
  width: 2.282rem;
  height: 2.873rem;
}
.icon:last-child img {
  width: 2.808rem;
  height: 2.536rem;
}
.icon .badge-count{
  right: 0;
  top: 0;
}
.profile-block {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.arr-profil {
  width: 1rem;
  height: 1.5rem;
}
.header__right-true .btn-light {
  width: 100%;
}
.profile-wrapper {
  position: relative;
}

/* стрелка */
.arr-profil {
  transition: transform 0.3s;
}

.arr-profil.rotate {
  transform: rotate(180deg);
}

/* dropdown */
.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.625rem;
  width: 16.25rem;
  background: var(--bg-profil);
  border-radius: 0.938rem;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.15);
  padding: 0.938rem 0;
  z-index: 10;
  /* font-size: 1.25rem; */
}
.profile-menu_links{
  display: grid;
  gap: 0;
}
.profile-menu .profile-menu_link {
  padding: 0.625rem 0.938rem;
  cursor: pointer;
  border-radius: 0.5rem;
  position: relative;
}
.profile-menu_link a{
 position: relative;
}
.profile-menu_link .badge-count{
  top: 0;
}
.profile-menu .profile-menu_link:hover {
  background: #e7e7e7;
  border-radius: 0;
}

.logout {
  color: red;
}

/* рейтинг */
.rating {
  font-weight: bold;
  margin-bottom: 0.625rem;
  font-size: 1.5rem;
  padding-left: 1rem;
}

/* modal */
.logout-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.logout-box {
  background: white;
  padding: 1.563rem;
  border-radius: 1rem;
}

.logout-actions {
  display: flex;
  gap: 0.625rem;
  margin-top: 0.938rem;
}

.logout-actions .btn-light {
  height: auto;
  border-radius: 1.25rem;
}
</style>
