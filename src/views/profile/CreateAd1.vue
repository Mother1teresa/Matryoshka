<template>
  <div class="create-ad-page">
    <div class="container">
      <h1 class="page-title">Создать объявление</h1>
      <nav class="breadcrumbs"><template v-for="(crumb, index) in breadcrumbs" :key="index"> <span class="crumb-item" :class="{ last: index === breadcrumbs.length - 1 }">{{ crumb.name }}</span> <span v-if="index < breadcrumbs.length - 1" class="separator">→</span></template></nav>
      <section class="section">
        <h3 class="section-title">Выбор категории</h3>
        <div class="category-grid">
          <div  v-for="cat in categories"  :key="cat.id"  class="category-card" :class="{ active: form.mainCategory === cat.slug }" @click="selectMainCategory(cat)"><div class="cat-icon"><img :src="cat.icon" alt="" /></div><span>{{ cat.name }}</span></div>
        </div>
      </section>
      <section v-if="form.mainCategory" class="section fade-in">
        <h3 class="section-title">Категория</h3>
        <div class="multiselect-container">
          <multiselect v-model="selectedSub" :options="availableSubCats" label="name" track-by="slug" placeholder="Выберите из списка категорию" :searchable="false" :show-labels="false" @select="selectSubCategory"><template #caret><div class="multiselect__caret"></div></template></multiselect>
        </div>
      </section>
      <div v-if="form.subCategory" class="full-form fade-in">
        <!-- ГЕНЕРАЦИЯ ПОЛЕЙ НА ОСНОВЕ CONFIG ИЗ productFields.js -->
        <section class="section" v-if="activeFields.length > 0">
          <div class="fields-grid">
            <div v-for="field in activeFields" :key="field.key" class="form-group" :class="field.type">
              <label class="label">{{ field.label }}</label>
              <input v-if="field.type === 'text'" v-model="form.attributes[field.key]" type="text" :placeholder="field.placeholder" class="f-input" />
              <div v-else-if="field.type === 'select' || field.type === 'chips'" class="multiselect-container">
                <multiselect v-model="form.attributes[field.key]" :options="field.options || []" :multiple="field.type === 'chips'" :placeholder="field.label" :searchable="false" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
              </div>
              <input v-else-if="field.type === 'number'" v-model="form.attributes[field.key]" type="number" :placeholder="field.label" class="f-input"/>
              <div v-else-if="field.type === 'dynamic-list'" class="dynamic-list-container">
                <div v-for="(item, idx) in form.attributes[field.key]" :key="idx" class="list-row">
                  <span class="bullet">-</span>
                  <input  v-model="form.attributes[field.key][idx]" type="text" :placeholder="field.placeholder" class="f-input" />
                </div>
                <button type="button" class="btn-add-row" @click="form.attributes[field.key].push('')">+ Добавить поле</button>
              </div>
              <div v-else-if="field.type === 'service-price'" class="price-type-wrapper">
                <div class="price-input-container">
                  <input v-model="form.price" type="number" placeholder="Цена услуги" class="f-input" :class="{ 'error-border': v$.price.$error }" />
                  <span class="currency-p">₽</span>
                </div>
                <div class="multiselect-container unit-select">
                  <multiselect v-model="form.attributes[field.key]" :options="field.options" placeholder="За услугу" :searchable="false" :show-labels="false"> <template #caret><div class="multiselect__caret"></div></template></multiselect>
                </div>
              </div>
              <div v-else-if="field.type === 'work-schedule'" class="schedule-container">
                <div class="schedule-columns">
                  <div class="schedule-column-days">
                    <span class="sub-section-title">Рабочие дни</span>
                    <div class="days-grid-layout">
                      <label v-for="day in ['пн.', 'вт.', 'ср.', 'чт.', 'пт.', 'сб.', 'вс.']" :key="day" class="day-checkbox-label"><input type="checkbox" :value="day" v-model="form.attributes[field.key].days" class="hidden-native-checkbox" /><span class="custom-checkbox-view"></span><span class="day-text">{{ day }}</span></label>
                    </div>
                  </div>
                  <div class="schedule-column-time">
                    <span class="sub-section-title">Рабочее время</span>
                    <div class="time-inputs-block">
                      <div class="time-row-item">
                        <span class="time-prefix">с</span>
                        <div class="time-input-wrapper"><input type="time" v-model="form.attributes[field.key].timeFrom" class="time-field" /><span class="custom-arrow-icon"></span></div>
                      </div>
                      <div class="time-row-item">
                        <span class="time-prefix">до</span>
                        <div class="time-input-wrapper">
                          <input type="time" v-model="form.attributes[field.key].timeTo" class="time-field" />
                          <span class="custom-arrow-icon"></span>
                        </div></div></div></div></div></div>
              <div v-else-if="field.type === 'number-unit'" class="unit-input-container">
                <div class="unit-input-wrapper">
                  <input v-model="form.attributes[field.key].value" type="number" class="f-input compact" placeholder="0" />
                  <div class="unit-select-box">
                    <select v-model="form.attributes[field.key].unit" class="unit-native-select">
                      <option v-for="opt in form.attributes[field.key].options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <span class="custom-arrow-icon-unit"></span>
