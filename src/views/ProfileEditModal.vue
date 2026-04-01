<template>
  <Transition name="fade" >
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="edit-modal">
        <!-- Кнопка закрытия -->
        <button class="close-x" @click="$emit('close')">×</button>
        <div class="modal-body">
          <!-- Фото и ID -->
          <div class="photo-section">
            <div class="avatar-wrapper" @click="$refs.fileInput.click()">
              <input type="file" ref="fileInput" @change="onFileChange" hidden />
              <img v-if="form.avatar" :src="form.avatar" class="edit-avatar" />
              <div class="avatar-overlay" :class="{ 'has-photo': form.avatar }">
                <img src="/src/assets/img/icons/camera.svg" class="camera-icon" alt="upload" />
              </div>
            </div>
            <span class="user-id">ID {{ auth.user?.id }}</span>
          </div>
          <!-- Поля ввода -->
          <div class="form-grid">
            <div class="form-group">
              <label>{{ isCompany ? "Название" : "Имя" }}</label>
              <input v-model="form.name" :class="{ 'error-field': errors.name }" type="text" :placeholder=" isCompany ? 'Введите название компании' : 'Ваше имя'"/>
            </div>
            <div class="form-group readonly-field">
              <label>Телефон <span>(нельзя изменить)</span></label>
              <input v-model="form.phone" v-mask="'+7 (###) ###-##-##'" type="tel" readonly class="locked-input"/>
            </div>
            <div class="form-group readonly-field">
              <label>E-mail <span>(нельзя изменить)</span></label>
              <input v-model="form.email" type="email" readonly class="locked-input"/>
            </div>
            <div class="form-group">
              <label>Город</label>
              <input v-model="form.city" :class="{ 'error-field': errors.city  }" type="text" placeholder="Ваш город" class="local-prof"/>
            </div>
          </div>
          <div v-if="isCompany" class="employee-section">
            <label class="checkbox-container auth-forgot__check">
              <input type="checkbox" v-model="showEmployee" />
              <span class="checkmark"></span>
              Добавить сотрудника
            </label>
            <div v-if="showEmployee" class="employee-inputs">
              <div class="form-group">
                <label>Имя сотрудника</label>
                <input  v-model="form.employeeName" :class="{ 'error-field': errors.employeeName }" type="text"  placeholder="Введите имя"/>
              </div>
              <div class="form-group">
                <label>Должность</label>
                <div class="multiselect-container" :class="{ 'error-field': errors.employeeRole }">
                  <multiselect
                    v-model="form.employeeRole"
                    :options="roleOptions"
                    label="name"
                    track-by="value"
                    placeholder="Выберите должность"
                    :searchable="false"
                    :allow-empty="false"
                    :show-labels="false"
                    open-direction="bottom">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
            </div>
          </div>
          <div class="type-toggle">
            <button :class="{ active: !isCompany }" @click="form.type = 'person'">
              Частное лицо
            </button>
            <button :class="{ active: isCompany }" @click="form.type = 'company'">
              Компания
            </button>
          </div>
          <!-- Описание -->
          <div class="about-field">
            <h3>{{ isCompany ? "О компании" : "Об исполнителе" }}</h3>
            <textarea v-model="form.description" placeholder="Расскажите почему клиенты должны выбрать именно вас..."></textarea>
          </div>
          <div class="block__save-button">
            <button class="save-button" @click="handleSave" :disabled="isSubmitting">{{ isSubmitting ? "Сохранение..." : "Сохранить" }}</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount  } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import "vue-multiselect/dist/vue-multiselect.css";
import Multiselect from "vue-multiselect";
import { uploadToS3 } from "/src/utils/uploadService.js";
import { api } from "/src/api/api.js";
import { notify } from "/src/utils/notify";

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close", "refresh"]);
const auth = useAuthStore();
const isSubmitting = ref(false);
const showEmployee = ref(false);
let cityTimeout = null;
const errors = reactive({});
const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  if (!form.name?.trim()) errors.name = true;
  if (!form.city?.trim()) errors.city = true;
  if (isCompany.value && showEmployee.value) {
    if (!form.employeeName?.trim()) errors.employeeName = true;
    if (!form.employeeRole) errors.employeeRole = true;
  }
  if (Object.keys(errors).length > 0) {
    notify("Пожалуйста, заполните обязательные поля", "error");
    return false;
  }return true;};
const roleOptions = [
  { name: "Менеджер по продажам", value: "manager" },
  { name: "Директор", value: "director" },
  { name: "Сотрудник", value: "employee" },
];
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.avatar = URL.createObjectURL(file);
    form.avatarFile = file;
}};
const form = reactive({
  name: "",
  phone: "",
  email: "",
  city: "",
  type: "person",
  description: "",
  avatar: "",
  avatarFile: null,
  employeeName: "",
  employeeRole: null,
});
const isCompany = computed(() => form.type === "company");
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      Object.keys(errors).forEach(key => delete errors[key]);
      if (auth.user) {
      const currentRole = roleOptions.find((opt) => opt.value === auth.user.employeeRole) || null;
      Object.assign(form, { ...auth.user,  phone: auth.user.phone,  employeeRole: currentRole,});showEmployee.value = !!auth.user.employeeName;}}});
