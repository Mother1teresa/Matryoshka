<template>
  <div class="profile-layout container">
    <!-- Боковое меню -->
    <aside class="profile-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          {{ isCollapsed ? "→" : "←" }}
        </button>
        <router-link to="/" class="logo" v-if="!isCollapsed">
          <span>Матрёшка</span>
        </router-link>
        <router-link to="/profile/info" class="user-foto" v-if="!isCollapsed">
          <img
            :src="auth.userAvatar"
            class="user-avatar"
          />
          <span class="user-name">{{ auth.user?.name }}</span>
        </router-link>
        <div class="user-brief" v-if="!isCollapsed">
          <div class="rating">
            <p>{{ reviewStore.averageRating }}</p>
            <span>{{
              reviewStore.renderStars(reviewStore.averageRating)
            }}</span>
          </div>
        </div>
      </div>
      <nav class="profile-nav" v-if="!isCollapsed">
        <router-link to="/profile/info">Мои данные</router-link>
        <router-link to="/profile/ads">Мои объявления</router-link>
        <router-link to="/profile/video">Мои ролики</router-link>
        <router-link to="/profile/create">Создать объявление</router-link>
        <router-link to="/profile/orders">Заказы</router-link>
        <router-link to="/profile/responses">Отклики</router-link>
        <router-link to="/profile/resume">Резюме</router-link>
        <router-link to="/profile/favorites">Избранное</router-link>
        <router-link to="/profile/invite">Приглашайте друзей</router-link>
        <router-link to="/profile/messages">Сообщения</router-link>
        <router-link to="/profile/notifications">Уведомления</router-link>
        <router-link to="/profile/reviews">Отзывы</router-link>

        <div class="nav-footer">
          <button class="edu-btn">Обучение</button>
        </div>
      </nav>
    </aside>

    <main class="profile-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";

const reviewStore = useReviewStore();
const auth = useAuthStore();
const isCollapsed = ref(false);
onMounted(() => {
  if (auth.user?.id) {
    reviewStore.fetchReviewsBySeller(auth.user.id);
  }
});
</script>

<style scoped>
.profile-layout {
  display: flex;
  gap: 30px;
  min-height: 100vh;
}
.profile-sidebar {
  width: 15.625rem;
  padding: 2.188rem 0 0 0;
  background: #f5f5f5;
  border-right: 1px solid #000000;
  position: relative;
  padding-bottom: 20.25rem;
}
.profile-sidebar.is-collapsed {
  width: 80px;
}
.profile-main {
  flex: 1;
}
.profile-nav a {
  display: block;
  text-decoration: none;
  padding: 1.031rem 0 1.031rem 1.875rem;
  font-size: 1.25rem;
}
.profile-nav a.router-link-active {
  color: #64a07a;
}
.user-foto {
  display: flex;
  gap: 1.188rem;
  align-items: center;
  margin-bottom: 0.613rem;
  padding-left: 1.875rem;
  margin-top: 5rem;
}
.rating {
  font-size: 1.5rem;
  display: flex;
  gap: 0.8rem;
}
.rating p {
  width: 2.125rem;
}
.user-brief {
  margin-bottom: .8rem;
  padding-left: 2.45rem;
}
.nav-footer {
  margin-top: 2rem;
  margin-left: 1.875rem;
  font-size: 1.25rem;
  background: #64a07a;
  width: fit-content;
  color: white;
  width: 9.563rem;
  padding: 1.125rem 0 1.125rem 1rem;
  border-radius: 1.875rem;
}
.user-avatar {
  width: 3.688rem;
  height: 3.938rem;
  border-radius: 3.438rem;
}
.collapse-btn {
  position: absolute;
  font-size: 2.35rem;
  top: -8px;
  right: 5px;
}
.user-name {
  font-size: 1.5rem;
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
</style>