</div></div></div></div></div></section>
        <section class="section" v-if="form.mainCategory !== 'uslugi'">
          <h3 class="section-title">Основная информация</h3>
          <div class="form-group"><label class="label">Название товара *</label><input v-model="form.title" class="f-input" :class="{ 'error-border': v$.title.$error }" placeholder="Введите название товара" /></div>
          <div class="form-group"><label class="label">Цена товара *</label><input v-model="form.price" type="number" class="f-input" :class="{ 'error-border': v$.price.$error }" placeholder="Введите цену товара" /></div>
        </section>
        <section class="section">
          <h3 class="section-title">Описание</h3>
          <div class="form-group"><label class="label">Описание *</label><textarea v-model="form.description" class="f-textarea" :class="{ 'error-border': v$.description.$error }" placeholder="Напишите что-нибудь о своём товаре"></textarea></div></section>
        <!-- ФОТОГРАФИИ -->
        <section class="section">
          <h3 class="section-title">Фотографии <span class="hint">Не более 30 фото</span></h3>
          <div class="photo-grid">
            <div v-for="(url, index) in photoPreviews" :key="index" class="photo-box">
              <img :src="url" class="preview-img" />
              <button type="button" class="remove-photo" @click="removePhoto(index)">×</button>
            </div>
            <label v-if="photoPreviews.length < 30" class="photo-box upload-btn">
              <input type="file" multiple accept="image/*" @change="handlePhotoUpload" hidden />
              <img src="/src/assets/img/icons/camera-green.svg" alt="camera" />
            </label>
          </div></section>
        <section class="section">
          <h3 class="section-title">
            {{ form.mainCategory === 'uslugi' ? 'Место работы' : 'Место жительства' }}
            <span class="hint">Укажите адрес своего дома, либо адрес желаемой работы</span>
          </h3>
          <div class="input-wrapper">
            <input v-model="searchQuery" class="f-input" :class="{ 'error-border': v$.address.$error }" placeholder="Введите адрес..." />
          </div>
          <div id="map-container-ad" class="map-container-ad"></div>
        </section>
        <section class="section">
          <h3 class="section-title">Контакты</h3>
          <div class="form-group">
            <div class="phone-input-wrapper">
              <input 
                v-model="form.phone" 
                v-mask="'+7 (###) ###-##-##'"
                type="tel" 
                placeholder="Введите контактный номер телефона" 
                class="f-input phone-field"
                :class="{ 'error-border': v$.phone.$error }"
              />
              <!-- Иконка крестика для очистки поля, если текст введен -->
              <button 
                v-if="form.phone" 
                type="button" 
                class="clear-phone-btn" 
                @click="form.phone = ''"
              >
                ×
              </button>
            </div>
          </div>
        </section>
        <div class="submit-section">
          <button type="button" class="btn-submit" :class="{ 'btn-disabled': v$.$invalid }" :disabled="isSubmitting" @click="publishAd">
            {{ isSubmitting ? 'Публикация...' : 'Разместить объявление' }}
          </button>
          <p v-if="v$.$invalid" class="validation-msg">Заполните все поля со звездочкой *</p>
