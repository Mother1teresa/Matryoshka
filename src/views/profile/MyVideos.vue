<template>
  <div class="general-container videos-page">
    <transition name="fade-fast" mode="out-in">
      <div v-if="!isCreating" key="list">
        <div class="header-row">
          <h2 class="page-title">Мои ролики</h2>
          <button v-if="activeTab === 'active'" class="btn promo-btn">
            Продвижение
          </button>
        </div>
        <div class="create-video-section">
          <div class="create-box">
            <div class="camera-icon-circle">
              <img src="/src/assets/img/icons/camera.svg" alt="camera" />
            </div>
            <button class="btn create-btn" @click="isCreating = true">Создать свой ролик</button>
          </div>
        </div>
        <div class="create-video__block">
          <!-- Табы -->
          <div class="tabs-nav">
            <button
              :class="{ active: activeTab === 'active' }"
              @click="activeTab = 'active'">
              Действующие
            </button>
            <button
              :class="{ active: activeTab === 'archive' }"
              @click="activeTab = 'archive'">
              Архив
            </button>
          </div>
          <div class="tab-content">
            <div v-if="isLoading" class="loading-state">Загрузка...</div>
            <div v-else>
              <div
                v-if="currentVideos.length > 0"
                class="videos-grid"
                :class="activeTab">
                <div
                  v-for="video in currentVideos"
                  :key="video.id"
                  class="video-item"
                  :class="{ 'archived-item': activeTab === 'archive' }">
                  <div class="video-card" @click="openVideo(video.id)">
                    <video 
                      v-if="video.thumbnail && video.thumbnail.endsWith('.mp4')" 
                      :src="video.thumbnail" 
                      class="thumbnail" 
                      preload="metadata"
                      muted
                      playsinline
                    ></video>
                    <img 
                      v-else 
                      :src="video.thumbnail" 
                      class="thumbnail" 
                      alt="Превью" 
                    />
                    <button
                      class="menu-dots-btn"
                      @click.stop="toggleMenu(video.id)">
                      <span></span><span></span><span></span>
                    </button>
                    <!-- Выпадающее меню -->
                    <div
                      v-if="activeMenuId === video.id"
                      class="video-dropdown-menu">
                      <button
                        v-if="!video.isArchived"
                        @click.stop="handleArchive(video.id, true)">
                        В архив
                      </button>
                      <button v-else @click.stop="handleArchive(video.id, false)">
                        Опубликовать заново
                      </button>
                      <button
                        class="delete-btn"
                        @click.stop="handleDelete(video.s3Key)">
                        Удалить
                      </button>
                    </div>
                    <div v-if="activeTab === 'archive'" class="archive-overlay">
                      Архив
                    </div>
                    <div class="video-overlay">
                      <span class="duration">{{ video.duration || "0:11" }}</span>
                    </div>
                  </div>
                  <div class="video-info">
                    <template v-if="activeTab === 'active'">
                      <div class="stats-line">
                        <!-- Исправлено на camelCase под структуру из Store -->
                        <div class="stat" :title="formatFullNumber(video.viewsCount)">
                          <img src="/src/assets/img/icons/eye.svg" />
                          {{ formatNumber(video.viewsCount) }}
                        </div>
                        <div class="stat" :title="formatFullNumber(video.likesCount)">
                          <img src="/src/assets/img/icons/heart.svg" />
                          {{ formatNumber(video.likesCount) }}
                        </div>
                        <div class="stat" :title="formatFullNumber(video.commentsCount)">
                          <img src="/src/assets/img/icons/comment.svg" />
                          {{ formatNumber(video.commentsCount || 0) }}
                        </div>
                      </div>
                      <p class="video-description">
                        {{
                          video.description ||
                          "Везем коробки со склада быстро и без проблем, звоните по номеру "
                        }}
                      </p>
                    </template>
                    <template v-else>
                      <div class="archive-info">
                        <span class="status-label">Снято с публикации</span>
                        <button
                          class="restore-link"
                          @click="handleArchive(video.id, false)"
                        >
                          Опубликовать снова
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else class="empty-messages"> <!-- Пустое состояние -->
                <div class="empty-icon">🎬</div>
                <h3>
                  {{
                    activeTab === "active" ? "У вас пока нет активных роликов" : "Архив пуст"
                  }}
                </h3>
                <p>{{ activeTab === "active"  ? "Создайте свой первый ролик, чтобы привлечь больше покупателей к вашим объявлениям." : "Когда вы перенесете действующий ролик в архив, он появится здесь." }}</p>
                <router-link to="/" class="btn go-to-ads-btn">Найти объявления</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <VideoCreateForm v-else key="form" @back="isCreating = false" @success="handleVideoCreated($event)"/>
    </transition>
  </div>
  <!-- Модальное окно подтверждения -->
  <transition name="fade">
    <div v-if="isConfirmOpen" class="modal-overlay" @click.self="closeConfirm">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-modal__content">
          <h2>Удалить ролик?</h2>
          <p>Вы действительно хотите удалить этот ролик? Это действие невозможно отменить.</p>
        </div>
        <div class="confirm-modal__actions">
          <button type="button" class="btn go-to-ads-btn" @click="confirmDelete">Удалить</button>
          <button class="btn" @click="closeConfirm">Отмена</button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import VideoCreateForm from '../VideoCreateForm.vue';
