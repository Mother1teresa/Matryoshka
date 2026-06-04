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
      <!-- ШАГ 2: Выбор подкатегории                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section v-if="showSubcategoryChoices" class="section fade-in">
        <h3 class="section-title">Выбор подкатегории</h3>
        <div class="subcategory-grid">
          <div 
            v-for="choice in subcategoryChoices" 
            :key="choice.slug"
            class="subcategory-card"
            :class="{ active: form.subCategory === choice.slug }"
            @click="selectSubCategory(choice)"
          >
            <span>{{ choice.name }}</span>
          </div>
        </div>
      </section>
      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 2.5: Выбор под-подкатегории (subSubCategory) -->
      <!-- Показываем, если у выбранной подкатегории есть subLinks -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section 
        v-if="form.subCategory && availableSubLinks.length > 0" 
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
      <!-- ШАГ 3: Динамические поля из конфига -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <template v-if="showFormFields">
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
              :sub-sub-category="form.subSubCategory"
              @update:model-value="setFieldValue(field.key, $event)"
            />
          </div>
        </section>
      </template>
      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ШАГ 4: Общие секции (фото, карта, контакты, описание) -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <template v-if="showCommonSections">
        <!-- Описание -->
        <section v-if="!descriptionInConfig" class="section fade-in">
          <h3 class="section-title">Описание</h3>
          <div class="form-group">
            <label class="label">Описание <span class="required">*</span></label>
            <textarea 
              v-model="form.description" 
              class="f-textarea" 
              :class="{ 'error-border': v$.description.$error }" 
              placeholder="Напишите что-нибудь о своём объявлении"
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
              <img src="/src/assets/img/icons/camera.svg" alt="camera" class="camera-foto"/>
            </label>
          </div>
        </section>
        <!-- Карта -->
        <section class="section fade-in">
          <h3 class="section-title">
            {{ locationLabel }}
            <span class="hint">Укажите адрес</span>
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
        <div style="font-size: 12px; color: red; margin: 10px 0;">
          <div>title: {{ form.title ? 'OK' : 'EMPTY' }}</div>
          <div>description: {{ form.description ? 'OK' : 'EMPTY' }}</div>
          <div>price: {{ form.price ? 'OK' : 'EMPTY' }}</div>
          <div>address: {{ form.address ? 'OK' : 'EMPTY' }}</div>
          <div>phone: {{ form.phone ? 'OK' : 'EMPTY' }}</div>
          <div>v$.$invalid: {{ v$.$invalid }}</div>
          <div>v$.$dirty: {{ v$.$dirty }}</div>
        </div>
        <!-- Кнопка отправки -->
        <div class="submit-section">
          <button 
            type="button" 
            class="btn-submit" 
            :class="{ 'btn-disabled': v$.$invalid && v$.$dirty }" 
            :disabled="isSubmitting" 
            @click="publishAd"
          >
            {{ isSubmitting ? 'Публикация...' : 'Разместить объявление' }}
          </button>
          <p v-if="v$.$invalid && v$.$dirty" class="validation-msg">Заполните все поля со звёздочкой *</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue, minLength } from '@vuelidate/validators';
import { categories } from "/src/data/categories.js";
import { getAdConfig, getSections } from "/src/data/adCreateConfig.js";
import { api } from "/src/api/api.js";
import { notify } from "/src/utils/notify";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js";
import FormField from '/src/views/FormField.vue';
import { useRouter } from 'vue-router'

const router = useRouter()
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
  subSubCategory: '',   
  title: '',
  description: '',
  price: '',
  address: '',
  coordinates: [],
  phone: '',
  attributes: {}         
});

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Доступные подкатегории
// ═══════════════════════════════════════════════════════════

const currentCategory = computed(() => {
  return categories.find(c => c.slug === form.mainCategory);
});

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Нормализованный список подкатегорий
// ═══════════════════════════════════════════════════════════