</div></div></div></div></template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Multiselect from 'vue-multiselect';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue, minLength } from '@vuelidate/validators';
import { categories } from "/src/data/categories.js";
import { productFields } from "/src/data/productFields.js";
import { api } from "/src/api/api.js";
import { notify } from "/src/utils/notify";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js";

const auth = useAuthStore();
const isSubmitting = ref(false);
const searchQuery = ref("");
const selectedSub = ref(null);
const photos = ref([]);
const photoPreviews = ref([]);

const form = reactive({
  mainCategory: '',
  subCategory: '',
  title: '',
  description: '',
  price: '',
  address: '',
  coordinates: [],
  phone: '',
  attributes: {}
});

// ПРАВИЛА ВАЛИДАЦИИ
const rules = {
  title: { required, minLength: minLength(3) },
  description: { required },
  price: { required, minValue: minValue(1) },
  address: { required },
  phone: { required, minLength: minLength(18) } // 18 символов — это полная маска +7 (999) 999-99-99
};
const v$ = useVuelidate(rules, form);

// ХЛЕБНЫЕ КРОШКИ
const breadcrumbs = computed(() => {
  const crumbs = [{ name: 'Главная', path: '/' }, { name: 'Создать объявление' }];
  if (form.mainCategory) {
    const main = categories.find(c => c.slug === form.mainCategory);
    if (main) crumbs.push({ name: main.name });
  }
  if (form.subCategory) {
    const sub = availableSubCats.value.find(s => s.slug === form.subCategory);
    if (sub) crumbs.push({ name: sub.name });
  }
  return crumbs;
});

const availableSubCats = computed(() => {
  const found = categories.find(c => c.slug === form.mainCategory);
  return found ? found.sections.flatMap(s => s.links) : [];
});

// ТРАНСФОРМАЦИЯ КЛЮЧЕЙ ИЗ ФИЛЬТРА ПОИСКА ПОД КАТАЛОГ УСЛУГ С МАКЕТА
const activeFields = computed(() => {
  const catData = productFields[form.mainCategory];
  if (!catData) return [];
  const subData = catData[form.subCategory] || catData['default'];
  if (!subData) return [];

  const fields = [...subData.main, ...subData.extra];

  if (form.mainCategory === 'uslugi') {
    return fields.flatMap(field => {
      if (field.key === 'subcategory') return [];
      if (field.key === 'priceFrom') {
        return [
          { key: "service_name", label: "Название услуги", type: "text", placeholder: "Введите название услуги" },
          { key: "activity", label: "Чем вы занимаетесь", type: "text", placeholder: "Введите род деятельности" },
          { key: "service_types", label: "Виды предлагаемых услуг (не обязательно)", type: "dynamic-list", placeholder: "Введите название предлагаемой услуги" },
          { key: "price_type", label: "Стоимость услуги *", type: "service-price", options: ["За услугу", "За час", "За день", "По договоренности"] },
          { key: "schedule", label: "График работы", type: "work-schedule" },
          { key: "experience_months", label: "Опыт работы", type: "number-unit", unit: "мес." }
        ];
      }
      if (field.key === 'priceTo' || field.key === 'experience') return [];
      return field;
    });
  }
  return fields;
});

const selectMainCategory = (cat) => {
  form.mainCategory = cat.slug;
  form.subCategory = '';
  selectedSub.value = null;
  form.attributes = {};
};

