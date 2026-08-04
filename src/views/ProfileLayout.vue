<template>
  <div class="profile-layout container">
    <!-- Боковое меню -->
    <aside class="profile-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="profile-sidebar_block">
        <div class="sidebar-header">
          <!-- <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <img src="/src/assets/img/icons/arr-collapse.svg" alt="toggle" :class="{ 'is-rotated': isCollapsed }" />
          </button> -->
          <router-link to="/" class="logo" :class="{ 'hidden-content': isCollapsed }">
            <span>Матрёшка</span>
          </router-link>
          <router-link to="/profile/info" class="user-foto" :class="{ 'hidden-content': isCollapsed }">
            <div class="user-foto_block">
              <img
                :src="auth.userAvatar"
                class="user-avatar"
              />
              <span class="user-name">{{ auth.user?.name }}</span>
            </div>
            <div class="user-brief" :class="{ 'hidden-content': isCollapsed }">
              <div class="rating">
                <p>{{ userRating  }}</p>
                <div class="stars-row">
                  <img
                    v-for="n in 5"
                    :key="n"
                    :src="n <= Math.round(userRating) ? '/src/assets/img/form/star.png' : '/src/assets/img/form/star_1.png'"
                    class="star-icon"
                    alt="★"
                  />
                </div>
              </div>
            </div>
          </router-link>
          
        </div>
        <nav class="profile-nav">
          <div class="profile-nav_a">
            <router-link to="/profile/advertisements":class="{ 'hidden-content': isCollapsed }">Мои объявления</router-link>
            <router-link to="/profile/videos":class="{ 'hidden-content': isCollapsed }">Мои ролики</router-link>
            <!-- <router-link to="/profile/create-ad":class="{ 'hidden-content': isCollapsed }">Создать объявление</router-link> -->
            <!-- <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Заказы</a>
            <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Отклики</a>
            <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Резюме</a> -->
            <router-link to="/profile/favorites":class="{ 'hidden-content': isCollapsed }">Избранное</router-link>
            <!-- <a class="locked-link" @click="openMaintenance":class="{ 'hidden-content': isCollapsed }">Приглашайте друзей</a> -->
            <router-link to="/profile/messages":class="{ 'hidden-content': isCollapsed }">Сообщения
              <!-- <span v-if="auth.unreadMessagesCount > 0" class="badge-count">
                {{ auth.unreadMessagesCount }}
              </span> -->
            </router-link>
            <router-link to="/profile/notifications":class="{ 'hidden-content': isCollapsed }">Уведомления
              <!-- <span v-if="auth.unreadNotificationsCount > 0" class="badge-count">
                {{ auth.unreadNotificationsCount }}
              </span> -->
            </router-link>
            <router-link to="/profile/reviews":class="{ 'hidden-content': isCollapsed }">Отзывы</router-link>
            <router-link to="/profile/info" :class="{ 'hidden-content': isCollapsed }">Мои данные</router-link>
          </div>
          <div class="nav-footer">
            <button class="edu-btn" @click="handleEduClick">Обучение</button>
          </div>
        </nav>
      </div>
    </aside>
    <main class="profile-main">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { ref, watch, computed, inject  } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";

const auth = useAuthStore();
const openMaintenance = inject('openMaintenance');
// const isCollapsed = ref(false);

// Рейтинг напрямую из профиля
const userRating = computed(() => auth.user?.rating || 0);

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
.profile-layout {display: grid;grid-template-columns: auto 1fr;gap: 2.5rem;min-height: 100vh;width: 94.5rem;}
.profile-sidebar {width: 15.625rem;padding: 2.188rem 1rem 5.25rem 0;background: #f5f5f5;position: relative;transition: width 0.3s ease;white-space: nowrap;}
.profile-sidebar.is-collapsed {width: 2.5rem;}
.hidden-content {opacity: 0;pointer-events: none;transition: opacity 0.05s ease;}
.profile-sidebar:not(.is-collapsed) .hidden-content {opacity: 1;transform: translateY(0);pointer-events: auto;transition: opacity 0.4s ease-out 4s; }
.profile-main {flex: 1;margin-bottom: 5rem;}
.profile-nav a {display: block;text-decoration: none;padding: 0.875rem 0.625rem;font-size: 1.25rem;font-weight: 700;position: relative;transition: background .3s;border-radius: 0.938rem;}
.profile-nav a:hover{background: var(--bg-defort);border-radius: 0.938rem;}
.profile-nav a.router-link-active {background: var(--bg-defort);box-shadow: 0px 4px 4px 0px #00000040;}
.profile-nav_a{display: grid;gap: 0.438rem;}
.user-foto {display: flex;gap: .9rem;align-items: center;margin-bottom: 0.375rem;padding: 1rem 0.813rem 0.813rem 0.813rem;margin-top: 3.5rem;background: var(--bg-defort);display: grid;gap: 0.563rem;}
.user-foto_block{display: flex;align-items: center;gap: 0.938rem;}
.rating {font-size: 1.25rem;display: flex;gap: 0.563rem; color: var(--btn-bg); font-weight: 700;}
.rating p {width: auto;text-align: center;}
.nav-footer {margin-top: 1.313rem;font-size: 1.25rem;background: var(--btn-bg);width: fit-content;color: var(--bg-defort);padding: 1.125rem 1.688rem;border-radius: 1.875rem;position: relative;cursor: pointer;user-select: none;display: flex;}
.user-avatar {width: 3.688rem;height: 3.938rem;border-radius: 3.438rem;}
.collapse-btn {position: absolute;font-size: 2.35rem;top: .3rem;right: 5px;}
.collapse-btn img {width: 1.375rem; height: 20px;transition: transform 0.3s ease; }
.collapse-btn img.is-rotated {transform: rotate(180deg); }
.user-name {font-size: 1.5rem;font-weight: 700;white-space: normal;width: 7rem;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;display: inline-block; text-transform: capitalize;}
.logo {position: relative;margin-left: 2.813rem;top: 0.5rem;right: -2.625rem;}
.logo span{width: fit-content;font-weight: 700;}
.logo::after{top: -0.6rem;left: -5.813rem;}
.stars-row {display: flex;align-items: center;gap: 0.15rem;}
.user-brief{display: flex; justify-content: flex-end;margin-right: 1.8rem;}
@media (max-width: 77rem) {
  .profile-layout{
    width: 72.5rem;
  }
}
</style>
