<template>
  <div class="create-ad-page">
    <div class="container">
      <h1 class="page-title">{{ isEditMode ? 'Редактировать объявление' : 'Создать объявление' }}</h1>
      
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
      <section class="section" :class="{ 'section-disabled': isEditMode }">
        <div v-if="isEditMode" class="edit-mode-banner">
          Режим редактирования. Категорию изменить нельзя.
        </div>
        <h3 class="section-title">Выбор категории
          <span v-if="isEditMode" class="edit-hint">(нельзя изменить)</span>
        </h3>
        <div class="category-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.id" 
            class="category-card" 
            :class="{ active: form.mainCategory === cat.slug, 'card-disabled': isEditMode && form.mainCategory !== cat.slug}" 
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
      <!-- ШАГ 2: Выбор подкатегории -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section v-if="showSubcategoryChoices" class="section fade-in" :class="{ 'section-disabled': isEditMode }">
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
      <!-- ШАГ 2.5: Выбор под-подкатегории -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section 
        v-if="form.subCategory && availableSubLinks.length > 0" 
        class="section fade-in" 
        :class="{ 'section-disabled': isEditMode }"
      >
        <h3 class="section-title">Уточнение категории</h3>
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
              :parent-attributes="form.attributes"
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
          <h3 class="section-title">Описание <span class="required">*</span></h3>
          <div class="form-group">
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
            Фотографии <span class="required">*</span>
            <span class="hint">Не более 10 фото</span>
          </h3>
          <div class="photo-grid">
            <div v-for="(url, index) in photoPreviews" :key="index" class="photo-box">
              <img :src="url" class="preview-img" />
              <button type="button" class="remove-photo" @click="removePhoto(index)">×</button>
            </div>
            <label v-if="photoPreviews.length < 10" class="photo-box upload-btn">
              <input type="file" multiple accept="image/*" @change="handlePhotoUpload" hidden />
              <img src="/src/assets/img/icons/camera.svg" alt="camera" class="camera-foto"/>
            </label>
          </div>
        </section>

        <!-- Карта -->
        <section class="section fade-in">
          <h3 class="section-title">
            {{ locationLabel }} <span class="required">*</span>
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
          <h3 class="section-title">Контакты <span class="required">*</span></h3>
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
            :class="{ 'btn-disabled': !canSubmit }" 
            :disabled="isSubmitting" 
            @click="publishAd"
          >
            {{ isSubmitting ? 'Сохранение...' : isEditMode ? 'Сохранить изменения' : 'Разместить объявление' }}
          </button>
          <p v-if="!canSubmit && v$.$dirty" class="validation-msg">Заполните все поля со звёздочкой *</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import { categories } from "/src/data/categories.js";
import { getAdConfig, getSections } from "/src/data/adCreateConfig.js";
import { api } from "/src/api/api.js";
import { notify } from "/src/utils/notify";
import { uploadToMediaService } from "/src/utils/uploadService.js";
import { useAuthStore } from "/src/stores/authStore.js";
import FormField from '/src/views/FormField.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const isSubmitting = ref(false);
const searchQuery = ref("");
const photos = ref([]);
const photoPreviews = ref([]); 
const isEditMode = computed(() => !!route.params.id);
const advertId = computed(() => route.params.id);

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
  attributes: {},
});

// ═══════════════════════════════════════════════════════════
// РЕВЕРС-МАППИНГИ: API enum → UI значения
// ═══════════════════════════════════════════════════════════

const reverseMapEmployment = (val) => {
  const map = { 'FullTime': 'Полная', 'PartTime': 'Частичная', 'Temporary': 'Временная', 'Internship': 'Стажировка' };
  return map[val] || '';
};

const reverseMapWorkFormat = (val) => {
  const map = { 'Outsource': 'Удалённо', 'Office': 'В офисе или на предприятии', 'Hybride': 'Гибрид' };
  return map[val] || '';
};

