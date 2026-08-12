<template>
  <header class="header">
    <div class="container">
      <!-- 🔔 уведомление -->
      <!-- <transition name="slide">
        <div v-if="showNotification" class="notification">
          {{ notificationText }}
        </div>
      </transition> -->

      <div class="header__top">
        <router-link to="/" class="logo">
          <span>Матрёшка</span>
        </router-link>
        <div class="header__center">
          <a href="#" class="btn-primary btn" @click.prevent="handleCreateAd">
            <img src="/src/assets/img/icon-primary.svg" />
            Объявление
          </a>
          <a href="#" class="btn-primary btn" @click.prevent="handleCreateVideo">
            <img src="/src/assets/img/icon-primary.svg" />
            Мини-видео
          </a>
        </div>
        <div class="header__right">
          <!-- НЕ авторизован -->
          <template v-if="!auth.isAuthenticated">
            <div class="header__right-false">
              <a href="" class="btn-light btn-login" target="_blank" >
                <img src="/src/assets/img/404/supp.svg" alt="">
                Поддержка
              </a>
              <button class="btn-light" @click="region.open()">
                <img src="/src/assets/img/location_on.svg" />
                {{ region.selectedRegion || "Регион"  }}
              </button>
            </div>
            <button @click="modal.openLogin" class="header__right-false_poder">
              Войти
            </button>
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
                  <span>{{ currentRegionName }}</span>
                </button>
              </div>
              <!-- профиль -->
              <div class="profile-wrapper" ref="profileWrapper">
                <div class="profile" @click.prevent.stop="toggleProfileMenu">
                  <div class="profile-block">
                    <div class="profile-block_lisy">
                      <img :src="auth.userAvatar" class="avatar" />
                        <span>
                        {{ auth.user?.name || 'Загрузка...' }}
                      </span>
                    </div>
                    <img
                      src="/src/assets/img/arr-profile.svg"
                      class="arr-profil"
                      :class="{ rotate: showProfileMenu }"/>
                  </div>
                  
                </div>
                <!-- dropdown -->
                <transition name="fade">
                  <div v-if="showProfileMenu" class="profile-menu">
                    <div class="rating" v-if="auth.user?.id">
                      {{ userRating }}
                      <span class="stars-row">
                        <img
                          v-for="n in 5"
                          :key="n"
                          :src="n <= Math.round(userRating) ? '/img/users/star.png' : '/img/users/star_1.png'"
                          class="star-icon"
                          alt="★"
                        />
                      </span>
                    </div>
                      <div class="profile-menu_links">
                      <router-link to="/profile/info" @click="showProfileMenu = false" class="profile-menu_link">Мои данные</router-link>
                      <router-link to="/profile/videos" @click="showProfileMenu = false" class="profile-menu_link">Мои ролики</router-link>
                      <router-link to="/profile/advertisements" @click="showProfileMenu = false" class="profile-menu_link">Мои объявления</router-link>
                      <router-link to="/profile/create-ad" @click="showProfileMenu = false" class="profile-menu_link">Создать объявление</router-link>
                      <!-- <router-link to="/profile/orders" @click="showProfileMenu = false" class="profile-menu_link">Заказы</router-link> -->
                      <!-- <a class="profile-menu_link locked-link" @click="openMaintenance">Заказы</a> -->
                      <router-link to="/profile/favorites" @click="showProfileMenu = false" class="profile-menu_link">Избранное</router-link>
                      <!-- <router-link to="/profile/referral" @click="showProfileMenu = false" class="profile-menu_link">Приглашайте друзей</router-link>
                      <router-link to="/profile/responses" @click="showProfileMenu = false" class="profile-menu_link">Отклики</router-link> -->
                      <!-- <a class="profile-menu_link locked-link" @click="openMaintenance">Приглашайте друзей</a> -->
                      <!-- <a class="profile-menu_link locked-link" @click="openMaintenance">Отклики</a> -->
                      <router-link to="/profile/messages" @click="showProfileMenu = false" class="profile-menu_link">Сообщения 
                        <!-- <span v-if="auth.unreadMessagesCount > 0" class="badge-count">
                          {{ auth.unreadMessagesCount }}
                        </span> -->
                      </router-link>
                      <router-link to="/profile/notifications" @click="showProfileMenu = false" class="profile-menu_link">Уведомления
                        <!-- <span v-if="auth.unreadNotificationsCount > 0" class="badge-count">
                          {{ auth.unreadNotificationsCount }}
                        </span> -->
                      </router-link>
                      <a href="" target="_blank" class="profile-menu_link">
                        Поддержка
                      </a>
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
            <input type="text" placeholder="Поиск" class="search-input" v-model="searchQuery" @keyup.enter="goToSearch"/>
          </div>
          <button class="btn-search btn" @click="goToSearch">Найти</button>
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
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { notify } from "/src/utils/notify";