// Нормализуем: sections со slug ИЛИ links без slug (транспорт, недвижимость)
const subcategoryChoices = computed(() => {
  if (!currentCategory.value) return [];
  const sections = currentCategory.value.sections || [];
  const choices = [];
  for (const section of sections) {
    if (section.slug) {
      choices.push({
        slug: section.slug,
        name: section.title || section.name,
        hasSubLinks: section.links?.some(l => l.subLinks) || false
      });
    } else if (section.links) {
      for (const link of section.links) {
        choices.push({
          slug: link.slug,
          name: link.name,
          subLinks: link.subLinks || null,
          hasSubLinks: !!link.subLinks
        });
      }
    }
  }
  return choices;
});
const currentSubCategory = computed(() => {
  return subcategoryChoices.value.find(c => c.slug === form.subCategory);
});

const availableSubLinks = computed(() => {
  if (!currentSubCategory.value) return [];
  return currentSubCategory.value.subLinks || [];
});
const showSubcategoryChoices = computed(() => {
  if (!form.mainCategory) return false;
  const cat = currentCategory.value;
  if (!cat) return false;
  const sections = cat.sections || [];
  const slugSections = sections.filter(s => s.slug);
  if (slugSections.length === 1) return false;
  return subcategoryChoices.value.length > 0;
});
// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Конфиг и секции
// ═══════════════════════════════════════════════════════════

const currentConfig = computed(() => {
  return getAdConfig(form.mainCategory, form.subCategory, form.subSubCategory);
});

const currentSections = computed(() => {
  return getSections(currentConfig.value);
});

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
  return 'Местоположение';
});
const rules = computed(() => {
  const base = {
    title: { required, minLength: minLength(3) },
    description: descriptionInConfig.value ? {} : { required },
    address: { required },
    phone: { required, minLength: minLength(18) }
  };
  
  // Для работы цена берётся из attributes.salary, а не form.price
  if (form.mainCategory !== 'rabota') {
    base.price = { required, minValue: minValue(1) };
  }
  
  return base;
});
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
    const section = subcategoryChoices.value.find(s => s.slug === form.subCategory);
    if (section) crumbs.push({ name: section.name });
  }
  
  if (form.subSubCategory) {
    const sub = availableSubLinks.value.find(s => s.slug === form.subSubCategory);
    if (sub) crumbs.push({ name: sub.name });
  }
  
  return crumbs;
});
// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ: Условия отображения формы
// ═══════════════════════════════════════════════════════════

const showFormFields = computed(() => {
  if (availableSubLinks.value.length > 0 && !form.subSubCategory) return false;
  return currentSections.value.length > 0;
});

const showCommonSections = computed(() => {
  if (availableSubLinks.value.length > 0 && !form.subSubCategory) return false;
  if (!form.subCategory) return false;
  return currentSections.value.length > 0;
});

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Работа с полями
// ═══════════════════════════════════════════════════════════

function getFieldValue(key) {
  return form.attributes[key];
}