const reverseMapTransmission = (val) => {
  const map = { 'Manual': 'Механика', 'Automatic': 'Автомат', 'Robot': 'Робот', 'Variable': 'Вариатор' };
  return map[val] || '';
};

const reverseMapDrive = (val) => {
  const map = { 'Front': 'Передний', 'Rear': 'Задний', 'Full': 'Полный' };
  return map[val] || '';
};

const reverseMapSteering = (val) => {
  const map = { 'Left': 'Левый', 'Right': 'Правый' };
  return map[val] || '';
};

const reverseMapCooling = (val) => {
  const map = { 'Air': 'Воздушное', 'Liquid': 'Жидкостное' };
  return map[val] || '';
};

const reverseMapHouseType = (val) => {
  const map = { 'Brick': 'Кирпичный', 'Panel': 'Панельный', 'Monolith': 'Монолитный' };
  return map[val] || '';
};

const reverseMapHouseState = (val) => {
  const map = { 'EuroRepairs': 'Под ключ', 'NeedRepairs': 'Нужен ремонт', 'RoughFinish': 'Черновая отделка', 'CosmeticRepairs': 'Косметический ремонт' };
  return map[val] || '';
};

const reverseMapPaymentType = (val) => {
  const map = { 'Mortgage': 'Ипотека', 'Full': 'Наличные', 'Trade': 'Мат. капитал' };
  return map[val] || '';
};

const reverseMapGender = (val) => {
  const map = { 'Male': 'Мужской', 'Female': 'Женский' };
  return map[val] || '';
};

const reverseMapTransactionScope = (val) => {
  const map = { 'Meet': 'В аренду', 'Sell': 'Продать', 'FindPartner': 'Найти партнёра' };
  return map[val] || '';
};

const reverseMapBusinessForm = (val) => {
  const map = { 'IE': 'ИП', 'LLC': 'ООО', 'JSC': 'АО', 'Other': 'Другое' };
  return map[val] || '';
};

const reverseMapPriceFor = (val) => {
  const map = { 'Service': 'За услугу', 'Hour': 'За час', 'Day': 'За день' };
  return map[val] || '';
};

// ═══════════════════════════════════════════════════════════
// ЗАГРУЗКА ОБЪЯВЛЕНИЯ ДЛЯ РЕДАКТИРОВАНИЯ
// ═══════════════════════════════════════════════════════════

async function loadAdvertForEdit() {
  if (!isEditMode.value) return;
  
  try {
    const ad = await auth.getAdvertById(advertId.value);
    
    // Заполняем форму
    form.mainCategory = ad.category;
    form.subCategory = ad.subCategory;
    form.subSubCategory = ad.subSubCategory || '';
    form.title = ad.title || '';
    form.description = ad.description || '';
    form.price = ad.price ? String(ad.price) : '';
    form.phone = ad.contacts ? formatPhoneForInput(ad.contacts) : '';
    searchQuery.value = ad.address || '';
    form.address = ad.address || '';
    
    // Инициализируем поля конфига
    initFieldsFromConfig();
    
    // Заполняем атрибуты из API
    fillAttributesFromApi(ad);
    
    // Фото
    if (ad.pictures?.length) {
      photoPreviews.value = ad.pictures.map(p => p.pictureUrl);
      photos.value = new Array(ad.pictures.length).fill(null);
    }
    
    nextTick(() => initMapWithUserCity());
    
  } catch (e) {
    console.error('Ошибка загрузки объявления:', e);
    notify('Не удалось загрузить объявление', 'error');
    router.push('/profile/advertisements');
  }
}

function formatPhoneForInput(contacts) {
  const cleaned = String(contacts).replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return contacts;
}

