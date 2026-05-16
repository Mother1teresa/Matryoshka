<template>
  <div class="create-ad-page">
    <div class="container">
      <h1 class="page-title">Создать объявление</h1>
      
      <!-- Хлебные крошки -->
      <nav class="breadcrumbs">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <span class="crumb-item" :class="{ last: index === breadcrumbs.length - 1 }">
            {{ crumb.name }}
          </span>
          <span v-if="index < breadcrumbs.length - 1" class="separator">→</span>
        </template>
      </nav>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 1: Выбор основной категории -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="section">
        <h3 class="section-title">Выбор категории</h3>
        <div class="category-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-card" 
            :class="{ active: form.mainCategory === cat.slug }" 
            @click="selectMainCategory(cat)"
          >
            <div class="cat-icon">
              <img :src="cat.icon" alt="" />
            </div>
            <span>{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 2: Выбор подкатегории (первый уровень) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section v-if="form.mainCategory && availableSections.length > 0" class="section fade-in">
      <h3 class="section-title">Выбор подкатегории</h3>
      <div class="subcategory-grid">
        <div 
          v-for="section in availableSections" 
          :key="section.slug"
          class="subcategory-card"
          :class="{ active: form.subCategory === section.slug }"
          @click="selectSubCategory(section)"
        >
            <span v-if="section.icon" class="sub-icon">{{ section.icon }}</span>
            <span>{{ section.title || section.name }}</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 2.5: Выбор под-подкатегории (для water и т.д.) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section 
        v-if="availableSubLinks.length > 0" 
        class="section fade-in"
      >
        <h3 class="section-title">Выбор подкатегории</h3>
        <div class="subcategory-grid">
          <div 
            v-for="link in availableSubLinks" 
            :key="link.slug"
            class="subcategory-card"
            :class="{ active: form.subSubCategory === link.slug }"
            @click="selectSubSubCategory(link)"
          >
            <span>{{ link.name }}</span>
          </div>
        </div>
      </section>
            <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 2.75: Выбор типа объекта (для недвижимости) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section 
        v-if="objectTypeSelector && !form.objectType" 
        class="section fade-in"
      >
        <h3 class="section-title">{{ objectTypeSelector.label }}</h3>
        <div class="chips-row">
          <button
            v-for="opt in objectTypeOptions"
            :key="opt"
            type="button"
            class="chip-btn"
            :class="{ active: form.objectType === opt }"
            @click="selectObjectType(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </section>
      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 3: Динамические поля из конфига -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <template v-if="currentSections.length > 0">
        <section 
          v-for="(section, sIdx) in currentSections" 
          :key="sIdx"
          class="section fade-in"
        >
          <h3 v-if="section.title" class="section-title">{{ section.title }}</h3>
          <div class="fields-grid" :class="section.gridClass">
            <FormField
              v-for="field in section.fields"
              :key="field.key"
              :field="field"
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
            />
          </div>
        </section>
      </template>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 4: Общие секции (всегда внизу) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <template v-if="showCommonSections">
        
        <!-- Описание (если не встроено в конфиг категории) -->
        <section v-if="!descriptionInConfig" class="section fade-in">
          <h3 class="section-title">Описание</h3>
          <div class="form-group">
            <label class="label">Описание *</label>
            <textarea 
              v-model="form.description" 
              class="f-textarea" 
              :class="{ 'error-border': v$.description.$error }" 
              placeholder="Напишите что-нибудь о своём товаре"
            ></textarea>
          </div>
        </section>

        <!-- Фотографии -->
        <section class="section fade-in">
          <h3 class="section-title">
            Фотографии
            <span class="hint">Не более 30 фото</span>
          </h3>
          <div class="photo-grid">
            <div 
              v-for="(url, index) in photoPreviews" 
              :key="index" 
              class="photo-box"
            >
              <img :src="url" class="preview-img" />
              <button type="button" class="remove-photo" @click="removePhoto(index)">×</button>
            </div>
            <label v-if="photoPreviews.length < 30" class="photo-box upload-btn">
              <input type="file" multiple accept="image/*" @change="handlePhotoUpload" hidden />
              <img src="/src/assets/img/icons/camera.svg" alt="camera" />
            </label>
          </div>
        </section>

        <!-- Карта -->
        <section class="section fade-in">
          <h3 class="section-title">
            {{ locationLabel }}
            <span class="hint">Укажите адрес своего дома, либо адрес желаемой работы</span>
          </h3>
          <div class="input-wrapper">
            <input 
              v-model="searchQuery" 
              class="f-input" 
              :class="{ 'error-border': v$.address.$error }" 
              placeholder="Введите адрес..." 
            />
          </div>
          <div id="map-container-ad" class="map-container-ad"></div>
        </section>

        <!-- Контакты -->
        <section class="section fade-in">
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

        <!-- Кнопка отправки -->
        <div class="submit-section">
          <button 
            type="button" 
            class="btn-submit" 
            :class="{ 'btn-disabled': v$.$invalid }" 
            :disabled="isSubmitting" 
            @click="publishAd"
          >
            {{ isSubmitting ? 'Публикация...' : 'Разместить объявление' }}
          </button>
          <p v-if="v$.$invalid" class="validation-msg">Заполните все поля со звездочкой *</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue, minLength } from '@vuelidate/validators';
