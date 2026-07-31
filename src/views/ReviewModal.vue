<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="review-modal">
        <header class="modal-header">
          <h3>Отзыв</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </header>

        <div class="modal-body">
          <!-- Блок: Вы договорились? -->
          <div class="form-group">
            <label>Вы договорились о сделке?</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" value="yes" v-model="form.dealConfirmed" />
                <span class="radio-custom"></span> Да
              </label>
              <label class="radio-item">
                <input type="radio" value="no" v-model="form.dealConfirmed" />
                <span class="radio-custom"></span> Нет
              </label>
            </div>
          </div>

          <!-- Блок: Чем всё закончилось (только если "Нет") -->
          <div v-if="form.dealConfirmed === 'no'" class="form-group">
            <label>Чем всё закончилось?</label>
            <div class="vertical-radio-list">
              <label v-for="reason in reasons" :key="reason.value" class="radio-item">
                <input type="radio" :value="reason.value" v-model="form.reason" />
                <span class="radio-custom"></span> {{ reason.text }}
              </label>
            </div>
          </div>

          <!-- Блок: Звезды -->
          <div class="form-group center">
            <label>Оцените пользователя</label>
            <div class="stars-rating">
              <span 
                v-for="star in 5" 
                :key="star" 
                :class="['star', { active: star <= form.rating }]"
                @click="form.rating = star"
              >★</span>
            </div>
          </div>

          <!-- Блок: Текст отзыва -->
          <div class="form-group center">
            <label>Напишите отзыв</label>
            <textarea 
              v-model="form.text" 
              placeholder="Напишите отзыв, не используйте нецензурную лексику и персональные данные"
              maxlength="2000"
            ></textarea>
            <span class="char-count">Не более 2 000 символов</span>
          </div>

          <!-- Блок: Фото -->
          <div class="form-group center">
            <label>Добавьте фотографии, если есть</label>
            <div class="photo-upload-grid">
              <div class="upload-slot" @click="$refs.fileInput.click()">
                <img src="/src/assets/img/icons/camera.svg" class="camera-icon" alt="upload" />
                <input type="file" ref="fileInput" multiple hidden @change="handleFiles" />
              </div>
              <!-- Превью загруженных фото -->
              <div v-for="(img, idx) in previewImages" :key="idx" class="photo-preview">
                <img :src="img" />
              </div>
            </div>
          </div>

          <button 
            class="submit-review-btn" 
            :disabled="!isFormValid || isSubmitting"
            @click="submitReview">
            {{ isSubmitting ? 'Отправка...' : 'Оставить отзыв' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from "/src/stores/authStore.js";
import { useReviewStore } from "/src/stores/reviews.js";
import { uploadToMediaService } from "/src/utils/uploadService.js"
import { notify } from "/src/utils/notify";

const props = defineProps({
  isOpen: Boolean,
  targetUserId: String,
  chatId: String
});

const emit = defineEmits(['close', 'success']);
const auth = useAuthStore();
const reviewStore = useReviewStore();
const isSubmitting = ref(false);
const previewImages = ref([]);
const selectedFiles = ref([]);

const form = reactive({
  dealConfirmed: 'yes',
  reason: '',
  rating: 0,
  text: '',
});

const reasons = [
  { text: 'Сделка состоялась', value: 'deal_ok' },
  { text: 'Сделка сорвалась', value: 'deal_failed' },
  { text: 'Не договорились', value: 'no_agreement' },
  { text: 'Не общались', value: 'no_contact' },
];

const isFormValid = computed(() => form.rating > 0 && form.text.length > 5);

const handleFiles = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    selectedFiles.value.push(file);
    previewImages.value.push(URL.createObjectURL(file));
  });
};

const submitReview = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  try {
    const imageUrls = [];
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        const uploaded = await uploadToMediaService(file, "review_photo", {});
        if (uploaded) {
          const url = uploaded.cdnUrl || uploaded.url || uploaded;
          if (url) imageUrls.push(url);
        }
      }
    }
    
    const payload = {
      targetUserId: props.targetUserId,
      authorId: auth.user?.id,
      rating: form.rating,
      comment: form.text,
      dealStatus: form.dealConfirmed,
      finishReason: form.dealConfirmed === 'no' ? form.reason : null,
      images: imageUrls
    };
    
    await reviewStore.createReview(payload);
    notify("Отзыв успешно отправлен!");
    emit('success');
    emit('close');
    
    // Сброс
    form.rating = 0;
    form.text = '';
    form.dealConfirmed = 'yes';
    form.reason = '';
    previewImages.value = [];
    selectedFiles.value = [];
  } catch (e) {
    console.error("Ошибка при публикации отзыва:", e);
    notify("Ошибка при отправке отзыва", "error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* ===== Overlay ===== */
.review-modal {
  background: #fff;
  width: 100%;
  max-width: 37.5rem;
  border-radius: 1.875rem;
  padding: 2rem;
  position: relative;
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.12);
}

/* ===== Шапка ===== */
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 1.75rem;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  padding: 0;
}

/* ===== Тело ===== */
.modal-body {
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 38rem;
  padding-right: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 0.938rem;
  color: #222;
}

/* Центрирование заголовков (рейтинг, отзыв, фото) */
.form-group.center label {
  text-align: center;
}

/* ===== Радио ===== */
.radio-group {
  display: flex;
  gap: 1.5rem;
}

.vertical-radio-list {
  display: flex;
  flex-direction: column;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.938rem;
  color: #333;
  position: relative;
}

.radio-item input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 0.125rem solid #ddd;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.radio-item:hover .radio-custom {
  border-color: #64A07A;
}

input[type="radio"]:checked + .radio-custom {
  border-color: #64A07A;
}

input[type="radio"]:checked + .radio-custom::after {
  content: "";
  position: absolute;
  inset: 0.25rem;
  background: #64A07A;
  border-radius: 50%;
}

/* ===== Звёзды ===== */
.stars-rating {
  font-size: 2.5rem;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.star.active {
  color: #64A07A;
}

/* ===== Текстовое поле ===== */
textarea {
  width: 100%;
  height: 7.5rem;
  background: #f5f5f5;
  border: 0.063rem solid #eee;
  border-radius: 0.75rem;
  padding: 1rem;
  resize: none;
  font-family: inherit;
  font-size: 0.875rem;
  color: #333;
}

textarea::placeholder {
  color: #aaa;
  font-size: 0.875rem;
}

.char-count {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #999;
}

/* ===== Фото ===== */
.photo-upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.upload-slot {
  width: 6.25rem;
  height: 6.25rem;
  border: 0.063rem solid #ddd;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.2s;
}

.upload-slot:hover {
  border-color: #64A07A;
}

.camera-icon {
  width: 3.5rem;
  height: 3.5rem;
  opacity: 0.8;
}

.photo-preview {
  width: 6.25rem;
  height: 6.25rem;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 0.063rem solid #eee;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== Кнопка отправки ===== */
.submit-review-btn {
  width: auto;
  align-self: flex-end;
  background: #64A07A;
  color: #fff;
  padding: 0.875rem 2rem;
  border-radius: 1.875rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.938rem;
  transition: opacity 0.2s;
}

.submit-review-btn:hover:not(:disabled) {
  opacity: 0.92;
}

.submit-review-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ===== Переходы ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.form-group textarea::-webkit-scrollbar{width: 0 !important;}
</style>