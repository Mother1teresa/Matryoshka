<template>
  <div class="profile-container">
    <h2 class="page-title">Личный кабинет</h2>
    <div class="profile-card">
      <button class="settings-btn" @click="isModalOpen = true">
        <img src="/src/assets/img/icons/settings-gear.svg" alt="settings" />
      </button>
      <div class="user-header">
        <img :src="auth.userAvatar" class="large-avatar" />
        <div class="rating-badge">
          <span class="rating-num">{{ reviewStore.getRatingById(auth.user?.id) }}</span>
          <span class="stars">★★★★★</span>
        </div>
        <p class="user-type">
          {{ auth.user?.type === 'company' ? 'Компания' : 'Частное лицо' }}
        </p>
      </div>
      <div class="user-info-list">
        <div class="info-row">
          <span class="label">Имя</span>
          <span class="value">{{ auth.user?.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Телефон</span>
          <span class="value">{{ auth.formattedPhone }}</span>
        </div>
        <div class="info-row">
          <span class="label">E-mail</span>
          <span class="value email">{{ auth.user?.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">Город</span>
          <span class="value">{{ auth.user?.city || 'Не указан'}}</span>
        </div>
        <div class="info-row" v-if="auth.user?.type === 'company' && auth.user?.employeeName">
          <span class="label">Сотрудник</span>
          <span class="value">
            {{ auth.user.employeeName }} {{ auth.user.employeeRole ? `- ${auth.user.employeeRole}` : '' }}
          </span>
        </div>
      </div>
      <div class="about-section">
        <h3>Об исполнителе</h3>
        <p>{{ auth.user?.description || 'Описание отсутствует' }}</p>
      </div>
</div>
</div>
<ProfileEditModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false" 
      @refresh="fetchUserData"
/>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '/src/stores/authStore.js'; 
import { useReviewStore } from '/src/stores/reviews.js';
import ProfileEditModal from '../ProfileEditModal.vue';

const reviewStore = useReviewStore();
const auth = useAuthStore();
const isModalOpen = ref(false);

const fetchUserData = async () => {
  try {
    auth.loadAuth(); 
    await auth.fetchProfile();
  } catch (e) {
    console.error("Не удалось загрузить данные профиля:", e);
  }
};

onMounted(() => {
  fetchUserData();
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
watch(isModalOpen, (newVal) => {
  if (newVal) {
    document.body.classList.add("overflow-mod");
  } else {
    document.body.classList.remove("overflow-mod");
  }
});
</script>
<style scoped>
.profile-container {
  max-width: 54rem;
  margin: 0 auto;
  background-color: #F5F5F5;
  transition: width .3s;
  display: grid;
  justify-items: center;
  padding: 2.188rem 0 0;
}

.profile-card {
  background: #fff;
  border-radius: 0.625rem;
  padding: 1.25rem 3.513rem 4.25rem 3.513rem;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  width: 33.063rem;
}

.settings-btn {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  width: 3.75rem;
  height: 3.75rem;
}
.settings-btn img{
  width: 3.75rem;
  height: 3.75rem;
}
.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
}
.stars {
  color: #64A07A;
  letter-spacing: 2px;
  font-size: 2.65rem;
}

.user-type {
  font-size: 1.5rem;
  margin-top: 2.375rem;
  font-weight: 700;
}

.user-info-list {
  display: grid;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.info-row {
  display: flex;
  justify-content: flex-start;
  gap: 1.5rem;
  font-size: 1.5rem; 
}

.label {
  font-weight: 700;
  color: #000;
  width: 6.563rem;
}

.value {
  text-align: left;
  word-break: break-all; 
  overflow-wrap: break-word; 
  display: inline-block; 
  max-width: 100%;
  width: 17.813rem;
}

.value.email {
  text-decoration: underline;
  color: #000;
}

.about-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.688rem;
}

.about-section p {
  font-size: 1.5rem;
  text-align: left;
}
</style>