function fillAttributesFromApi(ad) {
  const attr = {};
  
  // Недвижимость
  if (ad.category === 'nedvizhimost') {
    attr.rooms = ad.rooms;
    attr.area = ad.totalArea;
    attr.floor = ad.apartmentFloor;
    attr.floors = ad.floorsInHouse;
    attr.house_type = reverseMapHouseType(ad.propertyType);
    attr.payment_form = reverseMapPaymentType(ad.paymentType);
    attr.balcony = ad.hasBalcony ? 'Есть' : 'Нет';
    attr.elevator = ad.hasElevator ? 'Есть' : 'Нет';
    attr.parking = ad.hasParking ? 'Есть' : 'Нет';
    attr.status = ad.houseState ? [reverseMapHouseState(ad.houseState)] : [];
    attr.documents = ad.hasDocuments ? ['Собственность'] : [];
    attr.distance_to_metro = ad.stationDistance;
    attr.infrastructure_nearby = ad.cityInfrastructure ? 'Есть' : 'Нет';
    attr.deal_type = reverseMapPaymentType(ad.paymentType);
  }
  
  // Транспорт
  if (ad.category === 'transport') {
    attr.brand = ad.brand;
    attr.model = ad.model;
    attr.year = ad.yearOfManufacture;
    attr.color = ad.color;
    attr.body_type = ad.vehicleBodyType;
    attr.transmission = reverseMapTransmission(ad.vehicleKpp);
    attr.pts_owners = String(ad.ownersPts);
    attr.mileage = ad.milage;
    attr.engine_volume = ad.engineCapacity;
    attr.power = ad.horsePower;
    attr.drive = ad.drive ? [reverseMapDrive(ad.drive)] : [];
    attr.steering = ad.steeringWheel ? [reverseMapSteering(ad.steeringWheel)] : [];
    attr.engine = ad.engineType;
    attr.cooling = ad.cooling ? [reverseMapCooling(ad.cooling)] : [];
    attr.condition = ad.isOnTheGo ? 'На ходу' : 'Не на ходу';
  }
  
  // Работа
  if (ad.category === 'rabota') {
    attr.profession = ad.profession;
    attr.activity_sphere = ad.sphere;
    attr.experience = { value: ad.workExperience, unit: 'лет' };
    attr.experience_required = { value: ad.workExperience, unit: 'лет' };
    attr.employment_type = ad.employment ? [reverseMapEmployment(ad.employment)] : [];
    attr.work_format = ad.workFormat ? [reverseMapWorkFormat(ad.workFormat)] : [];
    attr.advantages = ad.advantages;
    attr.salary = { price: String(ad.price), unit: 'За месяц' };
    attr.desired_position = ad.profession;
  }
  
  // Услуги
  if (ad.category === 'uslugi') {
    attr.price = { price: String(ad.price), unit: reverseMapPriceFor(ad.priceFor) || 'За услугу' };
    attr.service_types = ad.services?.map(s => s.text) || [];
    attr.service_name = ad.title;
    attr.activity = ad.description;
    if (ad.workSchedule?.length) {
      const ws = ad.workSchedule[0];
      const dayMap = {0:'пн.',1:'вт.',2:'ср.',3:'чт.',4:'пт.',5:'сб.',6:'вс.'};
      attr.work_days = [];
      for (let i = ws.fromDay; i <= ws.toDay; i++) {
        attr.work_days.push(dayMap[i]);
      }
      attr.work_time = { from: ws.fromTime, to: ws.toTime };
    }
  }
  
  // Животные
  if (ad.category === 'animals') {
    attr.breed = ad.petBreed;
    attr.nickname = ad.petName;
    attr.color = ad.petColor;
    attr.gender = ad.gender ? [reverseMapGender(ad.gender)] : [];
    attr.age = ad.age;
  }
  
  // Бизнес
  if (ad.category === 'biznes') {
    attr.deal_goal = ad.transactionScope ? [reverseMapTransactionScope(ad.transactionScope)] : [];
    attr.business_status = ad.isProfitable ? ['Прибыль'] : ['Убыток'];
    attr.payback_period = ad.payBackPeriod;
    attr.legal_form = ad.businessForm ? [reverseMapBusinessForm(ad.businessForm)] : [];
  }
  
  // Путешествия
  if (ad.category === 'travel') {
    attr.offer_type = ad.offerType;
    attr.travel_catalog = ad.subCategory;
  }
  
  form.attributes = attr;
}