const handleSave = async () => {
  if (isSubmitting.value) return;
  if (!validate()) return; 
  isSubmitting.value = true;
  try {
    let finalAvatarUrl = form.avatar;
    if (form.avatarFile) {
      const s3Response = await uploadToS3(form.avatarFile); 
      finalAvatarUrl = s3Response?.url || finalAvatarUrl;
      // Регистрируем медиа-данные 
      const mediaData = [{
        userId: String(auth.user?.id),
        filename: form.avatarFile.name,
        s3Key: s3Response?.key || "avatars/" + form.avatarFile.name,
        url: finalAvatarUrl,
        mimeType: form.avatarFile.type,
        type: "avatar",
        title: `Avatar ${form.name}`,
        description: "User profile picture"
      }];
      try {
        await api.post("/media/upload", mediaData);
      } catch (mediaErr) {
        console.error("Media Service error:", mediaErr.response?.data || mediaErr.message);
      }
      form.avatarFile = null;
    }
    // Обновляем данные профиля
    const updateData = {
      id: auth.user?.id,
      name: form.name,
      email: form.email,
      phone: form.phone.replace(/\D/g, ''),
      city: form.city,
      description: form.description,
      type: form.type,
      avatar: finalAvatarUrl, // Передаем актуальную ссылку
      employeeName: (isCompany.value && showEmployee.value) ? form.employeeName : "",
      employeeRole: (isCompany.value && showEmployee.value) ? form.employeeRole?.value : ""
    };
    const response = await api.put("/profile/update", updateData);
    if (response.data.user) {
      auth.login(response.data.user);
    }
    emit("refresh"); 
    emit("close");
    notify("Профиль успешно обновлен!"); 
  } catch (e) {
    console.error("Ошибка при сохранении профиля:", e.response?.data || e.message);
    notify(e.response?.data?.message || "Не удалось сохранить профиль", "error");
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => form.city, (val) => {
  if (!val) return;
  form.city = val.charAt(0).toUpperCase() + val.slice(1);
  clearTimeout(cityTimeout);
  cityTimeout = setTimeout(async () => {
    const validCity = await auth.validateAndFormatCity(val);
    if (validCity) form.city = validCity;
  }, 1000);
});
watch(showEmployee, (val) => {
  if (!val) {
    form.employeeName = "";
    form.employeeRole = null;
    delete errors.employeeName;
    delete errors.employeeRole;
  }
});
onBeforeUnmount(() => {
  clearTimeout(cityTimeout);
});
watch(isCompany, (newVal) => {
  if (!newVal) {
    showEmployee.value = false;
  }
});watch(() => form.employeeRole, (val) => {
  if (val) delete errors.employeeRole;
});
watch(() => form.name, (val) => {
  if (val?.trim()) delete errors.name;
});
</script>

<style scoped>
.edit-modal {
  background: white;
  width: 100%;
  max-width: 41.625rem;
  border-radius: 2.5rem;
  position: relative;
  max-height: 90vh;
  overflow: hidden; 
  display: flex;
  flex-direction: column;
}
.modal-body {
  overflow-y: auto; 
  scrollbar-width: thin;
  scrollbar-color: #76a87e transparent;
  padding: 1.875rem 3.125rem 3.25rem 3.125rem;
  border-radius: 2.5rem;
}

.type-toggle {
  display: flex;
  background: #F4F4F4;
  border-radius: 0.625rem;
  padding: 0.325rem;
  width: 26rem;
  height: 3.925rem;
  margin: 1.438rem auto 2.188rem auto;
}
.type-toggle button {
  flex: 1;
  padding: 0.833rem 0;
  width: 12.625rem;
  text-align: center;
  border: none;
  background: none;
  border-radius: 0.48rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.3rem;
  color: #616161;
}
.type-toggle button.active {
  background: #76a87e;
  color: white;
}
.block__save-button{
  display: flex;
  justify-content: center;
}
.close-x{
  font-size: 2.25rem;
  position: absolute;
  top: 0.8rem;
  right: 1.8rem;
}
.save-button {
  width: 8.438rem;
  height: 3rem;
  background: #76a87e;
  color: white;
  border: none;
  border-radius: 1.875rem;
  margin-top: 1.25rem;
  cursor: pointer;
  text-align: center;
}
.form-group {
  display: flex;
  gap: 1.375rem;
  align-items: baseline;
}
.photo-section{
  display: grid;
  justify-items: center;
  gap: 0.938rem;
  margin-bottom: 1.438rem;
}
.form-group label {
  width: 9.25rem;
  font-size: 1.5rem;
  color: #333;
}
.form-group input,
.form-group select,
textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  padding: 0.75rem;
  border-radius: 0.625rem;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}