import { categories } from "/src/data/categories.js";
import { getAdConfig, getSections, getObjectTypeSelector, getObjectTypes } from "/src/data/adCreateConfig.js";
import { api } from "/src/api/api.js";
import { notify } from "/src/utils/notify";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js";
import FormField from '/src/views/FormField.vue';

const auth = useAuthStore();
const isSubmitting = ref(false);
const searchQuery = ref("");
const photos = ref([]);
const photoPreviews = ref([]);

// ═══════════════════════════════════════════════════════════
// ФОРМА
// ═══════════════════════════════════════════════════════════

const form = reactive({
  mainCategory: '',
  subCategory: '',
  subSubCategory: '',      // для water → yachts/jetski
  objectType: '',
  title: '',
  description: '',
  price: '',
  address: '',
  coordinates: [],
  phone: '',
  attributes: {}            // все динамические поля категории
});

// ═══════════════════════════════════════════════════════════
// ВАЛИДАЦИЯ
// ═══════════════════════════════════════════════════════════

const rules = {
  title: { required, minLength: minLength(3) },
  description: { required },
  price: { required, minValue: minValue(1) },
  address: { required },
  phone: { required, minLength: minLength(18) }
};

const v$ = useVuelidate(rules, form);

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Хлебные крошки
// ═══════════════════════════════════════════════════════════

const breadcrumbs = computed(() => {
  const crumbs = [
    { name: 'Главная', path: '/' }, 
    { name: 'Создать объявление' }
  ];
  
  if (form.mainCategory) {
    const main = categories.find(c => c.slug === form.mainCategory);
    if (main) crumbs.push({ name: main.name });
  }
  
  if (form.subCategory) {
    const section = availableSections.value.find(s => s.slug === form.subCategory);
    if (section) crumbs.push({ name: section.title || section.name });
  }
  
  if (form.subSubCategory) {
    const sub = availableSubLinks.value.find(s => s.slug === form.subSubCategory);
    if (sub) crumbs.push({ name: sub.name });
  }
  
  return crumbs;
});

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Доступные подкатегории
// ═══════════════════════════════════════════════════════════

const currentCategory = computed(() => {
  return categories.find(c => c.slug === form.mainCategory);
});

const availableSections = computed(() => {
  if (!currentCategory.value) return [];
  return currentCategory.value.sections || [];
});

const availableSubLinks = computed(() => {
  if (!form.subCategory) return [];
  const section = availableSections.value.find(s => s.slug === form.subCategory);
  return section?.links || section?.subLinks || [];
});

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Конфиг и секции
// ═══════════════════════════════════════════════════════════

const currentConfig = computed(() => {
  // Для третьего уровня (transport → water → yachts)
  if (form.subSubCategory) {
    return getAdConfig(form.mainCategory, form.subCategory, form.subSubCategory);
  }
  return getAdConfig(form.mainCategory, form.subCategory);
});

// Есть ли описание в конфиге категории?
const descriptionInConfig = computed(() => {
  if (!currentConfig.value) return false;
  return currentSections.value.some(s => 
    s.fields.some(f => f.key === 'description' && f.type === 'textarea')
  );
});