const selectSubCategory = (sub) => {
  form.subCategory = sub.slug;
  form.attributes = {};
  if (auth.user?.phone) {
    form.phone = auth.formattedPhone;
  } else {
    form.phone = "";
  }
  
  // Безопасная подготовка реактивных объектов под сложные типы данных
  activeFields.value.forEach(field => {
    if (field.type === 'dynamic-list') {
      form.attributes[field.key] = ["", "", ""];
    } else if (field.type === 'work-schedule') {
      form.attributes[field.key] = { days: ['пн.'], timeFrom: "08:00", timeTo: "20:00" };
    } else if (field.type === 'service-price') {
      form.attributes[field.key] = "За услугу";
    } else if (field.type === 'number-unit') {
      form.attributes[field.key] = { value: "", unit: field.unit, options: ["мес.", "лет"] };
    } else {
      form.attributes[field.key] = field.type === 'chips' ? [] : "";
    }
  });

  if (form.mainCategory === 'uslugi') {
    watch(() => form.attributes['service_name'], (newVal) => { form.title = newVal || ""; });
  }
   let startCoords = [55.7558, 37.6173]; // Москва по дефолту
  
  if (auth.user?.city) {
    searchQuery.value = auth.user.city;
    form.address = auth.user.city;
    
    // Делаем запрос к геокодеру Яндекса через метод твоего стора
    const url = `yandex.ru{encodeURIComponent(auth.user.city)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const obj = data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
      if (obj) {
        // Меняем порядок координат с [lon, lat] на [lat, lon] для API карт
        startCoords = obj.Point.pos.split(' ').reverse().map(Number);
        form.coordinates = startCoords;
      }
    } catch (e) {
      console.error("Не удалось геокодировать город пользователя:", e);
    }
  }
  initMap(startCoords); 
};

// ОБРАБОТКА МАССИВА ФОТОГРАФИЙ
const handlePhotoUpload = (e) => {
  const files = Array.from(e.target.files);
  if (photos.value.length + files.length > 30) {
    notify("Максимум 30 фотографий", "error");
    return;
  }
  files.forEach(file => {
    photos.value.push(file);
    photoPreviews.value.push(URL.createObjectURL(file));
  });
};

const removePhoto = (index) => {
  URL.revokeObjectURL(photoPreviews.value[index]);
  photos.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

// ЯНДЕКС КАРТЫ С ОБРАТНЫМ ТРЕКИНГОМ МАРКЕРА
let map = null;
let placemark = null;
let searchTimeout = null;

const initMap = (coords) => {
  setTimeout(() => {
    if (!window.ymaps || map) return;
    ymaps.ready(() => {
      map = new ymaps.Map("map-container-ad", { center: coords, zoom: 12, controls: [] });
      placemark = new ymaps.Placemark(coords, {}, { preset: "islands#redIcon", draggable: true });
      
      placemark.events.add('dragend', () => {
        const currentCoords = placemark.geometry.getCoordinates();
        form.coordinates = currentCoords;
      });
      map.geoObjects.add(placemark);
    });
  }, 150);
};

watch(searchQuery, (query) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (query.length < 3) return;
    const url = `yandex.ru{encodeURIComponent(query)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const obj = data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
      if (obj) {
        const coords = obj.Point.pos.split(' ').reverse().map(Number);
        form.address = query;
        form.coordinates = coords;
        if (map) {
          map.setCenter(coords);
          placemark.geometry.setCoordinates(coords);
        }
      }
    } catch (e) {}
  }, 900);
});