/* Анимация появления */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.avatar-wrapper {
  border: 1px solid #e2e2e2;
  width: 9.375rem;
  height: 9.375rem;
  border-radius: 50%;
  background-color: #F8F9FA;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.edit-avatar{
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}
.avatar-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0); 
  transition: background 0.3s ease;
  z-index: 2;
}
.camera-icon {
  width: 5.5rem;
  height: 5.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}
.avatar-wrapper:hover .avatar-overlay {
  background: rgba(219, 219, 219, 0.415); 
}
.avatar-wrapper:hover .camera-icon {
  transform: scale(1.05); 
}
.avatar-overlay.has-photo {
  background: rgba(61, 61, 61, 0.5);
}
.avatar-overlay.has-photo .camera-icon {
  opacity: 0.7;
  filter: invert(1) brightness(10); 
}
.avatar-wrapper:hover .avatar-overlay.has-photo {
  background: rgba(0, 0, 0, 0.4);
}
.upload-btn img {
  width: 5.5rem;
  height: 5.5rem;
}
.placeholder-btn{
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-id{
  text-align: center;
}
.about-field h3{
  font-size: 1.8rem; 
  text-align: center;
  margin-bottom: 0.75rem;
}
.about-field textarea{
  width: 100%;
  height: 17.634rem;
  border-radius: 0.625rem;
  border: 1px solid #D0D0D0;
  color: #000000;
  Resize: none;
}
.about-field textarea::placeholder{
  color: #D0D0D0;
}
.employee-inputs .form-group label{
 width: auto;
 white-space: nowrap;
}
.multiselect-container{
  width: 100%;
}
input::placeholder{
  color: #adadad;
}
.employee-inputs{
  margin: 2.5rem 0;
}
.checkbox-container{
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.checkbox-container input{
  background-color: #64A07A;
}
.checkmark{
  font-size: 0.938rem;
  color: #8E8C8C;
}
.local-prof{
  text-transform: capitalize; 
}
.local-prof::placeholder{
  text-transform:none;
}
.locked-input {
  background-color: #f0f0f0 !important;
  cursor: not-allowed;
  color: #777;
}
.readonly-field label{
  display: grid;
}
.readonly-field label span{
  color: #999;
  font-size: 0.5em;
}
.error-field {
  border: 1px solid #ff4d4f !important;
}
/* Для мультиселекта специфично */
.multiselect-container.error-field :deep(.multiselect__tags) {
  border-color: #ff4d4f;
}
.multiselect__caret {
  position: absolute; right: 12px; top: 50%; width: 12px; height: 12px; margin-top: -6px;
  background-image: url("/src/assets/img/arr-select.svg");
  background-repeat: no-repeat; background-size: contain; transition: transform 0.3s; z-index: 1; pointer-events: none;
}
:deep(.multiselect--active) .multiselect{
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
:deep(.multiselect--active) .multiselect__caret { transform: rotate(180deg); }
:deep(.multiselect__select) { display: none !important; }
/* Фикс текста */
:deep(.multiselect__single) { 
  color: #000 !important; font-size: 1rem !important; 
  padding-left: 0 !important; margin-bottom: 0 !important; background: transparent !important; display: block !important;
}
:deep(.multiselect__tags) { 
  min-height: 3rem !important; height: 3rem !important; background: #fff !important; padding: 0.75rem;
  border-radius: 0.625rem; display: flex !important; align-items: center !important;
  transition: all .1s; font-size: 1.2rem; border: 1px solid #e0e0e0;
}
/* :deep(.multiselect){min-height: auto !important; height: auto !important;} */
:deep(.multiselect__placeholder) { color: #A8A1A1 !important; margin: 0 !important; padding: 0 !important; font-size: 1.2rem; }
:deep(.multiselect__option--highlight) {background: #64A07A !important; color: #fff !important; font-weight: 600;}
:deep(.multiselect__option::after) { display: none !important; }
:deep(.multiselect__option){
  display: grid;
  align-items: center;
  padding: 0.75rem;
  /* min-height: 3.2rem; */
  line-height: 16px;
  text-decoration: none;
  text-transform: none;
  vertical-align: middle;
  position: relative;
  cursor: pointer;
  white-space: normal;
  font-size: 1rem;
}
:deep(.multiselect__content-wrapper) {
  position: absolute;
  display: block;
  background: #fff;
  width: 100%;
  max-height: 240px;
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-top: none;
  border-bottom-left-radius: 0.938rem;
  border-bottom-right-radius: 0;
  z-index: 50;
  -webkit-overflow-scrolling: touch;
}
:deep(.multiselect__tag){
  padding: 0.25rem 1.2rem 0.25rem 0.425rem;
  border-radius: 0.313rem;
  margin-right: 0.125rem;
  background: #41b883;
  margin-bottom: 0rem;
  white-space: wrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}
:deep(.multiselect__option--selected){
  color: #64A07A;
}
</style>
