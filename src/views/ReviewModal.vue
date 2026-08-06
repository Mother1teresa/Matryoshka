<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="review-modal">
        <button class="close-btn" @click="$emit('close')">×</button>
        <header class="modal-header">
          <h3>Отзыв</h3>
        </header>
        <div class="modal-body">
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
          <div v-if="form.dealConfirmed === 'no'" class="form-group">
            <label>Чем всё закончилось?</label>
            <div class="vertical-radio-list">
              <label v-for="reason in reasons" :key="reason.value" class="radio-item">
                <input type="radio" :value="reason.value" v-model="form.reason" />
                <span class="radio-custom"></span> {{ reason.text }}
              </label>
            </div>
          </div>
          <div class="form-group center">
            <label>Оцените пользователя</label>
            <div class="stars-rating">
              <img
                v-for="star in 5"
                :key="star"
                :src="star <= form.rating ? '/img/users/star.png' : '/img/users/star_1.png'"
                :class="['star', { active: star <= form.rating }]"
                @click="form.rating = star"
                :title="ratingLabels[star]"
                alt="★"
              />
            </div>
            <p class="rating-label">{{ currentRatingLabel }}</p>
          </div>
          <div class="form-group center">
            <label>Напишите отзыв <span class="char-count">Не более 2 000 символов</span></label>
            <textarea v-model="form.text" placeholder="Введите текст..." maxlength="2000"></textarea>
            <span class="char-count" :class="{ 'over-limit': form.text.length > 2000 }">
              {{ form.text.length }} / 2000
            </span>
          </div>
          <div class="form-group center">
            <label>Добавьте фотографии, если есть</label>
            <div class="photo-upload-grid">
              <div class="upload-slot" @click="$refs.fileInput.click()">
                <img src="/src/assets/img/icons/camera.svg" class="camera-icon" alt="upload" />
                <input type="file" ref="fileInput" multiple hidden @change="handleFiles" />
              </div>
              <div v-for="(img, idx) in previewImages" :key="idx" class="photo-preview">
                <img :src="img" />
                <button class="remove-photo-btn" @click="removePhoto(idx)">×</button>
              </div>
            </div>
          </div>
          <button class="submit-review-btn" :disabled="!isFormValid || isSubmitting" @click="submitReview">
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

const ratingLabels = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Всё отлично'];
const currentRatingLabel = computed(() => ratingLabels[form.rating] || '');

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

const removePhoto = (idx) => {
  URL.revokeObjectURL(previewImages.value[idx]);
  previewImages.value.splice(idx, 1);
  selectedFiles.value.splice(idx, 1);
};

const submitReview = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  try {
    const imageUrls = [];
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        const uploaded = await uploadToMediaService(file, "REVIEW_PHOTOS", {});
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
.review-modal{background:#fff;width:100%;max-width:31.875rem;border-radius:1.25rem;padding:1.25rem 2.625rem 2rem 3.625rem;position:relative;box-shadow:0 1.25rem 3.75rem rgba(0,0,0,.12);}
.modal-header{display:flex;justify-content:center;align-items:center;margin-bottom:1.5rem;position:relative;}
.modal-header h3{font-size:1.25rem;font-weight:600;margin:0;color:#111;}
.close-btn{position:absolute;right: 1rem;top: 0.888rem;font-size:1.75rem;line-height:1;background:none;border:none;cursor:pointer;padding:0; width: 1.562rem; height: 1.562rem;background: #F9F9F9; border-radius: 50%; display: flex; align-items: center; justify-content: center;}
.modal-body{display:flex;flex-direction:column;overflow:auto;height:fit-content; height: 37rem; padding-right: 1rem;}
.form-group{margin-bottom:1.25rem;}
.form-group label{display:flex; font-weight:400;font-size:1rem; margin-bottom: 1.25rem;}
.form-group.center label{ display: flex; align-items: center;justify-content: center;font-size: 1rem; font-weight: 700; margin-bottom: 0.938rem;}
.radio-group{display:grid;gap:1.25rem;}
.radio-group label{margin-bottom: 0;}
.vertical-radio-list{display:flex;flex-direction:column;}
.radio-item{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.938rem;color:#333;position:relative;}
.radio-item input[type="radio"]{position:absolute;opacity:0;width:0;height:0;}
.radio-custom{width:1.25rem;height:1.25rem;border:.125rem solid #ddd;border-radius:50%;display:inline-block;position:relative;flex-shrink:0;transition:border-color .2s;}
.radio-item:hover .radio-custom{border-color:#64A07A;}
input[type="radio"]:checked+.radio-custom{border-color:#64A07A;}
input[type="radio"]:checked+.radio-custom::after{content:"";position:absolute;inset:.25rem;background:#64A07A;border-radius:50%;}
.stars-rating{display:flex;gap:.5rem;justify-content:center;cursor:pointer;}
.star{width:2.5rem;height:2.5rem;transition:transform .15s;}
.star:hover{transform:scale(1.15);}
.star.active{opacity:1;}
textarea{width:100%;height:9.875rem;background:#F0F0F0;border-radius:1.25rem;padding: 1.125rem 1rem;resize:none;font-family:inherit;font-size:0.813rem;color:#333;}
textarea::placeholder{color:#aaa;font-size:.875rem;}
.char-count{display:block;margin-top:0.313rem;font-size:0.813rem;color:#B5B5B5; margin-left: 1.25rem;}
.photo-upload-grid{display:flex;flex-wrap:wrap;gap:.3rem;}
.upload-slot{width:9.625rem;height:6.625rem;border:.063rem solid #8E8C8C;border-radius:0.625rem;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s;}
.upload-slot:hover{border-color:#64A07A;}
.camera-icon{width:3.5rem;height:3.5rem;opacity:.8;}
.photo-preview{width:7.2rem;height:6.625rem;border-radius:0.625rem;overflow:hidden;border:.063rem solid #8E8C8C;position:relative;}
.photo-preview img{width:100%;height:100%;object-fit:cover;}
.remove-photo-btn{position:absolute;top:.25rem;right:.25rem;width:1.375rem;height:1.375rem;border:none;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;font-size:1rem;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;padding:0;}
.remove-photo-btn:hover{background:rgba(0,0,0,.75);}
.submit-review-btn{width:auto;align-self:flex-end;background:var(--btn-bg);color:#fff;padding: 0.625rem 1.25rem;border-radius:0.938rem;border:none;font-weight:700;cursor:pointer;font-size:1rem;transition:opacity .2s;}
.submit-review-btn:hover:not(:disabled){opacity:.92;}
.submit-review-btn:disabled{background:#ccc;cursor:not-allowed;}
.fade-enter-active,.fade-leave-active{transition:opacity .25s ease;}
.fade-enter-from,.fade-leave-to{opacity:0;}
.form-group textarea::-webkit-scrollbar{width:0!important;}
.rating-label{text-align:center;font-size:.875rem;color:#888;margin-top:0.938rem;min-height:1.25rem;transition:opacity .2s;}
.char-count.over-limit { color: #ff4d4f; }
</style>