// ПУБЛИКАЦИЯ ОБЪЯВЛЕНИЯ
const publishAd = async () => {
  const result = await v$.value.$validate();
  if (!result) return;

  isSubmitting.value = true;
  try {
    const uploadedUrls = [];
    for (const file of photos.value) {
      const url = await uploadToMediaService(file, auth.user?.id, "ad_photo");
      if (url) uploadedUrls.push(url);
    }

    const payload = {
      ...form,
      price: Number(form.price),
      phone: form.phone.replace(/\D/g, ''),
      images: uploadedUrls,
      attributes: JSON.stringify(form.attributes)
    };
    
    await api.post('/ads/create', payload);
    notify("Объявление успешно опубликовано!");
  } catch (e) {
    notify("Не удалось опубликовать объявление", "error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<style scoped>
/* ОБЩИЕ СЕТКИ И ОФОРМЛЕНИЕ */
.breadcrumbs { display: flex; gap: 8px; color: #aaa; font-size: 14px; margin-bottom: 25px; }
.crumb-item.last { color: #555; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
.category-card { border: 1px solid #eef0ef; padding: 20px; border-radius: 18px; text-align: center; cursor: pointer; transition: 0.2s; background: #fff; }
.category-card.active { border-color: #76a58f; background: #f7faf9; }
.fields-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }

/* ИНПУТЫ */
.f-input, .f-textarea { width: 100%; padding: 14px 18px; border: 1px solid #e2e2e2; border-radius: 12px; background: #fff; font-size: 14px; outline: none; }
.f-textarea { height: 140px; resize: none; }
.error-border { border-color: #ff4d4f !important; }

/* ФОТОГРАФИИ */
.photo-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
.photo-box { width: 110px; height: 100px; border: 1px solid #e0e0e0; border-radius: 14px; display: flex; align-items: center; justify-content: center; position: relative; background: #fff; cursor: pointer; }
.upload-btn { border-style: dashed; }
.preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 14px; }
.remove-photo { position: absolute; top: -6px; right: -6px; background: #ff4d4f; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 14px; }

/* КАРТА */
.map-container-ad { width: 100%; height: 320px; border-radius: 20px; margin-top: 16px; background: #f5f5f5; overflow: hidden; border: 1px solid #eaeaea; }

/* ГРАФИК РАБОТЫ */
.schedule-columns { display: flex; gap: 80px; }
.sub-section-title { display: block; font-size: 14px; color: #777; margin-bottom: 16px; }
.days-grid-layout { display: grid; grid-template-columns: repeat(2, minmax(80px, 1fr)); gap: 12px 24px; }
.day-checkbox-label { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
.hidden-native-checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
.custom-checkbox-view { width: 20px; height: 20px; border: 1px solid #e0e0e0; border-radius: 6px; background-color: #fff; display: inline-block; }
.hidden-native-checkbox:checked + .custom-checkbox-view { background-color: #76a58f; border-color: #76a58f; background-image: url("data:image/svg+xml,%3Csvg xmlns='w3.org' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E"); background-size: 14px; background-position: center; background-repeat: no-repeat; }
.time-inputs-block { display: flex; flex-direction: column; gap: 12px; }
.time-row-item { display: flex; align-items: center; gap: 12px; }
.time-field { padding: 10px 36px 10px 16px; border: 1px solid #e0e0e0; border-radius: 10px; width: 115px; outline: none; }

/* СДВОЕННАЯ СТОИМОСТЬ */
.price-type-wrapper { display: flex; gap: 12px; max-width: 400px; }
.price-input-container { position: relative; flex: 1; }
.currency-p { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #aaa; }
.unit-select { width: 160px; }

/* ОПЫТ РАБОТЫ (МЕНЯЮЩИЙСЯ СЕЛЕКТ МЕС./ЛЕТ) */
.unit-input-container { width: 150px; }
.unit-input-wrapper { position: relative; display: flex; align-items: center; }
.f-input.compact { padding-right: 75px; text-align: left; }
.unit-select-box { position: absolute; right: 1px; top: 1px; bottom: 1px; width: 70px; background: #fff; border-left: 1px solid #e0e0e0; border-radius: 0 12px 12px 0; display: flex; align-items: center; justify-content: center; }
.unit-native-select { width: 100%; height: 100%; border: none; background: transparent; padding-left: 10px; padding-right: 20px; font-size: 14px; color: #333; cursor: pointer; outline: none; -webkit-appearance: none; appearance: none; }
.custom-arrow-icon-unit { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 8px; height: 5px; background-image: url("data:image/svg+xml,%3Csvg xmlns='w3.org' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-size: contain; background-repeat: no-repeat; pointer-events: none; }

/* СТИЛИ КНОПКИ */
.btn-submit { background: #76a58f; color: white; width: 100%; padding: 16px; border-radius: 30px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; }
.btn-disabled { background: #d0d5d2 !important; cursor: not-allowed; }
.validation-msg { color: #ff4d4f; font-size: 12px; margin-top: 8px; text-align: center; }
.hint { font-size: 13px; color: #bbb; font-weight: normal; margin-left: 8px; }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
/* Блок обертки телефона для позиционирования крестика */
.phone-input-wrapper {
  position: relative;
  width: 100%;
}
.f-input.phone-field {
  padding-right: 45px;
}
.clear-phone-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 22px;
  color: #000; 
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.clear-phone-btn:hover {opacity: 0.7;}

</style>