// Лейбл для карты
const locationLabel = computed(() => {
  if (form.mainCategory === 'uslugi') return 'Место работы';
  if (form.mainCategory === 'rabota') return 'Место работы';
  return 'Место жительства';
});
// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Тип объекта (для недвижимости)
// ═══════════════════════════════════════════════════════════

const objectTypeSelector = computed(() => {
  if (!currentConfig.value) return null;
  return getObjectTypeSelector(currentConfig.value);
});

const objectTypeOptions = computed(() => {
  return getObjectTypes(currentConfig.value);
});

const currentSections = computed(() => {
  return getSections(currentConfig.value, form.objectType);
});

const showCommonSections = computed(() => {
  // Если есть под-подкатегории и не выбрана — не показываем
  if (availableSubLinks.value.length > 0 && !form.subSubCategory) return false;
  
  // Если есть селектор типа объекта и не выбран — не показываем
  if (objectTypeSelector.value && !form.objectType) return false;
  
  // Показываем если есть секции или если конфиг существует
  return currentSections.value.length > 0 || !!currentConfig.value;
});

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Работа с полями
// ═══════════════════════════════════════════════════════════

function getFieldValue(key) {
  return form.attributes[key];
}

function setFieldValue(key, value) {
  form.attributes[key] = value;
  
  // Если поле привязано к title — синхронизируем
  const field = findFieldByKey(key);
  if (field?.bindToTitle) {
    form.title = value;
  }
  
  // Если поле — цена внутри attributes, синхронизируем с form.price
  if (key === 'price' && typeof value === 'object') {
    form.price = value.price;
  }
}

function findFieldByKey(key) {
  for (const section of currentSections.value) {
    const field = section.fields.find(f => f.key === key);
    if (field) return field;
  }
  return null;
}
function selectObjectType(type) {
  form.objectType = type;
  form.attributes = {};
  initFieldsFromConfig();
}
// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Выбор категорий
// ═══════════════════════════════════════════════════════════

function selectMainCategory(cat) {
  // Сброс всего
  form.mainCategory = cat.slug;
  form.subCategory = '';
  form.subSubCategory = '';
  form.title = '';
  form.description = '';
  form.price = '';
  form.attributes = {};
  
  v$.value.$reset();
}

function selectSubCategory(section) {
  form.subCategory = section.slug;
  form.subSubCategory = '';
  form.objectType = ''; // Сброс типа объекта
  form.attributes = {};
  
  initFieldsFromConfig();
  
  if (auth.user?.phone) {
    form.phone = auth.formattedPhone || auth.user.phone;
  }
  
  nextTick(() => {
    initMapWithUserCity();
  });
}

function selectSubSubCategory(link) {
  form.subSubCategory = link.slug;
  form.attributes = {};
  initFieldsFromConfig();
  
  nextTick(() => {
    initMapWithUserCity();
  });
}

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Инициализация полей из конфига
// ═══════════════════════════════════════════════════════════

