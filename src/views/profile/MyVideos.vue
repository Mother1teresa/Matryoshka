<template>
  <div class="general-container videos-page">
    <transition name="fade-fast" mode="out-in">
      <div v-if="!isCreating" key="list">
        <div class="header-row">
          <h2 class="page-title">Мини-видео
            <button class="btn create-btn" @click="isCreating = true">Создать ролик</button>
          </h2>
        </div>
        <div class="create-video__block">
          <div class="tabs-nav">
            <button
              :class="{ active: activeTab === 'active' }"
              @click="activeTab = 'active'">
              Действующие 
              <!-- <span class="tab-count">{{ counts.active }}</span> -->
            </button>
            <button
              :class="{ active: activeTab === 'archive' }"
              @click="activeTab = 'archive'">
              Архив 
              <!-- <span class="tab-count">{{ counts.archive }}</span> -->
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
                      v-if="video.cdnUrl || video.url"
                      :src="video.cdnUrl || video.url" 
                      class="thumbnail" 
                      preload="metadata"
                      muted
                      playsinline
                    ></video>
                    <img 
                      v-else-if="video.thumbnail"
                      :src="video.thumbnail" 
                      class="thumbnail" 
                      alt="Превью" 
                    />
                    <div v-if="activeTab === 'archive'" class="archive-overlay">
                      Архив
                    </div>
                    <button
                      class="menu-dots-btn"
                      @click.stop="toggleMenu(video.id)">
                      <img src="/src/assets/img/settings-gear3.svg" alt="">
                    </button>
                    <!-- Выпадающее меню -->
                    <div
                      v-if="activeMenuId === video.id"
                      class="video-dropdown-menu">
                      <!-- <button
                        v-if="!video.isArchived"
                        @click.stop="handleArchive(video.id, true)">
                        В архив
                      </button> 
                       <button v-else @click.stop="handleArchive(video.id, false)">
                        Опубликовать заново
                      </button> -->
                      <button class="delete-btn" @click.stop="handleDelete(video.s3Key)">
                        Удалить
                      </button>
                    </div>
                    
                    <div class="video-overlay">
                      <span class="duration">{{ video.duration || "0:11" }}</span>
                    </div>
                  </div>
                  <div class="video-info">
                    <template v-if="activeTab === 'active'">
                      <div class="stats-line">
                        <div class="stat">
                          <img src="/src/assets/img/icons/eye.svg" />
                          {{ video.viewsCount || video.views || "" }}
                        </div>
                        <div class="stat">
                          <img src="/src/assets/img/icons/heart.svg" />
                          {{ video.likes || video.likesCount || "" }}
                        </div>
                        <div class="stat">
                          <img src="/src/assets/img/icons/comment.svg" />
                          {{ video.commentsCount || "" }}
                        </div>
                      </div>
                      <p class="video-description">
                        {{ video.description || "Описание отсутствует"}}
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
                        <div class="stats-line">
                          <div class="stat">
                            <img src="/src/assets/img/icons/eye.svg" />
                            {{ video.viewsCount || video.views || "" }}
                          </div>
                          <div class="stat">
                            <img src="/src/assets/img/icons/heart.svg" />
                            {{ video.likes || video.likesCount || "" }}
                          </div>
                          <div class="stat">
                            <img src="/src/assets/img/icons/comment.svg" />
                            {{ video.commentsCount || "" }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else class="empty-messages"> <!-- Пустое состояние -->
                <div class="empty-icon">🎬</div>
                <h3>
                  {{ activeTab === "active" ? "У вас пока нет активных роликов" : "Архив пуст" }}
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
          <h2>Вы действительно хотите удалить мини-видео? </h2>
        </div>
        <div class="confirm-modal__actions">
          <button type="button" class="btn go-to-ads-btn" @click="confirmDelete">Да, удалить</button>
          <button class="btn btn-close" @click="closeConfirm">Нет, я ошибся</button>
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
  if (auth.isAuthenticated && auth.user?.id) {
    auth.fetchVideos();
  }
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
      likesCount: "",
      viewsCount: "",
      commentsCount: "",
      author: {
        name: auth.user?.name || 'Пользователь',
        avatar: auth.userAvatar
      }
    };
    auth.addVideoLocally(fallbackVideo);
  }
  
  setTimeout(() => {
    auth.fetchVideos();  // перезагрузим с сервера для актуальности
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
  background: transparent;
  padding: 0.625rem;
  border-radius: 1.25rem;
  transition: all .3s;
}
.video-item:hover{background: white;}
.video-card {
  position: relative;
  aspect-ratio: 9/12;
  /* overflow: hidden; */
  height: 20.538rem;
  width: 100%;
  border-radius: 1.25rem;
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
  color: #858685;
  font-size: 1rem;
  font-weight: 700;
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
  gap: 0rem;
  border-radius: 0.625rem;
  margin-bottom: 1.625rem;
  background: var(--bg-defort);
  width: fit-content;
  padding: 0.125rem 0.25rem;
}
.tabs-nav button {
  padding: 1rem 3.188rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: 700;
  color: #858685;
  cursor: pointer;
  position: relative;
  background: var(--bg-defort);
  border-radius: 0.625rem;
}
.tabs-nav button.active {
  color: var(--bg-defort);
  background: var(--btn-bg);
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
  width: fit-content;
  font-size: 1.25rem;
  color: white;
  padding: 1.125rem 0.938rem;
  text-align: center;
  font-weight: 700;
}
.menu-dots-btn {
  position: absolute;
  top: -.1rem;
  right: -.1rem;
  width: 4.25rem;
  height: 2.938rem;
  background: var(--bg-defort);
  border: none;
  border-radius: 0 1.25rem 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all .3s;
}

.menu-dots-btn img {
  width: 2rem;
  height: 2rem;
}
/* Выпадашка */
.video-dropdown-menu {
  position: absolute;
  top: 3.813rem;
  right: 0.8rem;
  background: var(--btn-bg);
  border-radius: 0.938rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;
  width: 11.975rem;
  max-width: 13.975rem;
  color: #f5f5f5;
  overflow: hidden;
}
.video-dropdown-menu button {
  width: 100%;
  padding: 0.813rem 1rem;
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
  /* border-top: 1px solid #eee !important; */
  border-radius: 0;
}
/* .video-overlay {
  position: relative;
} */
.video-overlay .duration {
  right: 0rem;
  bottom: 0rem;
}
.stats-line {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
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
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.938rem;
  font-size: 1rem;
  font-weight: 700;
  color: #242424;
}
.video-description{
  display: inline-block;
  text-transform: lowercase;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.video-description::first-letter {
  text-transform: uppercase;
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
.confirm-modal{padding: 1.875rem;background: white;border-radius: 2.188rem;}
.confirm-modal__content{display: grid;gap: 1rem;justify-items: center;font-weight: 700;}
.confirm-modal__actions{display: flex;justify-content: center;gap: 1.25rem;margin-top: 2.938rem;font-size: 1.25rem;}
.go-to-ads-btn{ width: fit-content;padding: 0.938rem 1.875rem;border-radius: 1rem;font-size: 1.25rem;}
.btn-close{background: #D8D8D8; border-radius: 1rem; padding: 0.938rem 1.125rem;}
.modal-overlay {pointer-events: auto;}
.confirm-modal {pointer-events: all;position: relative;z-index: 2;}
.tabs-nav button.active .tab-count{color: #00000094;}
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6.25rem 1.25rem;
  color: #888;
}
.empty-icon {
  font-size: 7rem; 
  margin-bottom: 0.25rem;
  opacity: .6;
}
.empty-messages h3 {
  color: #333;
  margin-bottom: 0.625rem;
}
.empty-messages p {
  max-width: 18.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1.563rem;
}
</style>
