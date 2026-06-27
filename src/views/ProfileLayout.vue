<template>
  <div class="profile-layout container">
    <!-- Боковое меню -->
    <aside class="profile-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <img src="/src/assets/img/icons/arr-collapse.svg" alt="toggle" :class="{ 'is-rotated': isCollapsed }" />
        </button>
        <router-link to="/" class="logo" :class="{ 'hidden-content': isCollapsed }">
          <span>Матрёшка</span>
        </router-link>
        <router-link to="/profile/info" class="user-foto" :class="{ 'hidden-content': isCollapsed }">
          <img
            :src="auth.userAvatar"
            class="user-avatar"
          />
          <span class="user-name">{{ auth.user?.name }}</span>
        </router-link>
        <div class="user-brief" :class="{ 'hidden-content': isCollapsed }">
          <div class="rating">
            <p>{{ userRating  }}</p>
            <span>{{ userStars }}</span>
          </div>
        </div>
      </div>
      <nav class="profile-nav">
        <router-link to="/profile/info" :class="{ 'hidden-content': isCollapsed }">Мои данные</router-link >
        <router-link to="/profile/advertisements":class="{ 'hidden-content': isCollapsed }">Мои объявления</router-link>
        <router-link to="/profile/videos":class="{ 'hidden-content': isCollapsed }">Мои ролики</router-link>
        <router-link to="/profile/create-ad":class="{ 'hidden-content': isCollapsed }">Создать объявление</router-link>
        <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Заказы</a>
        <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Отклики</a>
        <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Резюме</a>
        <router-link to="/profile/favorites":class="{ 'hidden-content': isCollapsed }">Избранное</router-link>
        <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Приглашайте друзей</a>
        <router-link to="/profile/messages":class="{ 'hidden-content': isCollapsed }">Сообщения
          <span v-if="auth.unreadMessagesCount > 0" class="badge-count">
            {{ auth.unreadMessagesCount }}
          </span>
        </router-link>
        <router-link to="/profile/notifications":class="{ 'hidden-content': isCollapsed }">Уведомления
          <span v-if="auth.unreadNotificationsCount > 0" class="badge-count">
            {{ auth.unreadNotificationsCount }}
          </span>
        </router-link>
        <router-link to="/profile/reviews":class="{ 'hidden-content': isCollapsed }">Отзывы</router-link>
        <div class="nav-footer">
          <button class="edu-btn" @click="handleEduClick">Обучение</button>
        </div>
      </nav>
    </aside>
    <main class="profile-main">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { ref, watch, computed, inject  } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";

const reviewStore = useReviewStore();
const auth = useAuthStore();
const openMaintenance = inject('openMaintenance');
const isCollapsed = ref(false);
const userRating = computed(() => reviewStore.getRatingById(auth.user?.id));
const userStars = computed(() => reviewStore.renderStars(userRating.value));

const handleEduClick = () => {
  openMaintenance();
};
const unavailableRoutes = [
  '/profile/orders',
  '/profile/responses',
  '/profile/resume',
  '/profile/referral'
];
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2.5rem;
  min-height: 100vh;
  width: 94.5rem;
}
.profile-sidebar {
  width: 15.625rem;
  padding: 2.188rem 0 0 0;
  background: #f5f5f5;
  border-right: 1px solid #000000;
  position: relative;
  padding-bottom: 20.25rem;
  transition: width 0.3s ease;
  /* overflow: hidden;  */
  white-space: nowrap;
}
.profile-sidebar.is-collapsed {
  width: 2.5rem;
}
.hidden-content {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.05s ease;
}

.profile-sidebar:not(.is-collapsed) .hidden-content {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition: opacity 0.4s ease-out 4s; 
}
.profile-main {
  flex: 1;
  margin-bottom: 5rem;
}
.profile-nav a {
  display: block;
  text-decoration: none;
  padding: 1.031rem 0 1.031rem 1.875rem;
  font-size: 1.25rem;
  position: relative;
}
.profile-nav a.router-link-active {
  color: var(--btn-bg);
}
.user-foto {
  display: flex;
  gap: .9rem;
  align-items: center;
  margin-bottom: 0.813rem;
  padding-left: 1.875rem;
  margin-top: 5rem;
}
.rating {
  font-size: 1.65rem;
  display: flex;
  gap: 0.4rem;
}
.rating p {
  width: 2.125rem;
  text-align: center;
}
.user-brief {
  margin-bottom: .8rem;
  padding-left: 2.65rem;
}
.nav-footer {
  margin-top: 2rem;
  margin-left: 1.875rem;
  font-size: 1.25rem;
  background: var(--btn-bg);
  width: fit-content;
  color: white;
  width: 9.563rem;
  padding: 1.125rem 0 1.125rem 1rem;
  border-radius: 1.875rem;
  position: relative;
  cursor: pointer;
  user-select: none;
  display: flex;
}

.nav-footer::after {
  content: '';
  position: absolute;
  top: -1.8rem;
  right: -2rem;
  width: 4.75rem;
  height: 4.75rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='glow' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23ccffcc'/%3E%3Cstop offset='30%25' stop-color='%2300ff00'/%3E%3Cstop offset='100%25' stop-color='%2300ff00' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='60' fill='url(%23glow)' opacity='0.8'/%3E%3Cg stroke='%2333ff33' stroke-width='2' stroke-linecap='round' filter='url(%23blur)'%3E%3Cline x1='100' y1='20' x2='100' y2='180'/%3E%3Cline x1='20' y1='100' x2='180' y2='100'/%3E%3Cline x1='50' y1='50' x2='150' y2='150'/%3E%3Cline x1='150' y1='50' x2='50' y2='150'/%3E%3C/g%3E%3Cpath d='M100 85 L105 100 L100 115 L95 100 Z' fill='white'/%3E%3Cpath d='M85 100 L100 95 L115 100 L100 105 Z' fill='white'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  z-index: 10;
  transition: transform 0.3s ease;
}

/* При наведении на кнопку — звезда шевелится */
.nav-footer:hover::after {
  animation: starWiggle 0.6s ease-in-out infinite;
}

@keyframes starWiggle {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(8deg) scale(1.05);
  }
  50% {
    transform: rotate(-6deg) scale(1.08);
  }
  75% {
    transform: rotate(4deg) scale(1.05);
  }
}

.user-avatar {
  width: 3.688rem;
  height: 3.938rem;
  border-radius: 3.438rem;
}
.collapse-btn {
  position: absolute;
  font-size: 2.35rem;
  top: .3rem;
  right: 5px;
}
.collapse-btn img {
  width: 1.375rem; 
  height: 20px;
  transition: transform 0.3s ease; 
}

.collapse-btn img.is-rotated {
  transform: rotate(180deg); 
}
.user-name {
  font-size: 1.2rem;
  font-weight: 400;
  white-space: normal;
  width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
.logo {
  position: relative;
  margin-left: 2.813rem;
  top: 8px;
  right: -42px;
}
.logo span{
  width: fit-content;
}
.logo::after{
  top: -0.6rem;
  left: -5.813rem;
}

@media (max-width: 77rem) {
  .profile-layout{
    width: 72.5rem;
  }
}
</style>
