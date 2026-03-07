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
        <a href="/" class="logo">
          <span>Матрёшка</span>
        </a>
        <div class="header__center">
          <a href="#" class="btn-primary btn">
            <img src="/src/assets/img/icon-primary.svg" />
            Объявление
          </a>
          <a href="#" class="btn-primary btn">
            <img src="/src/assets/img/icon-primary.svg" />
            Мини-видео
          </a>
        </div>

        <div class="header__right">
          <!-- НЕ авторизован -->
          <template v-if="!auth.isAuthenticated">
            <div class="header__right-false">
              <button class="btn-light btn-login" @click="modal.openLogin">
                Войти
              </button>
              <button class="btn-light">
                <img src="/src/assets/img/location_on.svg" />
                Регион
              </button>
            </div>
          </template>

          <!-- авторизован -->
          <template v-else>
            <div class="header__right-true">
              <div class="header__right-block">
                <div class="header__right-icons">
                  <a class="icon">
                    <img src="/src/assets/img/uved.svg" />
                  </a>
                  <a class="icon">
                    <img src="/src/assets/img/mes.svg" />
                  </a>
                </div>
                <button class="btn-light">
                  <img src="/src/assets/img/location_on.svg" />
                  Регион
                </button>
              </div>

              <!-- профиль -->
              <div class="profile-wrapper">
                <div class="profile" @click.stop="toggleProfileMenu">
                  <div class="profile-block">
                    <img :src="auth.user?.avatar" class="avatar" />
                    <img
                      src="/src/assets/img/arrow-profil.svg"
                      class="arr-profil"
                      :class="{ rotate: showProfileMenu }"
                    />
                  </div>
                  <span>
                    {{ auth.user?.name }}
                  </span>
                </div>

                <!-- dropdown -->
                <transition name="fade">
                  <div v-if="showProfileMenu" class="profile-menu">
                    <div class="rating">4,8 ★★★★★</div>
                    <ul>
                      <li><a href="">Мои ролики</a></li>
                      <li><a href="">Мои объявления</a></li>
                      <li><a href="">Создать объявление</a></li>
                      <li><a href="">Заказы</a></li>
                      <li><a href="">Избранное</a></li>
                      <li><a href="">Сообщения</a></li>
                      <li><a href="">Уведомления</a></li>
                      <li class="logout" @click="askLogout">Выйти</li>
                    </ul>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { useMenuStore } from "/src/stores/menu.js"

const modal = useModalStore();
const menu = useMenuStore();
const auth = useAuthStore();

const showNotification = ref(false);
const notificationText = ref("");
const showProfileMenu = ref(false);
const showLogoutConfirm = ref(false);


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
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function cancelLogout() {
  showLogoutConfirm.value = false;
}

function handleClickOutside(e) {
  const profile = document.querySelector(".profile-wrapper");
  if (profile && !profile.contains(e.target)) {
    showProfileMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("notify", (e) => {

    notificationText.value = e.detail
    showNotification.value = true

    setTimeout(() => {
      showNotification.value = false
    }, 3000)

  })
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
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

.logo {
  position: relative;
  margin-left: 2.813rem;
  top: 1.5rem;
}
.logo span {
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  z-index: 1;
  font-size: 2rem;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  background: var(--btn-bg);
  color: white;
  font-weight: 300;
  /* width: 11.5rem; */
  height: 3.125rem;
  padding: 0.175rem 0.75rem 0.375rem 0.75rem;
  border-radius: 1.25rem;
  position: relative;
  z-index: 1;
  display: flex;
  font-family: Arial;
  letter-spacing: 1px;
}
.logo::after {
  position: absolute;
  content: "";
  background-image: url('/src/assets/img/logo-h.svg');
  width: 4.75rem;
  height: 5.5rem;
  top: -2.3rem;
  left: -2.813rem;
  z-index: 0;
  background-repeat: no-repeat;
  background-position: center;
}

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

.profile-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile-menu li {
  padding: 0.625rem 0.938rem;
  cursor: pointer;
  border-radius: 0.5rem;
}

.profile-menu li:hover {
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

/* animation */
.fade-enter-active,
.fade-leave-active {
  transition: 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.logout-actions .btn-light {
  height: auto;
  border-radius: 1.25rem;
}
</style>