// ═══════════════════════════════════════════════════════════
// ВЫЧИСЛЯЕМЫЕ
// ═══════════════════════════════════════════════════════════

const currentCategory = computed(() => {
  return categories.find(c => c.slug === form.mainCategory);
});

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

const locationLabel = computed(() => {
  if (form.mainCategory === 'uslugi') return 'Место работы';
  if (form.mainCategory === 'rabota') return 'Место работы';
  return 'Местоположение';
});

// ═══════════════════════════════════════════════════════════
// ВАЛИДАЦИЯ
// ═══════════════════════════════════════════════════════════

const rules = computed(() => {
  const base = {
    title: { required, minLength: minLength(3) },
    description: descriptionInConfig.value ? {} : { required },
    address: { required },
    phone: { required, minLength: minLength(18) }
  };
  
  // Для работы цена НЕ обязательна (зарплата в attributes)
  if (form.mainCategory !== 'rabota') {
    base.price = { 
      required,
      numeric: (value) => {
        if (!value) return false;
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
    };
  }
  
  return base;
});

const v$ = useVuelidate(rules, form);

// ═══════════════════════════════════════════════════════════
// ПРОВЕРКА ВОЗМОЖНОСТИ ОТПРАВКИ
// ═══════════════════════════════════════════════════════════

const canSubmit = computed(() => {
  // Базовые поля
  if (!form.title || form.title.length < 3) return false;
  if (!form.address) return false;
  if (!form.phone || form.phone.length < 18) return false;
  if (!descriptionInConfig.value && !form.description) return false;
  
  // Для работы цена НЕ обязательна (зарплата в attributes)
  if (form.mainCategory !== 'rabota') {
    if (!form.price || Number(form.price) <= 0) return false;
  }
  
  // Фото обязательны (хотя бы одна)
  // if (photoPreviews.value.length === 0) return false;

  // Динамические поля из конфига
  const config = currentConfig.value;
  if (config?.sections) {
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (field.required && field.key !== 'title' && field.key !== 'price' && field.key !== 'description') {
          const value = form.attributes[field.key];
          
          if (Array.isArray(value)) {
            if (value.length === 0) return false;
          }
          else if (typeof value === 'object' && value !== null) {
            if ('price' in value && (value.price === '' || value.price === null || value.price === undefined)) {
              return false;
            }
            if ('value' in value && (value.value === '' || value.value === null || value.value === undefined)) {
              return false;
            }
            if ('from' in value && 'to' in value) {
              if (!value.from || !value.to) return false;
            }
          }
          else if (value === '' || value === null || value === undefined) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
});

// ═══════════════════════════════════════════════════════════
// ХЛЕБНЫЕ КРОШКИ
// ═══════════════════════════════════════════════════════════

const breadcrumbs = computed(() => {
  const crumbs = [
    { name: 'Главная', path: '/' }, 
    { name: isEditMode.value ? 'Редактировать объявление' : 'Создать объявление' }
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
// УСЛОВИЯ ОТОБРАЖЕНИЯ
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

function setFieldValue(key, value) {
  form.attributes[key] = value;
  
  const field = findFieldByKey(key);
  if (field?.bindToTitle) {
    form.title = value;
  }
  
  // Синхронизация price/salary с form.price для валидации
  if (key === 'price' || key === 'salary') {
    let rawPrice = '';
    
    if (typeof value === 'object' && value !== null && 'price' in value) {
      rawPrice = value.price;
    }
    else if (typeof value === 'string' || typeof value === 'number') {
      rawPrice = value;
    }
    
    form.price = rawPrice ? String(rawPrice) : '';
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
  if (isEditMode.value) {
    notify('Категорию нельзя изменить при редактировании', 'warning');
    return;
  }
  form.mainCategory = cat.slug;
  form.subCategory = '';
  form.subSubCategory = '';
  form.title = '';
  form.description = '';
  form.price = '';
  searchQuery.value = '';
  form.phone = '';
  form.attributes = {};
  
  v$.value?.$reset();
  
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
  if (isEditMode.value) {
    notify('Подкатегорию нельзя изменить при редактировании', 'warning');
    return;
  }
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
  if (isEditMode.value) {
    notify('Подкатегорию нельзя изменить при редактировании', 'warning');
    return;
  }
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
  if (photoPreviews.value.length + files.length > 10) {
    notify("Максимум 10 фотографий", "error");
    return;
  }
  files.forEach(file => {
    photos.value.push(file);
    photoPreviews.value.push(URL.createObjectURL(file));
  });
};

const removePhoto = (index) => {
  if (photos.value[index] instanceof File) {
    URL.revokeObjectURL(photoPreviews.value[index]);
  }
  photos.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

// ═══════════════════════════════════════════════════════════
// КАРТА
// ═══════════════════════════════════════════════════════════

const isClient = typeof window !== 'undefined';
let map = null;
let placemark = null;
let searchTimeout = null;

function destroyMap() {
  if (!isClient) return;
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
  if (!isClient || !window.ymaps) {
    console.warn('Yandex Maps API не загружен или SSR');
    return;
  }
  destroyMap();
  const container = document.getElementById('map-container-ad');
  if (!container) {
    console.warn('Контейнер карты не найден в DOM');
    return;
  }
  container.innerHTML = '';
  
  window.ymaps.ready(() => {
    try {
      map = new window.ymaps.Map("map-container-ad", { 
        center: coords, 
        zoom: 14, 
        controls: ['zoomControl'] 
      });
      
      placemark = new window.ymaps.Placemark(coords, {}, { 
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
  if (!isClient || !window.ymaps) return;
  try {
    const res = await window.ymaps.geocode(coords);
    const firstGeoObject = res.geoObjects.get(0);
    if (firstGeoObject) {
      let address = firstGeoObject.getAddressLine();
      if (address && address.length > 0) {
        address = address[0].toUpperCase() + address.slice(1);
      }
      searchQuery.value = address;
    }
  } catch (e) {
    console.error('Обратное геокодирование не удалось:', e);
  }
}

async function initMapWithUserCity() {
  if (!isClient || !window.ymaps) return;
  
  let coords = [55.7558, 37.6173];
  
  if (searchQuery.value && searchQuery.value.length >= 3) {
    try {
      const res = await window.ymaps.geocode(searchQuery.value, { results: 1 });
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        coords = firstGeoObject.geometry.getCoordinates();
        form.coordinates = coords;
      }
    } catch (e) {
      console.error('Геокодирование не удалось:', e);
    }
  }
  
  nextTick(() => {
    setTimeout(() => initMap(coords), 150);
  });
}

watch(searchQuery, (query) => {
  if (!isClient) return;
  
  form.address = query;
  if (query && query.length > 0 && query[0] !== query[0].toUpperCase()) {
    searchQuery.value = query[0].toUpperCase() + query.slice(1);
    return;
  }
  
  clearTimeout(searchTimeout);
  if (!searchQuery.value || searchQuery.value.length < 3) return;
  
  searchTimeout = setTimeout(async () => {
    if (!window.ymaps) return;
    try {
      const res = await window.ymaps.geocode(searchQuery.value, { results: 1 });
      const obj = res.geoObjects.get(0);
      if (obj) {
        const coords = obj.geometry.getCoordinates();
        form.coordinates = coords;
        if (map && placemark) {
          map.setCenter(coords, 14);
          placemark.geometry.setCoordinates(coords);
        } else {
          initMap(coords);
        }
      }
    } catch (e) {
      console.error('Поиск адреса не удалось:', e);
    }
  }, 600);
}, { immediate: true });

// ═══════════════════════════════════════════════════════════
// МАППИНГИ: UI → API enum
// ═══════════════════════════════════════════════════════════

function mapEmployment(val) {
  const map = {
    'Полная': 'FullTime',
    'Полная занятость': 'FullTime',
    'Частичная': 'PartTime',
    'Частичная занятость': 'PartTime',
    'Временная': 'Temporary',
    'Стажировка': 'Internship',
  };
  return map[val] || 'FullTime';
}

function mapWorkFormat(val) {
  const map = {
    'Удалённо': 'Outsource',
    'Удалённая работа': 'Outsource',
    'В офисе или на предприятии': 'Office',
    'Работа в офисе': 'Office',
    'Гибрид': 'Hybride',
    'Гибкий': 'Hybride'
  };
  return map[val] || 'Office';
}

function mapTransmission(val) {
  const map = { 'Механика': 'Manual', 'Автомат': 'Automatic', 'Робот': 'Robot', 'Вариатор': 'Variable' };
  return map[val] || '';
}

function mapDrive(val) {
  const map = { 'Передний': 'Front', 'Задний': 'Rear', 'Полный': 'Full' };
  return map[val] || '';
}

function mapSteering(val) {
  const map = { 'Левый': 'Left', 'Правый': 'Right' };
  return map[val] || '';
}

function mapCooling(val) {
  const map = { 'Воздушное': 'Air', 'Жидкостное': 'Liquid' };
  return map[val] || '';
}

function mapHouseType(val) {
  const map = { 'Кирпичный': 'Brick', 'Панельный': 'Panel', 'Монолитный': 'Monolith' };
  return map[val] || '';
}

function mapHouseState(val) {
  const map = { 
    'Под ключ': 'EuroRepairs', 
    'Нужен ремонт': 'NeedRepairs', 
    'Черновая отделка': 'RoughFinish', 
    'Косметический ремонт': 'CosmeticRepairs' 
  };
  return map[val] || '';
}

function mapPriceFor(val) {
  const map = { 'За услугу': 'Service', 'За час': 'Hour', 'За день': 'Day', 'По договоренности': 'Service' };
  return map[val] || 'Service';
}

function mapPaymentType(val) {
  const map = { 'Ипотека': 'Mortgage', 'Наличные': 'Full', 'Мат. капитал': 'Trade', 'Безналичные': 'Full' };
  return map[val] || 'Full';
}

function mapGender(val) {
  const map = { 'Мужской': 'Male', 'Женский': 'Female' };
  return map[val] || '';
}

function mapBusinessForm(val) {
  const map = { 'ИП': 'IE', 'ООО': 'LLC', 'АО': 'JSC', 'Другое': 'Other' };
  return map[val] || '';
}

function mapTransactionScope(val) {
  const map = { 'В аренду': 'Meet', 'Продать': 'Sell', 'Найти партнёра': 'FindPartner' };
  return map[val] || '';
}

// ═══════════════════════════════════════════════════════════
// Сборка workSchedule
// ═══════════════════════════════════════════════════════════

function buildWorkSchedule(days, timeRange) {
  if (!days || days.length === 0) return [];
  if (!timeRange) return [];
  
  const dayMap = { 'пн.': 0, 'вт.': 1, 'ср.': 2, 'чт.': 3, 'пт.': 4, 'сб.': 5, 'вс.': 6 };
  
  const sorted = days.map(d => dayMap[d]).filter(n => n !== undefined).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  
  return [{
    fromDay: sorted[0],
    toDay: sorted[sorted.length - 1],
    fromTime: timeRange.from || '08:00',
    toTime: timeRange.to || '20:00',
    is24h: false
  }];
}

// ═══════════════════════════════════════════════════════════
// ПУБЛИКАЦИЯ
// ═══════════════════════════════════════════════════════════

const publishAd = async () => {
  await v$.value.$validate();
  
  if (!canSubmit.value) {
    notify("Заполните все обязательные поля", "error");
    return;
  }
  isSubmitting.value = true;
  try {
    // 1. Загрузка новых фото
    const uploadedUrls = [];
    for (const file of photos.value) {
      if (file instanceof File) {
        const media = await uploadToMediaService(file, "image", { title: "ad_photo" });
        if (media?.cdnUrl || media?.url) {
          uploadedUrls.push({ pictureUrl: media.cdnUrl || media.url });
        }
      }
    }

    // Старые фото (URL) — уже загруженные
    for (let i = 0; i < photoPreviews.value.length; i++) {
      const url = photoPreviews.value[i];
      if (typeof url === 'string' && url.startsWith('http') && !(photos.value[i] instanceof File)) {
        uploadedUrls.push({ pictureUrl: url });
      }
    }

    const attr = form.attributes;
    
    // ═══════════════════════════════════════════════════════════
    // ФОРМИРОВАНИЕ PAYLOAD ПО СХЕМЕ API
    // ═══════════════════════════════════════════════════════════
    
    const payload = {
      // Обязательные общие поля
      category: form.mainCategory,
      title: form.title,
      price: String(form.price || 0),
      description: form.description,
      address: form.address,
      contacts: form.phone.replace(/\D/g, ''),
      pictures: uploadedUrls,
      
      // Подкатегория
      subCategory: form.subSubCategory || form.subCategory || '',
      
      // ═══ РАБОТА (resume / jobs) ═══
      firstName: attr.first_name || '',
      lastName: attr.last_name || '',
      fathersName: attr.middle_name || '',
      gender: mapGender(attr.gender?.[0]) || '',
      profession: attr.profession || attr.desired_position || '',
      sphere: attr.activity_sphere || '',
      workExperience: attr.experience?.value ? Number(attr.experience.value) : (attr.experience_required?.value ? Number(attr.experience_required.value) : 0),
      advantages: attr.advantages || '',
      employment: mapEmployment(attr.employment_type?.[0]),
      workFormat: mapWorkFormat(attr.work_format?.[0]),
      
      // ═══ ТРАНСПОРТ ═══
      brand: attr.brand || '',
      model: attr.model || '',
      yearOfManufacture: attr.year ? Number(attr.year) : 0,
      color: attr.color || '',
      isOnTheGo: attr.condition?.includes('На ходу') || false,
      vehicleBodyType: attr.body_type || '',
      vehicleKpp: mapTransmission(attr.transmission) || '',
      ownersPts: attr.pts_owners ? Number(attr.pts_owners) : 0,
      milage: attr.mileage ? Number(attr.mileage) : 0,
      engineCapacity: attr.engine_volume ? Number(attr.engine_volume) : 0,
      horsePower: attr.power ? Number(attr.power) : 0,
      drive: mapDrive(attr.drive?.[0]) || '',
      steeringWheel: mapSteering(attr.steering?.[0]) || '',
      engineType: attr.engine || '',
      cooling: mapCooling(attr.cooling?.[0]) || '',
      
      // ═══ ВОДНЫЙ ТРАНСПОРТ ═══
      vesselType: attr.vessel_type || '',
      vesselLength: attr.length ? Number(attr.length) : 0,
      vesselWidth: attr.width ? Number(attr.width) : 0,
      vesselDraft: attr.draft ? Number(attr.draft) : 0,
      maxPassengers: attr.max_passengers ? Number(attr.max_passengers) : 0,
      vesselBodyMaterial: attr.hull_material || '',
      
      // ═══ УСЛУГИ ═══
      priceFor: mapPriceFor(attr.price?.unit) || 'Service',
      services: (attr.service_types || []).filter(s => s).map(text => ({ text })),
      workSchedule: buildWorkSchedule(attr.work_days, attr.work_time),
      
      // ═══ НЕДВИЖИМОСТЬ ═══
      propertyType: mapHouseType(attr.house_type) || '',
      totalArea: attr.area ? Number(attr.area) : 0,
      livingArea: attr.house_area?.value ? Number(attr.house_area.value) : (attr.house_area ? Number(attr.house_area) : 0),
      kitchenArea: 0,
      apartmentFloor: attr.floor ? Number(attr.floor) : 0,
      floorsInHouse: attr.floors ? Number(attr.floors) : 0,
      houseState: mapHouseState(attr.status?.[0]) || '',
      hasBalcony: attr.balcony?.includes('Есть') || false,
      balconyAmount: 0,
      hasElevator: attr.elevator?.includes('Есть') || false,
      hasParking: attr.parking?.includes('Есть') || attr.parking?.includes('Места на улице') || false,
      stationDistance: attr.distance_to_metro ? Number(attr.distance_to_metro) : 0,
      cityInfrastructure: attr.infrastructure_nearby?.includes('Есть') || false,
      cityInfrastructureDistance: 0,
      hasSecurity: attr.documents?.includes('Собственность') || false,
      hasVideoSecurity: attr.infrastructure?.includes('Видеонаблюдение') || false,
      hasChildrenPlayground: attr.infrastructure?.includes('Детская площадка') || false,
      hasSportPlayground: attr.infrastructure?.includes('Спортивная площадка') || false,
      paymentType: mapPaymentType(attr.deal_type?.[0]) || 'Full',
      hasDocuments: attr.documents?.length > 0 || false,
      
      // ═══ ЖИВОТНЫЕ ═══
      petBreed: attr.breed || '',
      petName: attr.nickname || '',
      petColor: attr.color || '',
      
      // ═══ БИЗНЕС ═══
      transactionScope: mapTransactionScope(attr.deal_goal?.[0]) || '',
      isProfitable: attr.business_status?.includes('Прибыль') || false,
      businessForm: mapBusinessForm(attr.legal_form?.[0]) || '',
      payBackPeriod: attr.payback_period || '',
      
      // ═══ ПУТЕШЕСТВИЯ ═══
      offerType: attr.offer_type || '',
    };

    // Удаляем пустые/нулевые поля (кроме обязательных)
    const requiredFields = ['category', 'title', 'price', 'description', 'address', 'contacts', 'pictures'];
    Object.keys(payload).forEach(key => {
      if (requiredFields.includes(key)) return;
      
      const val = payload[key];
      if (val === undefined || val === null || val === '') {
        delete payload[key];
      }
      if (Array.isArray(val) && val.length === 0) {
        delete payload[key];
      }
      if (typeof val === 'number' && val === 0 && !['price'].includes(key)) {
        delete payload[key];
      }
    });

    // 3. Отправка
    if (isEditMode.value) {
      payload.id = advertId.value;
      await auth.updateAdvert(payload);
      notify('Объявление обновлено!', 'success');
    } else {
      await auth.createAdvert(payload);
      notify('Объявление опубликовано!', 'success');
    }
    
    router.push('/profile/advertisements');
    
  } catch (e) {
    console.error('Ошибка публикации:', e);
    notify('Не удалось сохранить объявление', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// ═══════════════════════════════════════════════════════════
// MOUNTED
// ═══════════════════════════════════════════════════════════

onMounted(() => {
  if (isEditMode.value) {
    loadAdvertForEdit();
  }
});

onBeforeUnmount(() => {
  destroyMap();
  clearTimeout(searchTimeout);
});
</script>
<style scoped>
.profile-main .container{
  width: 100%;
  margin: 0;
}
.create-ad-page { padding-bottom: 2.857rem; background: #FFFFFF; padding: 0.938rem 2.188rem 2.938rem 2.188rem;
margin-top: 2.438rem; border-radius: 1.875rem;}

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
  font-size: 0.75rem; 
  margin-top: 0.5rem; 
  text-align: center; 
}
.hint { 
  font-size: 0.853rem; 
  color: #bbb; 
  font-weight: normal; 
  margin-left: 0.5rem; 
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
.section-disabled { opacity: 0.6; pointer-events: none; user-select: none;}
.section-disabled .edit-hint { color: #999; font-size: 12px; font-weight: normal; margin-left: 8px;}
.card-disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(100%);}
/* Активная карточка в режиме редактирования — подсвечиваем */
.section-disabled .category-card.active { opacity: 1;filter: none;box-shadow: 0 0 0 2px #4CAF50;}
</style>
