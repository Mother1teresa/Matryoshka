<template>
  <div class="video-upload-container">
    <div v-if="status === 'edit'" class="back-nav" @click="$emit('back')">
      <span class="back-arrow">←</span>
      <span class="back-text">Назад к роликам</span>
    </div>
    <div v-if="status === 'edit'" class="upload-grid">
      <div class="upload__block-left">
        <div class="upload-zone" @click="triggerFileInput">
          <input type="file" ref="fileInput" @change="handleFileSelect" accept="video/*" hidden />
          <video v-if="videoPreview" :src="videoPreview" class="video-preview-player" muted autoplay loop></video>
          <div v-else class="upload-placeholder">
            <div class="upload-icon"><img src="/src/assets/img/icons/upload_icon.svg" alt=""></div>
            <p>Выберите видео</p>
            <button class="btn select-btn">Выбрать файл</button>
          </div>
        </div>
        <div class="toggle-group">
          <label class="checkbox-container auth-forgot__check">
            <input type="checkbox" v-model="form.allowComments" />
            <span class="checkmark"></span>
            Заблокировать комментарии
          </label>
        </div>
      </div>
      <div class="upload_info-video">
        Требования к видео:<br>
        <ul>
          <li>Формат: MP4.</li>
          <li>Соотношение сторон: 9:16.</li>
          <li>Рекомендуемое разрешение: 1080 × 1920.</li>
          <li>Длительность: до 60 секунд.</li>
          <li>Видео должно быть качественным, без сильных искажений, размытости и посторонних надписей.</li>
          <li>Звук должен быть корректным, если он присутствует.</li>
          <li>Видео не должно нарушать правила сайта.</li>
        </ul>
      </div>
      <div class="upload-fields">
        <div class="field-group">
          <label><span>Аа</span> Описание <span style="color: red">*</span></label>
          <textarea class="textarea-description" v-model="form.description" placeholder="Ролик как на складе лежит коробка..."></textarea>
        </div>
        <div class="field-group">
          <label>Привязать к объявлению</label>
          <div v-if="isLoadingProducts" class="stub">Загрузка товаров...</div>

          <template v-else-if="myProducts.length > 0">
            <div class="products-carousel">
              <div
                v-for="item in myProducts"
                :key="item.id"
                class="product-select-card"
                :class="{ 'is-selected': form.productId === item.id }"
                @click="form.productId = item.id"
              >
                <img
                  :src="item.pictureUrls?.[0] || '/src/assets/img/placeholder.png'"
                  class="psc-img"
                  alt=""
                />
                <div class="psc-info">
                  <p class="psc-title">{{ item.title || 'Без названия' }}</p>
                  <p class="psc-price">{{ Number(item.price || 0).toLocaleString('ru-RU') }} ₽</p>
                  <p class="psc-city">{{ item.address || item.city || 'Город не указан' }}</p>
                </div>
              </div>
            </div>

            <button
              v-if="form.productId"
              type="button"
              class="btn-clear-select"
              @click="form.productId = null"
            >
              Отменить выбор
            </button>
          </template>

          <div v-else class="empty-stub">
            У вас пока нет объявлений.
            <router-link to="/profile/create-ad" @click="emit('back')">Создать?</router-link>
          </div>
        </div>
        <div class="footer_block-author">
          <div class="author-preview-card">
            <div class="author-info">
              <img :src="auth.userAvatar" class="author-avatar" alt="avatar" />
              <span class="author-name">От {{ auth.user?.name || 'Пользователя' }}</span>
            </div>
          </div>
          <button class="btn publish-btn" :disabled="!form.file || !form.description.trim()" @click="onPublish">
            Опубликовать
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="status === 'uploading'" class="status-screen">
      <div class="status-card">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="status-text">Видео загружается ({{ uploadProgress }}%)</p>
      </div>
    </div>
    <transition name="fade-slow">
      <div v-if="status === 'success'" class="status-screen">
        <div class="status-card">
          <p class="status-text success">Видео загружено!</p>
          <button class="btn ok-btn" :disabled="isFinishing" @click="finish">
            {{ isFinishing ? 'Завершение...' : 'Готово' }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { api } from "/src/api/api.js";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js"; 
import { notify } from "/src/utils/notify";

const emit = defineEmits(['back', 'success']);
const auth = useAuthStore();
const fileInput = ref(null);
const router = useRouter();
const videoPreview = ref(null);
const status = ref('edit');
const isFinishing = ref(false);
const uploadProgress = ref(0);

const myProducts = ref([]);
const isLoadingProducts = ref(false);
const autoFinishTimeout = ref(null); 

const form = reactive({
  title: '',
  description: '',
  file: null,
  productId: null,
  allowComments: false
});

const finish = () => {
  if (isFinishing.value) return;
  isFinishing.value = true;
  if (autoFinishTimeout.value) clearTimeout(autoFinishTimeout.value);
  emit('success'); 
};

onBeforeUnmount(() => {
  if (videoPreview.value) URL.revokeObjectURL(videoPreview.value);
  if (autoFinishTimeout.value) clearTimeout(autoFinishTimeout.value);
});
onMounted(async () => {
  isLoadingProducts.value = true;
  try {
    const res = await auth.fetchMyAdverts?.() 
              || await api.get('/adverts/my') 
              || [];
    myProducts.value = Array.isArray(res) ? res : res.data || [];
  } catch (e) {
    console.error('Ошибка загрузки товаров:', e);
  } finally {
    isLoadingProducts.value = false;
  }
});

const triggerFileInput = () => fileInput.value.click();

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (videoPreview.value) URL.revokeObjectURL(videoPreview.value);
    form.file = file;
    videoPreview.value = URL.createObjectURL(file);
  }
};
const onPublish = async () => {
  if (!form.file) {
    notify("Выберите видеофайл");
    return;
  }
  if (!form.description.trim()) {
    notify("Пожалуйста, заполните описание");
    return;
  }
  
  status.value = 'uploading';
  uploadProgress.value = 0;
  
  try {
    const createdMedia = await uploadToMediaService(
      form.file, 
      "VIDEOS", 
      {
        title: form.title || 'Без названия',
        description: form.description.trim(),
        commentsDisabled: form.allowComments,
        userId: auth.user?.id
      },
      (progress) => {
        uploadProgress.value = progress; 
      }
    );
    if (form.productId && createdMedia?.id) {
      try {
        await auth.updateAdvert({
          id: form.productId,
          videoId: createdMedia.id
        });
      } catch (patchErr) {
        console.error("Ошибка привязки видео к объявлению:", patchErr);
        notify("Видео загружено, но не удалось привязать к объявлению", "warning");
      }
    }
    status.value = 'success';
    autoFinishTimeout.value = setTimeout(() => {
      if (isFinishing.value) return;
      isFinishing.value = true;
      emit('success', createdMedia); 
    }, 250);
  } catch (e) {
    console.error("Ошибка при публикации:", e);
    if (e.message === "Пользователь не авторизован") {
      notify("Сессия истекла. Пожалуйста, войдите заново.");
    } else {
      notify("Ошибка загрузки видео");
    }
    status.value = 'edit';
  }
};
</script>

