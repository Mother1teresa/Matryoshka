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
      <div class="upload-fields">
        <div class="field-group">
          <label><span>Аа</span> Описание <span style="color: red">*</span></label>
          <textarea class="textarea-description" v-model="form.description" placeholder="Ролик как на складе лежит коробка..."></textarea>
        </div>
        <div class="field-group">
          <label>Привязать к объявлению</label>
          <div v-if="isLoadingProducts" class="stub">Загрузка товаров...</div>
          <select v-else-if="myProducts.length > 0" v-model="form.productId" class="custom-select">
            <option :value="null">Не выбрано</option>
            <option v-for="item in myProducts" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <div v-else class="empty-stub">
            У вас пока нет объявлений. <router-link to="/create">Создать?</router-link>
          </div>
        </div>
        <div class="footer_block-author">
            <div class="author-preview-card">
                <div class="author-info">
                <img :src="auth.userAvatar" class="author-avatar" alt="avatar" />
                <span class="author-name">От {{ auth.user?.name || 'Пользователя' }}</span>
                </div>
                <img src="/src/assets/img/icons/arrow-down.svg" class="dropdown-icon" alt="arrow" />
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
        <p class="status-text">Видео загружается</p>
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
import { api } from "/src/api/api.js";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js"; 
import { notify } from "/src/utils/notify";

const emit = defineEmits(['back', 'success']);
const auth = useAuthStore();
const fileInput = ref(null);
const videoPreview = ref(null);
const status = ref('edit');
const isFinishing = ref(false);
const uploadProgress = ref(0);

const myProducts = ref([]);
const isLoadingProducts = ref(false);
const form = reactive({
  title: '',
  description: '',
  file: null,
  productId: null,
  allowComments: true
});
const finish = () => {
  emit('success'); 
};
onBeforeUnmount(() => {
  if (videoPreview.value) URL.revokeObjectURL(videoPreview.value);
});
onMounted(async () => {
//   isLoadingProducts.value = true;
//   try {
//     const res = await api.get('/profile/my-products');
//     myProducts.value = res.data.products || [];
//   } catch (e) {
//     console.error("Ошибка загрузки товаров:", e);
//   } finally {
//     isLoadingProducts.value = false;
//   }
 myProducts.value = []; 
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
  // Проверяем и файл, и наличие текста в описании
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
    await uploadToMediaService(form.file, "video", {
      title: form.title || 'Без названия',
      description: form.description.trim(),
      productId: form.productId,
      allowComments: form.allowComments
    },
    (progress) => {
      uploadProgress.value = progress; 
    });

    status.value = 'success';
    setTimeout(() => finish(), 2000); 
  } catch (e) {
    console.error("Ошибка при публикации:", e);
    notify("Ошибка загрузки видео");
    status.value = 'edit';
  }
};

</script>

<style scoped>
.video-upload-container { padding: 1.25rem; margin: 0 auto; }
.back-nav { cursor: pointer; display: flex; align-items: center; gap: 10px; margin-bottom: 30px; font-size: 18px; color: #333; }
.upload-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3.5rem; }
.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 1.25rem;
  aspect-ratio: 9/16;
  max-height: 56.688rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.video-preview-player { width: 100%; height: 100%; object-fit: cover; }
.field-group { margin-bottom: 1.25rem; background: #F9F9F9; border-radius: 1.25rem; padding: 0.938rem;}
.field-group label { display: flex; align-items: center; gap: 10px; font-weight: 400; margin-bottom: 12px; font-size: 1.5rem; }
.field-group span { font-weight: 600; }
.textarea-title, .textarea-description, .custom-select {
  width: 100%;
  background: #E8E8E8;
  border: 1px solid transparent;
  border-radius: 1.25rem;
  padding: 0.813rem 1rem;
  font-size: 1rem;
  resize: none;
  height: 10.938rem;
}
.textarea-description{
    font-size: 0.813rem;
    height: 20.688rem;
}
.empty-stub { background: #fdf2f2; padding: 12px; border-radius: 10px; color: #b91c1c; font-size: 14px; border: 1px solid #fee2e2; }
.publish-btn { background: var(--btn-bg); color: white; width: 23.563rem; height: 3.5rem; padding: 0.875rem 0; border-radius: 1.25rem; font-size: 1.5rem; border: none; cursor: pointer; text-align: center;}
.publish-btn:disabled { background: #ccc; cursor: not-allowed; }
.status-screen { height: 60vh; display: flex; justify-content: center; align-items: center; }
.status-card {  background: white; padding: 60px; border-radius: 30px; text-align: center;  box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 500px;}
.progress-bar { 
  width: 220px; 
  height: 20px;
  background: #6CC08B; 
  border-radius: 20px; 
  margin: 0 auto 30px; 
  overflow: hidden; 
  position: relative;
}
/* Заполняющая часть */
.progress-fill { 
  height: 100%; 
  background: #335A41;
  background-size: 220px 100%; 
  border-radius: 20px;
  transition: width 0.4s ease; 
}
.status-text { font-size: 24px; font-weight: 500; color: #333; }
.ok-btn { margin-top: 30px; background: #6db193; color: white; padding: 12px 40px; border-radius: 10px; }
.fade-slow-leave-active { transition: opacity 1.5s ease;}
.fade-slow-leave-to { opacity: 0;}
.ok-btn:disabled { opacity: 0.6; cursor: not-allowed;}
.toggle-group{ margin-top: 0.938rem; }
.upload-placeholder { display: grid; align-items: center; justify-items: center; gap:1.25rem;}
.upload-placeholder p{ font-weight: 600; font-size: 1.25rem; }
.select-btn{ width: 12.313rem; height: 3.5rem; background: #76a87e; color: white; border: none; border-radius: 1.25rem; cursor: pointer; text-align: center; font-size: 1.25rem;}
.upload-icon{ width: 5.25rem; height: 5.25rem;}
.footer_block-author {background-color: #F9F9F9; padding: 1.125rem 0.75rem 1.5rem 0.75rem; border-radius: 1.25rem; display: grid; align-items: center; justify-items: center;}
.author-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.525rem;
  /* cursor: pointer; */
}

.author-info {
  display: flex;
  align-items: center;
  width: 29rem;
  gap: 0.813rem;
}

.author-avatar {
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {font-size: 1.5rem;}

.dropdown-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}


</style>