// В setFieldValue добавь:
function setFieldValue(key, value) {
  form.attributes[key] = value;
  
  const field = findFieldByKey(key);
  if (field?.bindToTitle) {
    form.title = value;
    console.log('Title updated:', form.title);
  }
  
  // Синхронизируем salary с form.price
  if (key === 'salary' && typeof value === 'object') {
    form.price = value.price;
  }
  
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

// ═══════════════════════════════════════════════════════════
// МЕТОДЫ: Выбор категорий
// ═══════════════════════════════════════════════════════════

function selectMainCategory(cat) {
  form.mainCategory = cat.slug;
  form.subCategory = '';
  form.subSubCategory = '';
  form.title = '';
  form.description = '';
  form.price = '';
  form.address = '';
  form.phone = '';
  form.attributes = {};
  
  // В Vuelidate v2 $reset() существует
  v$.value.$reset();
  
  const sections = cat.sections || [];
  const slugSections = sections.filter(s => s.slug);
  if (slugSections.length === 1) {
    nextTick(() => {
      const sec = slugSections[0];
      selectSubCategory({ 
        slug: sec.slug, 
        name: sec.title || sec.name,
        subLinks: null
      });
    });
  }
}

function selectSubCategory(choice) {
  form.subCategory = choice.slug;
  form.subSubCategory = '';
  form.attributes = {};
  initFieldsFromConfig();

  if (auth.user?.phone) {
    form.phone = auth.formattedPhone || auth.user.phone;
  }
  if (!choice.subLinks) {
    nextTick(() => initMapWithUserCity());
  }
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
  
  const sections = getSections(config);
  
  for (const section of sections) {
    for (const field of section.fields) {
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

function destroyMap() {
  if (map) {
    try {
      map.destroy();
    } catch (e) {
      console.warn('Ошибка уничтожения карты:', e);
    }
    map = null;
    placemark = null;
  }
}

function initMap(coords = [55.7558, 37.6173]) {
  if (!window.ymaps) {
    console.warn('Yandex Maps API не загружен');
    return;
  }
  destroyMap();
  const container = document.getElementById('map-container-ad');
  if (!container) {
    console.warn('Контейнер карты не найден в DOM');
    return;
  }
  container.innerHTML = '';
  
  ymaps.ready(() => {
    try {
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
        reverseGeocode(newCoords);
      });
      
      map.geoObjects.add(placemark);
    } catch (e) {
      console.error('Ошибка создания карты:', e);
    }
  });
}

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
  let coords = [55.7558, 37.6173];
  
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
  nextTick(() => {
    setTimeout(() => initMap(coords), 150);
  });
}

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
          initMap(coords);
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
  const isValid = await v$.value.$validate();
  
  if (!isValid) {
    notify("Заполните все обязательные поля", "error");
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Загружаем фото
    const uploadedUrls = [];
    for (const file of photos.value) {
      const url = await uploadToMediaService(file, "image", { title: "ad_photo" });
      if (url) uploadedUrls.push({ pictureUrl: url });
    }

    // Загружаем видео если есть
    let videoId = null;
    if (form.videoFile) {
      const videoResult = await uploadToMediaService(form.videoFile, "video", { 
        title: form.title 
      });
      if (videoResult?.id) videoId = videoResult.id;
    }

    // Формируем payload
    const payload = {
      category: form.mainCategory,
      title: form.title,
      price: String(form.price || 0),
      description: form.description,
      address: form.address,
      contacts: form.phone.replace(/\D/g, ''),
      pictures: uploadedUrls,
      videoId: videoId,
      subCategory: form.subCategory,
      ...form.attributes,
    };

    // Убираем undefined/null поля
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    await auth.createAdvert(payload);
    router.push('/profile/advertisements');
    
  } catch (e) {
    console.error('Ошибка публикации:', e);
  } finally {
    isSubmitting.value = false;
  }
};

// ═══════════════════════════════════════════════════════════
// MOUNTED
// ═══════════════════════════════════════════════════════════

onMounted(() => {
});

onBeforeUnmount(() => {
  destroyMap();
});
</script>

<style scoped>
.profile-main .container{
  width: 100%;
  margin: 0;
}
.create-ad-page { padding-bottom: 2.857rem; background: #FFFFFF; padding: 0.938rem 2.188rem 2.938rem 2.188rem;
margin-top: 2.438rem; border-radius: 1.875rem; height: 97%;
    margin-bottom: 2rem;}