<style scoped>
.video-upload-container { padding: 1.25rem; margin: 0 auto; }
.back-nav { cursor: pointer; display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1.875rem; font-size: 1.125rem; color: #333; }
.upload-grid { display: grid; grid-template-columns: 1fr .9fr 1fr; gap: 1.5rem; }
.upload-zone {border: 2px dashed #ccc;border-radius: 1.25rem;aspect-ratio: 9/16;max-height: 42.688rem;width: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center;background: #f9f9f9;cursor: pointer;overflow: hidden;position: relative;height: 95%;}
.upload_info-video{font-size: 0.813rem;color: #858685;}
.upload_info-video li{list-style: disc;margin-bottom: .25rem;}
.upload_info-video ul{padding-left: 1.25rem;}
.checkbox-container input{border: 2px solid #858685;border-radius: 0.313rem !important;border-color: #858685 !important;width: 1.438rem !important;height: 1.125rem !important;}
.auth-forgot__check input:checked {background: var(--btn-bg);border-color: transparent !important;}
.video-preview-player { width: 100%; height: 100%; object-fit: cover; }
.field-group { margin-bottom: 1.25rem; background: #ffffff; border-radius: 1.25rem; padding: 0.938rem; }
.field-group label { display: flex; align-items: center; gap: 10px; font-weight: 400; margin-bottom: 12px; font-size: 1.5rem; }
.field-group span { font-weight: 600; }
.textarea-title, .textarea-description, .custom-select {width: 100%;background: #E8E8E8;border: 1px solid transparent;border-radius: 1.25rem;padding: 0.813rem 1rem;font-size: 1rem;resize: none;height: 10.938rem;}
.textarea-description{font-size: 1rem;height: 20.688rem;}
.empty-stub { background: #fdf2f2; padding: 0.75rem; border-radius: 0.625rem; color: #b91c1c; font-size: 1rem; border: 1px solid #fee2e2; }
.publish-btn { background: var(--btn-bg); color: white; width: fit-content; height: 3.5rem; padding: 1.125rem 1.625rem; border-radius: 1.25rem; font-size: 1.5rem; border: none; cursor: pointer; text-align: center;}
.publish-btn:disabled { background: #ccc; cursor: not-allowed; }
.status-screen { height: 60vh; display: flex; justify-content: center; align-items: center; }
.status-card {  background: white; padding: 3.75rem; border-radius: 1.875rem; text-align: center;  box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 500px;}
.progress-bar { width: 220px; height: 20px;background: #6CC08B; border-radius: 20px; margin: 0 auto 30px; overflow: hidden; position: relative;}
/* Заполняющая часть */
.progress-fill { height: 100%; background: #335A41;background-size: 220px 100%; border-radius: 20px;transition: width 0.4s ease; }
.status-text { font-size: 24px; font-weight: 500; color: #333; }
.ok-btn { margin-top: 30px; background: #6db193; color: white; padding: 12px 40px; border-radius: 10px; }
.fade-slow-leave-active { transition: opacity 1.5s ease;}
.fade-slow-leave-to { opacity: 0;}
.ok-btn:disabled { opacity: 0.6; cursor: not-allowed;}
.toggle-group{ margin-top: 0.938rem; }
.upload-placeholder { display: grid; align-items: center; justify-items: center; gap:1.25rem;}
.upload-placeholder p{ font-weight: 600; font-size: 1.25rem; }
.select-btn{ width: 12.313rem; height: 3.5rem; background: #76a87e; color: white; border: none; border-radius: 1.25rem; cursor: pointer; text-align: center; font-size: 1.25rem;}
.upload-icon{ width: 4.25rem; height: 4.25rem;}
.footer_block-author {background-color: #ffffff; padding: 1.438rem 1.875rem 0.938rem 1.875rem; border-radius: 1.25rem; display: grid; align-items: center; justify-items: center;}
.author-preview-card {display: flex;align-items: center;justify-content: space-between;margin-bottom: 0.625rem;/* cursor: pointer; */}
.author-info {display: flex;align-items: center;width: 20.3rem;gap: 0.688rem;}
.author-avatar {width: 3.4rem;height: 3.4rem;border-radius: 50%;object-fit: cover;}
.author-name {font-size: 1.25rem; font-weight: 700;}
.dropdown-icon {width: 0.875rem;height: 0.875rem;opacity: 0.6;}
.products-carousel {display: flex;gap: 0.75rem;overflow-x: auto;padding: 0.5rem;scrollbar-width: thin;scrollbar-color: #ccc transparent;}
.products-carousel::-webkit-scrollbar {height: 0.375rem;}
.products-carousel::-webkit-scrollbar-thumb {background: #ccc;border-radius: 0.25rem;}
.product-select-card {flex: 0 0 10rem;background: #fff;border: 2px solid transparent;border-radius: 1rem;overflow: hidden;cursor: pointer;transition: all 0.2s ease;box-shadow: 0 2px 8px rgba(0,0,0,0.04);border: 1px solid var(--btn-bg);}
.product-select-card:hover {.psc-img{transform:scale(1.02)}}
.product-select-card.is-selected {border-color: var(--btn-bg);box-shadow: 0 0 0 3px rgba(81, 142, 104, 0.15);}
.psc-img { width: 100%; height: 7rem; object-fit: cover; transition: all .3s;}
.psc-info {padding: 0.625rem;}
.psc-title {font-size: 0.8125rem;font-weight: 700;color: #2d2d2d;margin: 0 0 0.25rem;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;line-height: 1.2;}
.psc-title{text-transform: lowercase;}
.psc-title::first-letter { text-transform: uppercase;}
.psc-price {font-size: 0.875rem;font-weight: 700;color: var(--btn-bg);margin: 0 0 0.125rem;}
.psc-city {font-size: 0.75rem;color: #858685;margin: 0;}
.btn-clear-select {margin-top: 0.75rem;background: transparent;color: #858685;border: 1px solid #ddd;padding: 0.5rem 1rem;margin-left: 0.5rem;border-radius: 0.75rem;font-size: 0.875rem;cursor: pointer;transition: all 0.2s;}
.btn-clear-select:hover {border-color: #999;color: #555;}
@media (max-width: 77rem){.upload-grid{ grid-template-columns: 1fr 1fr;}
  /* .upload_info-video{order: 2;} */
}
</style>