function initFieldsFromConfig() {
  const config = currentConfig.value;
  if (!config) return;
  
  // getSections сам разберётся с objectType
  const sections = getSections(config, form.objectType);
  
  for (const section of sections) {
    for (const field of section.fields) {
      // ... та же логика что и раньше
      switch (field.type) {
        case 'dynamic-list':
          form.attributes[field.key] = ['', '', ''];
          break;
        case 'days-checkbox':
          form.attributes[field.key] = ['пн.'];
          break;
        case 'time-range':
          form.attributes[field.key] = { from: '08:00', to: '20:00' };
          break;
        case 'price-with-unit':
          form.attributes[field.key] = { price: '', unit: field.unitOptions?.[0] || '' };
          break;
        case 'number-with-unit':
          form.attributes[field.key] = { value: '', unit: field.unitOptions?.[0] || '' };
          break;
        case 'chips':
          form.attributes[field.key] = [];
          break;
        default:
          form.attributes[field.key] = '';
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Фотографии
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// КАРТА — исправленная версия
// ═══════════════════════════════════════════════════════════

let map = null;
let placemark = null;
let searchTimeout = null;
let mapInitialized = false;

function initMap(coords = [55.7558, 37.6173]) {
  if (!window.ymaps) {
    console.warn('Yandex Maps API не загружен');
    return;
  }
  
  ymaps.ready(() => {
    // Если карта уже есть — просто обновляем центр и метку
    if (map && placemark) {
      map.setCenter(coords, 14);
      placemark.geometry.setCoordinates(coords);
      return;
    }
    
    // Создаём новую карту
    map = new ymaps.Map("map-container-ad", { 
      center: coords, 
      zoom: 14, 
      controls: ['zoomControl'] 
    });
    
    placemark = new ymaps.Placemark(coords, {}, { 
      preset: "islands#redIcon", 
      draggable: true 
    });
    
    placemark.events.add('dragend', () => {
      const newCoords = placemark.geometry.getCoordinates();
      form.coordinates = newCoords;
      // Обратное геокодирование — получаем адрес по координатам
      reverseGeocode(newCoords);
    });
    
    map.geoObjects.add(placemark);
    mapInitialized = true;
  });
}

// Обратное геокодирование (координаты → адрес)
async function reverseGeocode(coords) {
  if (!window.ymaps) return;
  try {
    const res = await ymaps.geocode(coords);
    const firstGeoObject = res.geoObjects.get(0);
    if (firstGeoObject) {
      const address = firstGeoObject.getAddressLine();
      searchQuery.value = address;
      form.address = address;
    }
  } catch (e) {
    console.error('Обратное геокодирование не удалось:', e);
  }
}

async function initMapWithUserCity() {
  let coords = [55.7558, 37.6173]; // Москва по умолчанию
  
  if (auth.user?.city) {
    searchQuery.value = auth.user.city;
    form.address = auth.user.city;
    
    try {
      const res = await ymaps.geocode(auth.user.city);
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        coords = firstGeoObject.geometry.getCoordinates();
        form.coordinates = coords;
      }
    } catch (e) {
      console.error('Геокодирование города не удалось:', e);
    }
  }
  
  nextTick(() => initMap(coords));
}

// Watch — исправленный
watch(searchQuery, (query) => {
  clearTimeout(searchTimeout);
  
  if (!query || query.length < 3) return;
  
  searchTimeout = setTimeout(async () => {
    if (!window.ymaps) return;
    
    try {
      const res = await ymaps.geocode(query, { results: 1 });
      const obj = res.geoObjects.get(0);
      
      if (obj) {
        const coords = obj.geometry.getCoordinates();
        form.address = query;
        form.coordinates = coords;
        
        if (map && placemark) {
          map.setCenter(coords, 14);
          placemark.geometry.setCoordinates(coords);
        } else {
          // Если карта ещё не создана — создаём
          nextTick(() => initMap(coords));
        }
      }
    } catch (e) {
      console.error('Поиск адреса не удался:', e);
    }
  }, 600);
});

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Публикация
// ═══════════════════════════════════════════════════════════

const publishAd = async () => {
  const result = await v$.value.$validate();
  if (!result) {
    notify("Заполните все обязательные поля", "error");
    return;
  }

  isSubmitting.value = true;
  
  try {
    // 1. Загрузка фото
    const uploadedUrls = [];
    for (const file of photos.value) {
      const url = await uploadToMediaService(file, auth.user?.id, "ad_photo");
      if (url) uploadedUrls.push(url);
    }

    // 2. Формирование payload
    const payload = {
      mainCategory: form.mainCategory,
      subCategory: form.subCategory,
      subSubCategory: form.subSubCategory || undefined,
      objectType: form.objectType || undefined,
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      address: form.address,
      coordinates: form.coordinates,
      phone: form.phone.replace(/\D/g, ''),
      images: uploadedUrls,
      attributes: form.attributes
    };

    // 3. Отправка
    await api.post('/ads/create', payload);
    
    notify("Объявление успешно опубликовано!", "success");
    
    // Сброс или редирект
    // router.push('/my-ads');
    
  } catch (e) {
    console.error("Ошибка публикации:", e);
    notify(e.response?.data?.message || "Не удалось опубликовать объявление", "error");
  } finally {
    isSubmitting.value = false;
  }
};

// ═══════════════════════════════════════════════════════════
// MOUNTED
// ═══════════════════════════════════════════════════════════

onMounted(() => {
  // Карта загрузится при выборе категории
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════ */
/* СТИЛИ (твои + новые) */
/* ═══════════════════════════════════════════════════════════ */

.breadcrumbs { 
  display: flex; 
  gap: 8px; 
  color: #aaa; 
  font-size: 14px; 
  margin-bottom: 25px; 
}
.crumb-item.last { color: #555; }

/* Категории */
.category-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 15px; 
  margin-top: 15px; 
}
.category-card { 
  border: 1px solid #eef0ef; 
  padding: 20px; 
  border-radius: 18px; 
  text-align: center; 
  cursor: pointer; 
  transition: 0.2s; 
  background: #fff; 
}
.category-card.active { 
  border-color: #76a58f; 
  background: #f7faf9; 
}
.cat-icon img { width: 40px; height: 40px; margin-bottom: 8px; }

/* Подкатегории */
.subcategory-grid { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  margin-top: 15px; 
}
.subcategory-card { 
  padding: 14px 24px; 
  border: 1px solid #e0e0e0; 
  border-radius: 14px; 
  background: #f5f5f5; 
  cursor: pointer; 
  transition: 0.2s; 
  font-size: 14px;
}
.subcategory-card.active { 
  background: #76a58f; 
  color: white; 
  border-color: #76a58f; 
}

/* Поля */
.fields-grid { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
}

/* Фото */
.photo-grid { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  margin-top: 15px; 
}
.photo-box { 
  width: 110px; 
  height: 100px; 
  border: 1px solid #e0e0e0; 
  border-radius: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  position: relative; 
  background: #fff; 
  cursor: pointer; 
  overflow: hidden;
}
.upload-btn { border-style: dashed; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.remove-photo { 
  position: absolute; 
  top: -6px; 
  right: -6px; 
  background: #ff4d4f; 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 22px; 
  height: 22px; 
  cursor: pointer; 
  font-size: 14px; 
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Карта */
.map-container-ad { 
  width: 100%; 
  height: 320px; 
  border-radius: 20px; 
  margin-top: 16px; 
  background: #f5f5f5; 
  overflow: hidden; 
  border: 1px solid #eaeaea; 
}

/* Кнопка */
.btn-submit { 
  background: #76a58f; 
  color: white; 
  width: 100%; 
  padding: 16px; 
  border-radius: 30px; 
  border: none; 
  font-size: 16px; 
  font-weight: 600; 
  cursor: pointer; 
  margin-top: 20px; 
}
.btn-disabled { 
  background: #d0d5d2 !important; 
  cursor: not-allowed; 
}
.validation-msg { 
  color: #ff4d4f; 
  font-size: 12px; 
  margin-top: 8px; 
  text-align: center; 
}
.hint { 
  font-size: 13px; 
  color: #bbb; 
  font-weight: normal; 
  margin-left: 8px; 
}

/* Анимация */
.fade-in { 
  animation: fadeIn 0.3s ease-out; 
}
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(8px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* Телефон */
.phone-input-wrapper { position: relative; width: 100%; }
.f-input.phone-field { padding-right: 45px; }
.clear-phone-btn { 
  position: absolute; 
  right: 18px; 
  top: 50%; 
  transform: translateY(-50%); 
  background: none; 
  border: none; 
  font-size: 22px; 
  color: #000; 
  cursor: pointer; 
  padding: 0; 
  line-height: 1; 
}
.clear-phone-btn:hover { opacity: 0.7; }

/* Ошибки */
.error-border { border-color: #ff4d4f !important; }
/* В <style scoped> CreateAdPage.vue */

.chips-row { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 10px; 
  margin-top: 8px;
}
.chip-btn { 
  padding: 12px 24px; 
  border: 1px solid #e0e0e0; 
  border-radius: 14px; 
  background: #f5f5f5; 
  cursor: pointer; 
  transition: 0.2s;
  font-size: 14px;
}
.chip-btn:hover {
  background: #eef0ef;
}
.chip-btn.active { 
  background: #76a58f; 
  color: white; 
  border-color: #76a58f; 
}
</style>