.create-ad-page .page-title{
  text-align: start;
  color: var(--btn-bg);
  margin-bottom: 1.563rem;
}
.breadcrumbs { 
  display: flex; 
  gap: 0.313rem; 
  color: #A8A1A1; 
  font-size: 1rem; 
  margin-bottom: 2.188rem;
}
.crumb-item.last { color: #555; }

.category-grid { 
  display: flex;  
  flex-wrap: wrap;
  gap: 1.071rem; 
  margin-top: 2.188rem; 
}
.category-card { 
  position: relative;
  width: fit-content;
  height: 4.75rem;
  padding: 0.625rem 1rem 0.825rem 1rem;
  padding-right: 1.75rem;
  color: #262626;
  font-weight: 500;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: .5rem;
  border-radius: 0.938rem;
  background-color: #d9d9d980;
  transition: opacity 0.3s, box-shadow 0.3s;
    /* margin-bottom: 1.738rem; */
    overflow: hidden;
    cursor: pointer;
}
.category-card:hover {
  border-color: #76a58f;
}
.category-card.active { 
  width: fit-content;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  background-color: white;
}
.cat-icon img { width: 4.357rem; height: 2.857rem; }
.cat-icon{
  position: relative;
  order: 2;
  right: -1rem;
  bottom: -1.2rem;
  width: 3rem;
  height: 3rem;
}
.subcategory-grid { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.75rem; 
  margin-top: 0.938rem; 
}
.subcategory-card { 
  padding: 0.875rem 1.5rem; 
  border: 1px solid #e0e0e0; 
  border-radius: 0.875rem; 
  background: #f5f5f5; 
  cursor: pointer; 
  transition: 0.2s; 
  font-size: 0.975rem;
}
.subcategory-card:hover {
  border-color: #76a58f;
}
.subcategory-card.active { 
  width: fit-content;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-color: #76a58f; 
}

.fields-grid { 
  display: flex; 
  flex-direction: column; 
  gap: 0.938rem; 
  margin-top: 0.938rem;
}
.photo-grid { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 12px; 
  margin-top: 15px; 
}
.photo-box { 
  width: 11.688rem; 
  height: 8.438rem; 
  border: 0.5px solid #000000; 
  border-radius: 0.625rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  position: relative; 
  background: #fff; 
  cursor: pointer; 
  overflow: hidden;
}
.photo-box .camera-foto{
  width: 6.188rem;
  height: 4.688rem;
}
/* .upload-btn { border-style: dashed; } */
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.remove-photo { 
  position: absolute; 
  top: auto; 
  right: auto; 
  background: #ff4d4f; 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 1.375rem;
  height: 1.375rem;
  cursor: pointer; 
  font-size: 1rem; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-container-ad { 
  width: 100%; 
  height: 31.676rem; 
  border-radius: 0.625rem !important; 
  margin-top: 0.938rem; 
  background: #f5f5f5; 
  overflow: hidden; 
  border: 1px solid #eaeaea; 
}
.submit-section{
  display: grid;
  align-items: center;
  justify-content: center;
}
.btn-submit { 
  background: var(--btn-bg); 
  color: white;
  text-align: center;
  width: fit-content; 
  padding: 1.375rem 1.75rem; 
  border-radius: 1.875rem; 
  border: none; 
  font-size: 1.25rem; 
  font-weight: 400; 
  cursor: pointer; 
  transition: 0.2s;
}
.btn-submit:hover {
  background: #5e9079;
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

.fade-in { 
  animation: fadeIn 0.3s ease-out; 
}
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(8px); } 
  to { opacity: 1; transform: translateY(0); } 
}

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
.error-border { border-color: #ff4d4f !important; }
.required { color: #ff4d4f; margin-left: 2px; }
.section { margin-bottom: 2.188rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: #262626; margin-bottom: 0.938rem;}
/* .form-group { margin-bottom: .5rem; } */
.label { font-size: 1.25rem; font-weight: 400; color: #262626; display: block; margin-bottom: 8px; }
.f-input, .f-textarea {
  min-width: 8rem;
  width: 100%;
  padding: 0.875rem 0.938rem !important;
  border: 1px solid #e0e0e0;
  border-radius: 0.625rem !important;
  font-size: 1rem !important;
  transition: border-color 0.2s;
  outline: none;
  height: 3.188rem !important;
}
.f-input:focus, .f-textarea:focus {
  border-color: #76a58f;
}
.f-textarea { min-height: 120px; resize: vertical; }
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
:deep(.multiselect--active:not(.multiselect--above) .multiselect__current), :deep(.multiselect--active:not(.multiselect--above) .multiselect__input), :deep(.multiselect--active:not(.multiselect--above) .multiselect__tags) {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
:deep(.multiselect__input), :deep(.multiselect__single){
  line-height: normal !important;
  min-height:auto !important;
  vertical-align:auto !important;
}
:deep(.multiselect__option--selected) {
  color: var(--btn-bg);
  background: #f3f3f3;
}
</style>