const openMaintenance = inject('openMaintenance');
const router = useRouter();
const modal = useModalStore();
const menu = useMenuStore();
const auth = useAuthStore();
const region = useRegionModalStore();

const profileWrapper = ref(null);
const showProfileMenu = ref(false);
const showLogoutConfirm = ref(false);

const searchQuery = ref("");
const userRating = computed(() => auth.user?.rating || 0);

const currentRegionName = computed(() => region.selectedRegion || "Регион");
const goToSearch = () => {
  const query = searchQuery.value.trim();
  if (!query) return;
  router.push({
    name: "Search",
    query: { q: query }
  });
  // Очищаем поле после перехода (опционально)
  // searchQuery.value = "";
};

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
}
function askLogout() {
  showLogoutConfirm.value = true;
  showProfileMenu.value = false;
}
function confirmLogout() {
  auth.logout();
  showProfileMenu.value = false;
  showLogoutConfirm.value = false;
  notify("Вы вышли из аккаунта");
}
function cancelLogout() {
  showLogoutConfirm.value = false;
}
function handleClickOutside(event) {
  if (profileWrapper.value && !profileWrapper.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
}
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
const lockedRoutes = [
  '/profile/orders',
  '/profile/referral',
  '/profile/responses',
];
const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};
const handleCreateAd = () => {
  checkAuthAndRun(() => {
    router.push('/profile/create-ad');
  }, "Войдите, чтобы создать объявление");
};
const handleCreateVideo = () => {
  checkAuthAndRun(() => {
    router.push('/profile/videos');
  }, "Войдите, чтобы создать мини-видео");
};
</script>
<style scoped>
.header {position: relative;background: #fff;padding: 1.375rem 0 1.813rem;border-bottom: 6px solid #dddddd;}
.header__top {display: flex;justify-content: space-between;align-items: flex-start;margin-bottom: 1rem;}
.header__center {display: flex;gap: 15px;}
.header__right {display: flex;gap: 0.813rem;align-items: flex-start;width: 17.5rem;justify-content: flex-end;height: 6.625rem;}
.header__right-false {display: grid;gap: 0.813rem;}
.header__bottom {display: flex;gap: 0.813rem;align-items: center;}
.search-input {font-size: 1.25rem;border: none;width: 90%;}
.search-input::placeholder {color: #929292;font-size: 1.25rem;}
.search-img {display: flex;align-items: center;gap: 0.825rem;width: 75%;}
.search-input__box {flex: 0.55;display: flex;justify-content: space-between;padding: 0.25rem 0.26rem 0.27rem 0.75rem;border-radius: 1.625rem;border: 1px solid #ddd;height: 3.17rem;}
.search-input__box img {width: 1.5rem;height: 1.5rem;object-fit: fill;}
.btn-light {background: var(--bg-profil);border: none;cursor: pointer;display: flex;gap: 0.25rem;align-items: center; justify-content: flex-start;width: 95%;border-radius: 0.938rem;height: 2.125rem;padding: 0.625rem 1.5rem 0.625rem 0.6rem; font-size: 0.938rem; font-weight: 700; }
.btn-light span{ max-width: 6rem;text-transform: lowercase; -webkit-box-orient: vertical;-webkit-line-clamp: 1;overflow: hidden;  display: -webkit-box;}
.btn-light span::first-letter { text-transform: uppercase;}
.btn-login {padding: 0.625rem 1.188rem;height: auto;}
.btn-light img {width: 1.438rem;height: 1.5rem;}
.btn-search {background: var(--btn-bg);color: white;border: none;padding: 0.688rem 1.969rem;border-radius: 1.25rem;cursor: pointer;}
.btn-category {background: white;color: var(--btn-bg);cursor: pointer;display: flex;align-items: center;gap: 0.25rem;font-weight: 700;transition: opacity 0.3s;}
.btn-category img {width: 2.063rem;height: auto;}
.profile {display: grid;align-items: center;gap: 0.313rem;cursor: pointer;background-color: var(--bg-profil);border-radius: 1rem;padding: 0.563rem 0.675rem 0.375rem 1.25rem;height: -webkit-fill-available;height: stretch;}
.avatar {width: 3.75rem;height: 3.75rem;border-radius: 50%;object-fit: cover; image-rendering: auto; transform: translateZ(0); backface-visibility: hidden; -webkit-mask-image: -webkit-radial-gradient(white, black);}
.header__right-true {display: flex;gap: 1.188rem;}
.header__right-icons {display: flex;justify-content: flex-end;gap: 0.5rem; justify-content: space-between;width: 100%;}
.header__right-block {display: grid;gap: 0.75rem; justify-items: end;}
.icon {background-color: var(--bg-profil);border-radius: 1rem;width: 3.75rem;height: 3.75rem;display: flex;align-items: center;justify-content: center;position: relative;}
.icon img {width: auto;height: auto;}
.icon:first-child img {width: 1.8rem;height: 1.8rem;}
.icon:last-child img {width: 1.8rem;height: 1.9rem;}
.icon .badge-count{right: 0;top: 0;}
.profile-block {display: flex;align-items: center;gap: 0.8rem;}
.profile-block_lisy{}
.arr-profil {width: 1rem;height: 1.5rem;}
.header__right-true .btn-light {width: 8.688rem;}
.profile-wrapper {position: relative;}
.profile-wrapper .profile span{width: 3.85rem; font-size: 0.938rem; margin-top: 0.313rem; font-weight: 700; overflow: hidden;text-transform: lowercase; -webkit-box-orient: vertical;-webkit-line-clamp: 1;overflow: hidden;  display: -webkit-box; text-align: center;}
.profile-wrapper .profile span::first-letter { text-transform: uppercase;}
/* стрелка */
.arr-profil {transition: transform 0.3s; margin-top: 1.5rem;}
.arr-profil.rotate {transform: rotate(180deg);}
.profile-menu {position: absolute;top: 100%;right: 0;margin-top: 0.625rem;width: 17.45rem;background: var(--bg-profil);border-radius: 0.938rem;box-shadow: 0 4px 4px rgba(0, 0, 0, 0.15);padding: 0.938rem 0;z-index: 10;}
.profile-menu_links{display: grid;gap: 0;}
.profile-menu .profile-menu_link {padding: 0.625rem 0.938rem;cursor: pointer;border-radius: 0.5rem;position: relative;}
.profile-menu_link a{position: relative;}
.profile-menu_link .badge-count{top: 0;}
.profile-menu .profile-menu_link:hover {background: #e7e7e7;border-radius: 0;}
.logout {color: red;}
.rating {font-weight: bold;margin-bottom: 0.625rem;font-size: 1.5rem;padding-left: 1rem; color: var(--btn-bg);}
.logout-modal {position: fixed;inset: 0;background: rgba(0, 0, 0, 0.3);display: flex;justify-content: center;align-items: center;z-index: 10;}
.logout-box {background: white;padding: 1.563rem;border-radius: 1rem;}
.logout-actions {display: flex;gap: 0.625rem;margin-top: 0.938rem;}
.logout-actions .btn-light {height: auto;border-radius: 1.25rem; justify-content: center; padding: 0.688rem 1.969rem;}
.header__right-false_poder{background: var(--bg-profil);width: 5.438rem;height: 5.438rem;border-radius: 1rem;display: flex;align-items: center;justify-content: center;}
.stars-row {display: inline-flex;align-items: center;gap: 0.15rem;margin-left: 0.25rem;}
.star-icon {width: 1rem;height: 1rem;}
</style>
