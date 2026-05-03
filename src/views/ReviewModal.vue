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
          <div class="form-group">
            <label>Напишите отзыв</label>
            <textarea 
              v-model="form.text" 
              placeholder="Подробно расскажите о ваших впечатлениях от общения и сделки"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ form.text.length }}/500</span>
          </div>

          <!-- Блок: Фото -->
          <div class="form-group">
            <label>Добавьте фотографии, если есть</label>
            <div class="photo-upload-grid">
              <div class="upload-slot" @click="$refs.fileInput.click()">
                <img src="/src/assets/img/icons/camera-add.svg" />
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
            @click="submitReview"
          >
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
import { uploadToMediaService } from "/src/utils/uploadService.js"
import { notify } from "/src/utils/notify";

const props = defineProps({
  isOpen: Boolean,
  targetUserId: String,
  chatId: String
});

const emit = defineEmits(['close', 'success']);
const auth = useAuthStore();
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
        const url = await uploadToMediaService(file, "image", {});
        if (url) imageUrls.push(url);
      }
    }
    const payload = {
      targetUserId: props.targetUserId,
      chatId: props.chatId,
      rating: form.rating,
      comment: form.text,
      dealStatus: form.dealConfirmed,
      finishReason: form.dealConfirmed === 'no' ? form.reason : null,
      images: imageUrls
    };
    await auth.createReview(payload);
    notify("Отзыв успешно отправлен!");
    emit('success');
    emit('close');
    
    // Сброс данных
    form.rating = 0;
    form.text = '';
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
.review-modal {
  background: #fff;
  width: 100%;
  max-width: 37.5rem; 
  border-radius: 1.875rem;
  padding: 2rem;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 { font-size: 1.25rem; font-weight: 600; }

.close-btn {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  font-size: 1.5rem;
  background: none; border: none; cursor: pointer;
}

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.75rem; font-weight: 500; font-size: 0.938rem; }

/* Кастомные радио-кнопки */
.radio-group, .vertical-radio-list { display: flex; gap: 1.5rem; }
.vertical-radio-list { flex-direction: column; gap: 0.75rem; }

.radio-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.radio-custom {
  width: 1.25rem; height: 1.25rem;
  border: 0.063rem solid #ddd;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}
input[type="radio"]:checked + .radio-custom::after {
  content: "";
  position: absolute;
  inset: 0.25rem;
  background: #64A07A;
  border-radius: 50%;
}

/* Звезды */
.stars-rating { font-size: 2rem; color: #ddd; cursor: pointer; display: flex; gap: 0.313rem; justify-content: center; }
.star.active { color: #64A07A; }

textarea {
  width: 100%; height: 7.5rem;
  background: #F9F9F9;
  border: 0.063rem solid #eee;
  border-radius: 0.75rem;
  padding: 1rem;
  resize: none;
}

.submit-review-btn {
  width: 100%;
  background: #64A07A;
  color: #fff;
  padding: 1rem;
  border-radius: 1.875rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.submit-review-btn:disabled { background: #ccc; cursor: not-allowed; }
</style>