import { notify } from "/src/utils/notify";
import { formatNumber, formatFullNumber  } from "/src/utils/formatters.js";

const emit = defineEmits(['refresh', 'close']);

const auth = useAuthStore();
const activeMenuId = ref(null);
const activeTab = ref("active");

const isLoading = computed(() => auth.isVideosLoading);
const isDeleting = ref(false); 
const allVideos = computed(() => {
  const videos = auth.allVideos;
  return Array.isArray(videos) ? videos : [];
});

const isCreating = ref(false);

const activeVideos = computed(() =>
  allVideos.value.filter((v) => v.isArchived === true ? false : true)
);
const archivedVideos = computed(() =>
  allVideos.value.filter((v) => v.isArchived === true)
);
const currentVideos = computed(() =>
  activeTab.value === "active" ? activeVideos.value : archivedVideos.value
);

const handleArchive = (id, status) => {
  auth.toggleArchiveLocal(id, status);
  activeMenuId.value = null;
};

const isConfirmOpen = ref(false);
const videoToDelete = ref(null);

const handleDelete = (s3Key) => {
  console.log("Маркер удаления (s3Key):", s3Key);
  videoToDelete.value = s3Key;
  isConfirmOpen.value = true;
  activeMenuId.value = null; 
};

const closeConfirm = () => {
  isConfirmOpen.value = false;
  videoToDelete.value = null;
};

const confirmDelete = async () => {
  if (!videoToDelete.value || isDeleting.value) return;
  try {
    isDeleting.value = true;
    const success = await auth.deleteVideo(videoToDelete.value);
    if (success) {
      notify("Ролик успешно удален");
      closeConfirm();
    }
  } catch (e) {
    notify("Ошибка сервера. Не удалось удалить", "error");
  } finally {
    isDeleting.value = false;
  }
};

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const closeMenu = (e) => {
  if (!e.target.closest('.video-card')) {
    activeMenuId.value = null;
  }
};
onMounted(() => {
  auth.fetchVideos();
  window.addEventListener("click", closeMenu);
});
onUnmounted(() => {
  window.removeEventListener("click", closeMenu);
});
const handleVideoCreated = (createdMedia) => {
  isCreating.value = false; 
  
  if (createdMedia && typeof createdMedia === 'object') {
    const fallbackVideo = {
      ...createdMedia,
      id: createdMedia.id || Date.now(),
      s3Key: createdMedia.s3Key || createdMedia.fileName,
      thumbnail: createdMedia.cdnUrl || createdMedia.url,
      description: createdMedia.description || 'Действующий ролик',
      isArchived: false,
      likesCount: 0,
      viewsCount: 0,
      commentsCount: 0,
      author: {
        name: auth.user?.name || 'Пользователь',
        avatar: auth.userAvatar
      }
    };
    auth.allVideos = [fallbackVideo, ...auth.allVideos];
  }
  setTimeout(() => {
    auth.fetchVideos();
  }, 1000);
};
</script>

