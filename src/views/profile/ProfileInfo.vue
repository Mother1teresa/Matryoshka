<template>
  <div class="profile-container">
    <h2 class="page-title">Управление профилем
      <button v-if="auth.user?.editable !== false" class="settings-btn" @click="isModalOpen = true">
        Редактировать
      </button>
    </h2>
    <div class="profile-card">
      <div class="user-header">
        <div class="summary-card">
          <img :src="auth.userAvatar" class="large-avatar" />
          <div class="summary-info">
            <div class="user-type">{{ userRole === 'COMPANY' ? 'Компания' : 'Частное лицо' }}</div>

            <div v-if="userRating > 0" class="rating-badge">
              <span class="rating-num">{{ userRating }}</span>
              <div class="stars">
                <img
                  v-for="n in 5"
                  :key="n"
                  :src="n <= Math.round(userRating) ? '/src/assets/img/form/star.png' : '/src/assets/img/form/star_1.png'"
                  class="star-icon"
                  alt="★"
                />
              </div>
            </div>
            
            <div v-if="userRating === 0" class="empty-state">
              <div class="empty-title">У вас пока нет отзывов</div>
              <div class="empty-subtitle">Разместите объявление или опубликуйте мини-видео</div>
            </div>
          </div>
        </div>
        <div class="creat-akk">{{ "Аккаунт создан " + formatDate(auth.user.createdAt) }}</div>
        
      </div>
      <div class="user-info-lists">
        <div class="user-info-list">
          <div class="info-row tyk">
            <span class="label">{{ userRole === 'COMPANY' ? 'Название компании' : 'Имя' }}</span>
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
          <div class="info-row tyk">
            <span class="label">Город</span>
            <span class="value">{{ auth.user?.city || 'Не указан' }}</span>
          </div>
          <div class="info-row company" v-if="userRole === 'COMPANY' && auth.user?.employees?.[0]?.name">
            <span class="label">Сотрудник</span>
            <span class="value">
              <span class="employee-name">{{ auth.user.employees[0].name }}</span>br>
              {{ getPositionName(auth.user.employees[0].position) }}
            </span>
          </div>
        </div>
        <div class="about-section">
          <h3>{{ userRole === 'COMPANY' ? 'О компании' : 'Об исполнителе' }}</h3>
          <p>{{ auth.user?.description || 'Описание отсутствует' }}</p>
        </div>
      </div>
    </div>
  </div>
  <ProfileEditModal :isOpen="isModalOpen" @close="isModalOpen = false" @refresh="fetchUserData"/>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '/src/stores/authStore.js';
import ProfileEditModal from '../ProfileEditModal.vue';
import { formatDate } from "/src/utils/formatters.js"

const auth = useAuthStore();
const isModalOpen = ref(false);

// Рейтинг напрямую из профиля
const userRating = computed(() => auth.user?.rating || 0);

const fetchUserData = async () => {
  if (!auth.user?.id) {
    console.log("user.id ещё не загружен, пропускаем");
    return;
  }
  try {
    await auth.fetchProfile(); // Тут rating обновится в auth.user
  } catch (e) {
    console.error("Не удалось загрузить данные профиля:", e);
  }
};

const userRole = computed(() => auth.user?.role);
const positionMap = {
  'manager': 'Менеджер по продажам',
  'director': 'Директор',
  'employee': 'Сотрудник'
};

const getPositionName = (position) => {
  if (!position) return '';
  return positionMap[position] ? ` ${positionMap[position]}` : ` ${position}`;
};

onMounted(() => { fetchUserData(); });

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
  /* max-width: 54rem;
  margin: 0 auto; */
  background-color: #F5F5F5;
  transition: width .3s;
  display: grid;
  justify-items: center;
  padding: 2.188rem 0 0;
}
.profile-card {
  position: relative;
  width: 100%;
  margin-top: 1.25rem;
}
.settings-btn {
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 1.125rem 2.875rem;
  background: var(--btn-bg);
  color: #F5F5F5;
  transition: opacity .3s;
  border-radius: 1.25rem;
}
.settings-btn:hover{
  opacity: 0.6;
}
.settings-btn img{
  width: 3.75rem;
  height: 3.75rem;
}
.user-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  background-color: white;
  border-radius: 1.25rem;
  padding: 2.25rem 1.25rem;
  position: relative;
}
.user-header .rating-num{
  font-size: 1.25rem;
  font-weight: 700;
  width: fit-content;
}
.user-info-lists{
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.25rem;
  width: 100%;
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #242424;
}
.user-type {
  font-size: 1.25rem;
  color: #262626;
  font-weight: 700;
}
.stars {
  display: flex;
  gap: 0.125rem;
}
.empty-hint {
  font-size: 0.875rem;
  color: #888;
  margin-top: 0.25rem;
}
.empty-state {
  text-align: left;
  margin-top: 0.75rem;
}
.empty-title {
  font-size: 1.25rem;
  color: #262626;
}
.empty-subtitle {
  font-size: 0.813rem;
  color: #858685;
  margin-top: 0.625rem;
}
.large-avatar {
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-info-list {display: grid;gap: 1.2rem;margin-bottom: 2.5rem;}
.info-row {display: flex;justify-content: flex-start;align-items: baseline;gap: 1.5rem;font-size: 1.25rem; }
.tyk{text-transform: capitalize;}
.label {font-weight: 700;color: #262626;width: 10.563rem;font-size: 1.25rem;}
.value {text-align: left;word-break: break-all; overflow-wrap: break-word; display: inline-block; max-width: 100%;width: 17.813rem;font-size: 1.25rem;}
.value.email {text-decoration: underline;color: #262626;}
.about-section{display: flex;gap: 1.5rem;}
.about-section h3 {font-size: 1.25rem;font-weight: 700;width: 10.563rem;}
.about-section p {font-size: 1.25rem;text-align: left;}
.creat-akk{position: absolute; bottom: 1.25rem; right: 1.25rem; color: #626262; font-size: 0.813rem;}
</style>