<style scoped>
.videos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
.video-item {
  background: white;
  padding: 0.438rem 0.625rem 1.063rem 0.625rem;
  border-radius: 1.25rem;
}
.video-card {
  position: relative;
  aspect-ratio: 9/12;
  overflow: hidden;
  height: 20.938rem;
  width: 100%;
}

.archived-item .video-card {
  filter: grayscale(0.5);
  opacity: 0.8;
}
.archive-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  height: 20.5rem;
  border-radius: 1.25rem;
  z-index: 1;
}
.archive-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.status-label {
  color: #888;
  font-size: 0.86rem;
}
.restore-link {
  color: #27ae60;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.86rem;
}
.tabs-nav {
  display: flex;
  gap: 4rem;
  margin-bottom: 1.625rem;
}
.tabs-nav button {
  padding-bottom: 0.625rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #000000;
  cursor: pointer;
  position: relative;
  border-radius: 0;
  border-bottom: 1px solid #020202;
}
.tabs-nav button.active {
  border-bottom: 1px solid #64a07a;
  color: #64a07a;
}

.create-box {
  width: 15rem;
  height: 17.5rem;
  border-radius: 1.25rem;
  padding: 3rem 0.625rem 0.625rem 0.625rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto 1.25rem;
  background-color: white;
}
.create-btn {
  background-color: var(--btn-bg);
  width: 100%;
  font-size: 1.25rem;
  color: white;
  padding: 0.438rem 0.688rem;
  text-align: center;
}
.create-video__block {
  border: 1px solid #d0d0d0;
  border-radius: 0.625rem;
  padding: 1rem 0.625rem;
}
/* Кнопка три точки */
.menu-dots-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 1.375rem;
  height: 1.5rem;
  border-radius: 0.438rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
}

.menu-dots-btn span {
  width: 0.17rem;
  height: 0.17rem;
  background: white;
  border-radius: 50%;
}
/* Выпадашка */
.video-dropdown-menu {
  position: absolute;
  top: 2.4rem;
  right: 0.8rem;
  background: var(--btn-bg);
  border-radius: 0.438rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;
  max-width: 13.975rem;
  color: #f5f5f5;
  overflow: hidden;
}
.video-dropdown-menu button {
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.955rem;
  cursor: pointer;
  border-radius: 0;
  transition: 0.3s;
}
.video-dropdown-menu button:first-child {
  padding-top: 0.8rem;
}
.video-dropdown-menu button:last-child {
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}
.video-dropdown-menu button:hover {
  background: #388253;
  color: white;
}
.video-dropdown-menu .delete-btn {
  color: #89140e;
  border-top: 1px solid #eee !important;
  border-radius: 0;
}
.video-overlay {
  position: relative;
}
.video-overlay .duration {
  right: 0.8rem;
  bottom: 0.5rem;
}
.stats-line {
  display: flex;
  justify-content: space-between;
  margin-top: .2rem;
}
.stat {
  display: flex;
  align-items: center;
  gap: 0.313rem;
}
.stat img {
  width: 1.563rem;
  height: 1.25rem;
}
.video-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.938rem;
}
.tabs-nav button span {
  font-size: 1.2rem;
  opacity: 0.6;
  margin-left: 8px;
  vertical-align: super;
}
.archived-item .video-card {
  filter: grayscale(0.8);
}
.thumbnail {
  width: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
  transition: opacity 0.3s ease;
  height: 20.5rem;
}
.thumbnail:not([src]) {
  opacity: 0;
}
.camera-icon-circle img {
  width: 7.063rem;
  height: 7.125rem;
}
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
.video-upload-container {
  width: 100%;
}
@media (max-width:76rem) {
  .videos-grid{
    grid-template-columns: repeat(2, 1fr);
  }
}
.confirm-modal{
  padding: 2.5rem 2.813rem;
  background: white;
  border-radius: 2.188rem;
}
.confirm-modal__content{
  display: grid;
  gap: 1rem;
  justify-items: center;
}
.confirm-modal__actions{
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-overlay {
  pointer-events: auto;
}

.confirm-modal {
  pointer-events: all;
  position: relative;
  z-index: 2;
}
</style>
