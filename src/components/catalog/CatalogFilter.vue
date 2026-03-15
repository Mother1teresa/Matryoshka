<script setup>
import { ref, watch, computed } from 'vue'; 
import { useRouter, useRoute } from 'vue-router';
import { categories } from "/src/data/categories.js";
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

const props = defineProps({ type: String });
const router = useRouter();
const route = useRoute();

const isExpanded = ref(false);
const dealType = ref(route.query.dealType || 'buy');

// 1. ПОЛУЧЕНИЕ ДАННЫХ КАТЕГОРИЙ
const typeParam = computed(() => route.params.type);
const sectionParam = computed(() => route.params.section); 

const currentCategoryData = computed(() => 
  categories.find(c => c.slug === typeParam.value)
);

const currentSubLinks = computed(() => {
  if (!currentCategoryData.value) return [];
  const section = currentCategoryData.value.sections.find(s => s.slug === sectionParam.value);
  if (section) {
    if (!section.title || section.title.trim() === "") {
      const activeLink = section.links?.find(l => l.slug === sectionParam.value);
      return activeLink?.subLinks || [];
    }
    return section.links || [];
  }
  return [];
});

// 2. ОПЦИИ
const experienceOptions = [
  { name: 'Без опыта', value: 'no' },
  { name: '1–3 года', value: '1-3' },
  { name: '3–5 лет', value: '3-5' },
  { name: 'Более 5 лет', value: '5+' }
];
const dealGoalOptions = ['Покупка', 'Партнерство', 'Инвестиции'];
const businessStatusOptions = ['Действующий', 'Стартап', 'На паузе'];
const paybackOptions = ['До 6 месяцев', '6-12 месяцев', '1-2 года', 'Более 2 лет'];
const ageOptions = ['До 1 года', '1-3 года', '3-5 лет', 'Более 5 лет'];
const legalOptions = ['ИП', 'ООО', 'АО', 'Самозанятость'];

// 3. ФОРМА (ДАННЫЕ ДЛЯ API)
const form = ref({
  priceFrom: route.query.priceFrom || '',
  priceTo: route.query.priceTo || '',
  subcategory: route.query.subcategory || '', 
  experience: route.query.experience || '',
  realtyType: route.query.realtyType || '',
  brand: route.query.brand || '',
  employment: route.query.employment || '',
  schedule: route.query.schedule || '',
  rooms: route.query.rooms || '',
  infra: route.query.infra ? (Array.isArray(route.query.infra) ? route.query.infra : [route.query.infra]) : [],
  docs: route.query.docs ? (Array.isArray(route.query.docs) ? route.query.docs : [route.query.docs]) : [],
  // БИЗНЕС
  dealGoal: route.query.dealGoal || '',
  businessStatus: route.query.businessStatus || '',
  payback: route.query.payback || '',
  businessAge: route.query.businessAge || '',
  legalForm: route.query.legalForm || '',

  // ЖИВОТНЫЕ
  gender: route.query.gender || '',
  color: route.query.color || '', // И для животных, и для машин
  age: route.query.age || '',
  animalKind: route.query.animalKind || '',
  feedType: route.query.feedType || '',

  // ТРАНСПОРТ (АВТОМОБИЛИ)
  model: route.query.model || '',
  yearFrom: route.query.yearFrom || '',
  yearTo: route.query.yearTo || '',
  bodyType: route.query.bodyType || '',
  transmission: route.query.transmission || '',
  engine: route.query.engine || '',
  mileageFrom: route.query.mileageFrom || '',
  mileageTo: route.query.mileageTo || '',
  // НОВЫЕ ПОЛЯ ИЗ РАСКРЫВАШКИ ТРАНСПОРТА
  owners: route.query.owners || 'Не важно',
  condition: route.query.condition || 'Все',
  drive: route.query.drive || '',
  powerFrom: route.query.powerFrom || '',
  powerTo: route.query.powerTo || '',
  engineVolFrom: route.query.engineVolFrom || '',
  engineVolTo: route.query.engineVolTo || '',
  steering: route.query.steering || 'Не важно',
  
  country: route.query.country || '',      // Страна производитель
  motoType: route.query.motoType || '',    // Тип техники
  condition: route.query.condition || '',

  lengthFrom: '', lengthTo: '',
  widthFrom: '', widthTo: '',
  draftFrom: '', draftTo: '',
  passengersFrom: '', passengersTo: '',
  hullMaterial: '',
});
// 4. СВЯЗКА MULTISELECT (Объекты) + FORM (Строки slug/value)
const selectedSubcategory = computed({
  get: () => {
    const currentSlug = route.params.subcategory || form.value.subcategory;
    return currentSubLinks.value.find(opt => opt.slug === currentSlug) || null;
  },
  set: (val) => {
    form.value.subcategory = val ? val.slug : '';
  }
});

const selectedExperience = computed({
  get: () => experienceOptions.find(opt => opt.value === form.value.experience) || null,
  set: (val) => { form.value.experience = val ? val.value : ''; }
});
const selectedRealty = computed({
  get: () => [{name: 'Квартира', value: 'flat'}].find(opt => opt.value === form.value.realtyType) || null,
  set: (val) => { form.value.realtyType = val ? val.value : ''; }
});

// 5. ФИЛЬТРАЦИЯ
watch(dealType, () => applyFilters());
watch(form, () => applyFilters(), { deep: true });

function applyFilters() {
  const filters = { ...form.value };
  const sub = filters.subcategory; 
  delete filters.subcategory; 
  const subParam = (sub === route.params.section) ? undefined : (sub || undefined);

  const cleanQuery = Object.fromEntries(
    Object.entries({ 
      ...route.query, 
      dealType: props.type === 'realty' ? dealType.value : undefined, 
      ...filters 
    }).filter(([key, v]) => 
      v !== '' && v !== null && v !== undefined && key !== 'subcategory'
    )
  );
  router.push({
    name: 'catalog',
    params: { 
      ...route.params, 
      subcategory: subParam
    },
    query: cleanQuery
  });
}

const toggleTag = (field, value) => {
  const index = form.value[field].indexOf(value);
  if (index > -1) {
    form.value[field].splice(index, 1);
  } else {
    form.value[field].push(value); 
  }
};
const subcategory = computed(() => route.params.subcategory);
watch(
  () => route.params.subcategory,
  (newSub) => {
    if (newSub) {
      form.value.subcategory = newSub;
    }
  },
  { immediate: true }
);
watch(
  () => route.params.section,
  () => {
    if (!route.params.subcategory) {
      form.value.subcategory = '';
    }
  }
);
const resetForm = () => {
  Object.keys(form.value).forEach(key => {
    if (Array.isArray(form.value[key])) {
      form.value[key] = [];
    } else {
      form.value[key] = '';
    }
  });
};
watch(sectionParam, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    let targetSub = route.params.subcategory;
    if (newVal === 'water' && !targetSub) {
      targetSub = 'yachts';
    }
    resetForm();  
    if (targetSub) {
      form.value.subcategory = targetSub;
    }
    router.replace({
      name: 'catalog',
      params: { 
        ...route.params, 
        section: newVal,
        subcategory: targetSub || undefined 
      },
      query: {} 
    });
  }
});
</script>

<template>
  <div class="filter-wrapper">
    <div v-if="type === 'realty'" class="deal-selector">
      <button class="deal-btn" :class="{ active: dealType === 'buy' }" @click="dealType = 'buy'">Купить</button>
      <button class="deal-btn" :class="{ active: dealType === 'rent' }" @click="dealType = 'rent'">Снять</button>
    </div>
    <div class="filter-card">
      <div class="filter-header">
        <span class="filter-title">Параметры поиска</span>
        <div class="filter-main-row">
          <!-- ТОВАРЫ / ТРАВЕЛ -->
          <template v-if="['price', 'travel'].includes(type)">
            <div class="extra-row">
              <div class="multiselect-container" v-if="currentSubLinks.length">
                <multiselect v-model="selectedSubcategory" :options="currentSubLinks" label="name" track-by="slug" open-direction="bottom"  :placeholder="type === 'animals' ? 'Выберите категорию' : 'Выберите подкатегорию'" :searchable="false" :show-labels="false" :allow-empty="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <input v-model="form.priceFrom" type="number" placeholder="Цена: от" class="f-input" min="1"/>
              <input v-model="form.priceTo" type="number" placeholder="Цена: до" class="f-input" v-if="type === 'price'" min="1"/>
            </div>
          </template>
          <!-- РАБОТА -->
          <template v-if="type === 'jobs'">
            <div class="extra-row">
              <div class="multiselect-container">
                <multiselect v-model="selectedSubcategory" :options="currentSubLinks" label="name" open-direction="bottom" track-by="slug" placeholder="Сфера деятельности" :searchable="false" :show-labels="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <div class="multiselect-container">
                <multiselect v-model="form.profession" :options="[]" placeholder="Профессия" open-direction="bottom" :searchable="false" :show-labels="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <div class="multiselect-container">
                <multiselect v-model="selectedExperience" :options="experienceOptions" open-direction="bottom" label="name" track-by="value" placeholder="Опыт работы" :searchable="false" :show-labels="false" :allow-empty="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
            </div>
            <button class="expand-btn" @click="isExpanded = !isExpanded">
              <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
            </button>
          </template>
          <!-- УСЛУГИ -->
          <template v-if="type === 'uslugi'">
            <div class="extra-row">
              <div class="multiselect-container">
                <multiselect v-model="selectedSubcategory" :options="currentSubLinks" open-direction="bottom" label="name" track-by="slug" placeholder="Выберите подкатегорию" :searchable="false" :show-labels="false" :allow-empty="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <div class="multiselect-container">
                <multiselect v-model="selectedExperience" :options="experienceOptions" open-direction="bottom" label="name" track-by="value" placeholder="Опыт работы" :searchable="false" :show-labels="false" :allow-empty="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <input v-model="form.priceFrom" type="number" placeholder="Цена: от" class="f-input" min="1"/>
              <input v-model="form.priceTo" type="number" placeholder="Цена: до" class="f-input" min="1"/>
            </div>
          </template>
          <!-- Недвижимость -->
          <template v-if="type === 'realty'">
              <!-- Всегда видимые поля -->
               <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="selectedSubcategory" :options="currentSubLinks" open-direction="bottom" label="name" track-by="slug" placeholder="Тип недвижимости" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>

                <div class="multiselect-container">
                  <multiselect v-model="form.rooms" :options="['Студия', '1', '2', '3', '4+']" open-direction="bottom" placeholder="Количество комнат" :searchable="false" :show-labels="false" :multiple="true">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>

                <input v-model="form.priceFrom" type="number" :placeholder="dealType === 'rent' ? 'Аренда от' : 'Цена от'" class="f-input" min="1"/>
                <input v-model="form.priceTo" type="number" :placeholder="dealType === 'rent' ? 'Аренда до' : 'Цена до'" class="f-input" min="1"/>

                <div class="multiselect-container">
                  <multiselect v-model="form.paymentForm" :options="['Ипотека', 'Наличные', 'Мат. капитал']" open-direction="bottom" placeholder="Форма оплаты" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
              <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="form.balcony" :options="['Есть', 'Нет']" placeholder="Балкон/Лоджия" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <input v-model="form.areaFrom" type="number" placeholder="Площадь от" class="f-input" min="1"/>
                <input v-model="form.areaTo" type="number" placeholder="Площадь до" class="f-input" min="1"/>
                <div class="multiselect-container">
                  <multiselect v-model="form.houseType" :options="['Кирпичный', 'Панельный', 'Монолитный', 'Блочный']" open-direction="bottom" placeholder="Тип дома" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
              <button class="expand-btn" @click="isExpanded = !isExpanded">
                <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
              </button>
          </template>
          <!-- ТРАНСПОРТ -->
          <template v-if="type === 'transport'">
              <div v-if="sectionParam === 'cars'" class="transport-layout">
                <div class="extra-row mb-1">
                  <div class="multiselect-container" style="width: 15.5rem;">
                    <multiselect v-model="form.brand" :options="['Toyota', 'BMW', 'Lada']" placeholder="Марка" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 15rem;">
                    <multiselect v-model="form.model" :options="[]" placeholder="Модель" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" />
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" />
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.yearFrom" type="number" placeholder="Год выпуска : от" class="f-input" />
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.yearTo" type="number" placeholder="Год выпуска : до" class="f-input" />
                  </div>
                </div>
                <div class="extra-row">
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.bodyType" :options="['Седан', 'Внедорожник']" placeholder="Кузов" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 10rem;">
                    <multiselect v-model="form.transmission" :options="['АКПП', 'МКПП']" placeholder="КПП" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.engine" :options="['Бензин', 'Дизель']" placeholder="Двигатель" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.mileageFrom" type="number" placeholder="Пробег : от" class="f-input" />
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.mileageTo" type="number" placeholder="Пробег : до" class="f-input" />
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.color" :options="['Белый', 'Черный', 'Красный', 'Серебристый', 'Синий']" placeholder="Цвет" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                </div>
                <button class="expand-btn" @click="isExpanded = !isExpanded">
                  <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
                </button>
              </div>
              <div v-if="sectionParam === 'moto'" class="moto-layout">
                <!-- Первый ряд (6 полей) -->
                <div class="extra-row mb-1">
                  <div class="multiselect-container" style="width: 14.5rem;">
                    <multiselect v-model="form.country" :options="['Япония', 'Германия', 'США', 'Китай']" placeholder="Страна производитель" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.motoType" :options="['Спортивный', 'Дорожный', 'Чоппер', 'Эндуро']" placeholder="Тип техники" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.brand" :options="['Honda', 'Yamaha', 'BMW', 'Kawasaki']" placeholder="Марка" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.model" :options="[]" placeholder="Модель" open-direction="bottom" :searchable="false" :show-labels="false">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.priceFrom" type="number" placeholder="Цена: от" class="f-input" />
                  </div>
                  <div class="input-with-arrow">
                    <input v-model="form.priceTo" type="number" placeholder="Цена: до" class="f-input" />
                  </div>
                </div>
                <!-- Второй ряд (4 поля + кнопка) -->
                <div class="extra-row">
                  <div class="extra-row">
                    <div class="input-with-arrow">
                      <input v-model="form.yearFrom" type="number" placeholder="Год выпуска: от" class="f-input" />
                    </div>
                    <div class="input-with-arrow">
                      <input v-model="form.yearTo" type="number" placeholder="Год выпуска: до" class="f-input" />
                    </div>
                    <div class="input-with-arrow">
                      <input v-model="form.mileageFrom" type="number" placeholder="Пробег: от" class="f-input" />
                    </div>
                    <div class="input-with-arrow">
                      <input v-model="form.mileageTo" type="number" placeholder="Пробег: до" class="f-input" />
                    </div>
                    <div class="multiselect-container">
                      <multiselect v-model="form.condition" :options="['Новое', 'Б/У']" placeholder="Состояние" open-direction="bottom" :searchable="false" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                  </div>
                </div>
                <button class="expand-btn" @click="isExpanded = !isExpanded">
                  <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
                </button>
              </div>
              <div v-if="sectionParam === 'trucks'" class="trucks-layout">
                <!-- Первый ряд (6 полей) -->
                <div class="extra-row mb-1">
                  <div class="multiselect-container" style="width: 14.5rem;">
                    <multiselect v-model="form.country" :options="['Россия', 'Китай', 'Германия']" placeholder="Страна производитель" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.specialType" :options="['Грузовик', 'Экскаватор', 'Погрузчик']" placeholder="Тип техники" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.brand" :options="['KAMAZ', 'MAN', 'Volvo']" placeholder="Марка" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                  <div class="multiselect-container" style="width: 13rem;">
                    <multiselect v-model="form.model" :options="[]" placeholder="Модель" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                  <div class="input-with-arrow"><input v-model="form.priceFrom" type="number" placeholder="Цена: от" class="f-input" /></div>
                  <div class="input-with-arrow"><input v-model="form.priceTo" type="number" placeholder="Цена: до" class="f-input" /></div>
                </div>
                <div class="extra-row">
                  <div class="input-with-arrow"><input v-model="form.yearFrom" type="number" placeholder="Год выпуска: от" class="f-input" /></div>
                  <div class="input-with-arrow"><input v-model="form.yearTo" type="number" placeholder="Год выпуска: до" class="f-input" /></div>
                  <div class="input-with-arrow"><input v-model="form.mileageFrom" type="number" placeholder="Пробег: от" class="f-input" /></div>
                  <div class="input-with-arrow"><input v-model="form.mileageTo" type="number" placeholder="Пробег: до" class="f-input" /></div>
                  <div class="multiselect-container">
                    <multiselect v-model="form.conditionMain" :options="['Новое', 'Б/У']" placeholder="Состояние" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                </div>
                <button class="expand-btn" @click="isExpanded = !isExpanded">
                  <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
                </button>
              </div>
              <!-- ТРАНСПОРТ: ВОДНЫЙ -->
              <div v-if="sectionParam === 'water'"> 
                <div v-if="subcategory === 'yachts'" class="water-layout">
                  <div class="extra-row mb-1">
                    <div class="multiselect-container" style="width: 18.5rem;">
                      <multiselect v-model="form.country" :options="['Россия', 'США', 'Италия']" placeholder="Страна производитель" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="multiselect-container" style="width: 18.5rem;">
                      <multiselect v-model="form.brand" :options="['Yamaha', 'Sea Ray', 'Azimut']" placeholder="Марка" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="input-with-arrow"><input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" /></div>
                    <div class="input-with-arrow"><input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" /></div>
                  </div>
                  <div class="extra-row">
                    <div class="input-with-arrow"><input v-model="form.yearFrom" type="number" placeholder="Год выпуска : от" class="f-input" /></div>
                    <div class="input-with-arrow"><input v-model="form.yearTo" type="number" placeholder="Год выпуска : до" class="f-input" /></div>
                    <div class="multiselect-container">
                      <multiselect v-model="form.condition" :options="['Новое', 'Б/У']" placeholder="Состояние" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                  </div>
                  <button class="expand-btn" @click="isExpanded = !isExpanded">
                    <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
                  </button>
                </div>

                <!-- КЕЙС: ГИДРОЦИКЛЫ (subcategory === 'jetski') -->
                <div v-if="subcategory === 'jetski'" class="jetski-layout">
                  <div class="extra-row mb-1">
                    <div class="multiselect-container">
                      <multiselect v-model="form.country" :options="['Япония', 'США', 'Канада']" placeholder="Страна производитель" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="multiselect-container">
                      <multiselect v-model="form.brand" :options="['Yamaha', 'Sea-Doo', 'Kawasaki']" placeholder="Марка" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="multiselect-container">
                      <multiselect v-model="form.model" :options="[]" placeholder="Модель" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="input-with-arrow"><input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" /></div>
                    <div class="input-with-arrow"><input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" /></div>
                  </div>
                  <div class="extra-row">
                    <div class="input-with-arrow"><input v-model="form.yearFrom" type="number" placeholder="Год выпуска : от" class="f-input" /></div>
                    <div class="input-with-arrow"><input v-model="form.yearTo" type="number" placeholder="Год выпуска : до" class="f-input" /></div>
                    <div class="multiselect-container">
                      <multiselect v-model="form.condition" :options="['Новое', 'Б/У']" placeholder="Состояние" open-direction="bottom" :show-labels="false">
                        <template #caret><div class="multiselect__caret"></div></template>
                      </multiselect>
                    </div>
                    <div class="input-with-arrow"><input v-model="form.passengersTo" type="number" placeholder="Число пассажиров" class="f-input" /></div>
                  </div>
                  <button class="expand-btn" @click="isExpanded = !isExpanded">
                    <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }" alt="arrow">
                  </button>
                </div>
              </div>
          </template>
          <!-- Бизнес и оборудование -->
          <template v-if="type === 'business'">
            <div v-if="sectionParam === 'ready-business' || sectionParam === 'business'" class="business-layout">
              <!-- Ряд 1 (5 элементов) -->
              <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="form.dealGoal" :options="['Покупка', 'Партнерство', 'Инвестиции']" placeholder="Цель сделки" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="multiselect-container">
                  <multiselect v-model="form.businessStatus" :options="['Действующий', 'Стартап']" placeholder="Состояние бизнеса" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="multiselect-container">
                  <multiselect v-model="form.payback" :options="['до 6 мес', '6-12 мес', '1-2 года', '2+ года']" placeholder="Срок окупаемости" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" />
                <input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" />
              </div>
              <!-- Ряд 2 (2 элемента) -->
              <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="form.businessAge" :options="['до 1 года', '1-3 года', '3-5 лет', '5+ лет']" placeholder="Возраст бизнеса" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="multiselect-container" style="width: 25rem;">
                  <multiselect v-model="form.legalForm" :options="['ИП', 'ООО', 'АО', 'ПАО']" placeholder="Организационно-правовая форма" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
            </div>
            <div v-else-if="sectionParam === 'equipment'" class="equipment-layout">
              <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="selectedSubcategory" :options="currentSubLinks" label="name" track-by="slug" placeholder="Тип оборудования" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <input v-model="form.priceFrom" type="number" placeholder="Цена: от" class="f-input" />
                <input v-model="form.priceTo" type="number" placeholder="Цена: до" class="f-input" />
              </div>
            </div>
          </template>
          <!-- ЖИВОТНЫЕ -->
          <template v-if="type === 'animals'">
            <div v-if="sectionParam === 'pets'" class="animals-layout">
              <!-- Ряд 1 -->
              <div class="extra-row mb-1">
                <div class="multiselect-container">
                  <multiselect v-model="selectedSubcategory" :options="currentSubLinks" label="name" track-by="slug" placeholder="Выберите категорию" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="multiselect-container" style="width: 10rem;">
                  <multiselect v-model="form.gender" :options="['Самец', 'Самка']" placeholder="Пол" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="input-with-arrow">
                  <input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" />
                </div>
                <div class="input-with-arrow">
                  <input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" />
                </div>
                <div class="multiselect-container">
                  <multiselect v-model="form.color" :options="['Белый', 'Черный', 'Рыжий', 'Пятнистый']" placeholder="Окрас" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
              <!-- Ряд 2 -->
              <div class="extra-row">
                <div class="multiselect-container">
                  <multiselect v-model="form.age" :options="['До 1 мес.', '1-3 мес.', '3-6 мес.', 'От года']" placeholder="Возраст" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
            </div>
           <div v-else-if="sectionParam === 'pet-products'" class="goods-layout">
              <div class="extra-row mb-1">
                <div class="multiselect-container">
                  <multiselect v-model="selectedSubcategory" :options="currentSubLinks" label="name" track-by="slug" placeholder="Выберите категорию" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="multiselect-container">
                  <multiselect v-model="form.animalKind" :options="['Кошки', 'Собаки', 'Грызуны', 'Птицы']" placeholder="Вид животного" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>

                <div class="multiselect-container">
                  <multiselect v-model="form.feedType" :options="['Сухой корм', 'Влажный корм', 'Лакомства']" placeholder="Тип корма" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
                <div class="input-with-arrow" style="max-width: 200px;">
                  <input v-model="form.priceFrom" type="number" placeholder="Цена : от" class="f-input" />
                </div>
                <div class="input-with-arrow" style="max-width: 200px;">
                  <input v-model="form.priceTo" type="number" placeholder="Цена : до" class="f-input" />
                </div>
              </div>
              <!-- Второй ряд: 2 цены -->
              <div class="extra-row"></div>
            </div>
          </template>
        </div>
      </div>
      <!-- РАСКРЫВАЮЩАЯСЯ ЧАСТЬ -->
      <div v-if="isExpanded" class="filter-extra">
        <template v-if="type === 'jobs'">
          <div class="extra-group mb-2"><label>Занятость</label>
            <div class="chips">
              <button v-for="v in ['Полная', 'Частичная', 'Временная']" :key="v" class="chip" :class="{ active: form.employment === v }" @click="form.employment = v">{{v}}</button>
            </div>
          </div>
          <div class="extra-group"><label>Формат работы</label>
            <div class="chips">
              <button v-for="f in ['Удалённо', 'В офисе', 'Гибрид']" :key="f" class="chip" :class="{ active: form.schedule === f }" @click="form.schedule = f">{{f}}</button>
            </div>
          </div>
        </template>
        <template v-if="type === 'realty'">
          <!-- Дополнительные селекты и инпуты -->
          <div class="extra-row mb-2">
            <div class="multiselect-container">
              <multiselect v-model="form.elevator" :options="['Есть', 'Нет']" placeholder="Лифт" open-direction="bottom" :searchable="false" :show-labels="false">
                <template #caret><div class="multiselect__caret"></div></template>
              </multiselect>
            </div>
            <div class="multiselect-container">
              <multiselect v-model="form.parking" :options="['Есть', 'Нет']" placeholder="Парковка" open-direction="bottom" :searchable="false" :show-labels="false">
                <template #caret><div class="multiselect__caret"></div></template>
              </multiselect>
            </div>
          </div>

          <!-- Секции с чипсами (Инфраструктура и Документы) -->
          <div class="realty-grid-container">
            <div class="extra-group">
              <label>Инфраструктура</label>
              <div class="realty-chips">
                <button v-for="v in ['Детская площадка', 'Видеонаблюдение', 'Спортивная площадка', 'Наличие охраны']" 
                  :key="v" class="chip" :class="{ active: form.infra?.includes(v) }" @click="toggleTag('infra', v)">{{v}}</button>
              </div>
            </div>
            <div class="extra-group">
              <label>Документы</label>
              <div class="realty-chips">
                <button v-for="d in ['Свидетельство о собственности', 'Отсутствие обременений']" 
                  :key="d" class="chip" :class="{ active: form.docs?.includes(d) }" @click="toggleTag('docs', d)">{{d}}</button>
              </div>
            </div>
          </div>
        </template>
        <template v-if="type === 'transport'" class="transport">
          <div v-if="sectionParam === 'cars'" class="transport-grid-container">
            <!-- Владельцы по ПТС -->
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Владельцев по ПТС</label>
                <div class="chips quad-chips">
                  <button v-for="v in ['Один', 'До двух', 'До трёх', 'Не важно']" 
                    :key="v" class="chip" :class="{ active: form.owners === v }" @click="form.owners = v">{{v}}</button>
                </div>
              </div>
              <div class="extra-group">
                <label>Руль</label>
                <div class="chips">
                  <button v-for="r in ['Не важно', 'Левый', 'Правый']" 
                    :key="r" class="chip" :class="{ active: form.steering === r }" @click="form.steering = r">{{r}}</button>
                </div>
              </div>
            </div>
            <div class="extra-column">
            <!-- Состояние -->
              <div class="extra-group mb-1">
                <label>Состояние</label>
                <div class="chips quad-chips">
                  <button v-for="s in ['Все', 'Кроме битых', 'Битые']" 
                    :key="s" class="chip" :class="{ active: form.condition === s }" @click="form.condition = s">{{s}}</button>
                </div>
              </div>
              <div class="extra-group">
                <label>Цвет</label>
                <div class="multiselect-container" style="width: 200px;">
                  <multiselect v-model="form.color" :options="['Белый', 'Черный', 'Красный', 'Синий']" placeholder="Выберите цвет" open-direction="bottom" :searchable="false" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
            </div>
            <div class="extra-column">
              <div class="extra-group">
                <label>Привод</label>
                <div class="chips">
                  <button v-for="p in ['Передний', 'Задний', 'Полный']" 
                    :key="p" class="chip" :class="{ active: form.drive === p }" @click="form.drive = p">{{p}}</button>
                </div>
              </div>
            </div>
            <div class="extra-column">
               <!-- Мощность -->
              <div class="extra-group mb-1">
                <label>Мощность</label>
                <div class="chips">
                  <input v-model="form.powerFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.powerTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
              <!-- Объем двигателя -->
              <div class="extra-group">
                <label>Объём двигателя</label>
                <div class="chips">
                  <input v-model="form.engineVolFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.engineVolTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="sectionParam === 'moto'" class="transport-grid-container">
            <!-- 1 ряд -->
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Владельцев по ПТС</label>
                <div class="chips quad-chips">
                  <button v-for="v in ['Один', 'До двух', 'До трёх', 'Не важно']" :key="v" class="chip" :class="{ active: form.owners === v }" @click="form.owners = v">{{v}}</button>
                </div>
              </div>
              <div class="extra-group">
                <label>Охлаждение</label>
                <div class="chips quad-chips">
                  <button v-for="c in ['Воздушное', 'Жидкостное']" :key="c" class="chip" :class="{ active: form.cooling === c }" @click="form.cooling = c">{{c}}</button>
                </div>
              </div>
            </div>
            <div class="extra-column">
            <div class="extra-group mb-1">
              <label>Состояние</label>
                <div class="chips quad-chips">
                  <button v-for="s in ['Все', 'Кроме битых', 'Битые']" :key="s" class="chip" :class="{ active: form.condition === s }" @click="form.condition = s">{{s}}</button>
                </div>
              </div>
            <div class="extra-group">
              <label>Цвет</label>
              <div class="multiselect-container">
                <multiselect v-model="form.color" :options="['Белый', 'Черный', 'Красный']" placeholder="Выберите" open-direction="bottom" :show-labels="false">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
            </div>
            </div>
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Тип двигателя</label>
                <div class="multiselect-container" style="width: 12.313rem;">
                  <multiselect v-model="form.engineType" :options="['Бензин', 'Электро']" placeholder="Выберите" open-direction="bottom" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
              <div class="extra-group">
                <label>КПП</label>
                <div class="multiselect-container" style="width: 12.313rem;">
                  <multiselect v-model="form.transmission" :options="['Механика', 'Автомат']" placeholder="Выберите" open-direction="bottom" :show-labels="false">
                    <template #caret><div class="multiselect__caret"></div></template>
                  </multiselect>
                </div>
              </div>
            </div>
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Мощность</label>
                <div class="chips">
                  <input v-model="form.powerFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.powerTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
              <div class="extra-group">
                <label>Объём двигателя</label>
                <div class="chips">
                  <input v-model="form.engineVolFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.engineVolTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
            </div>
            
          </div>
          <div v-else-if="sectionParam === 'trucks'" class="trucks-extra-grid">
            <!-- Колонна 1: Владельцы и Привод -->
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Владельцев по ПТС</label>
                <div class="chips quad-chips">
                  <button v-for="v in ['Один', 'До двух', 'До трёх', 'Не важно']" :key="v" class="chip" :class="{ active: form.owners === v }" @click="form.owners = v">{{v}}</button>
                </div>
              </div>
              <div class="extra-group">
                <label>Состояние (Привод)</label>
                <div class="chips quad-chips">
                  <button v-for="p in ['Передний', 'Задний', 'Полный']" :key="p" class="chip" :class="{ active: form.drive === p }" @click="form.drive = p">{{p}}</button>
                </div>
              </div>
            </div>
            <!-- Колонна 2: Состояние (битые) и КПП -->
            <div class="extra-column">
              <div class="extra-group">
                <label>Состояние</label>
                <div class="chips quad-chips">
                  <button v-for="s in ['Все', 'Кроме битых', 'Битые']" :key="s" class="chip" :class="{ active: form.condition === s }" @click="form.condition = s">{{s}}</button>
                </div>
              </div>
            </div>
            <!-- Колонна 3: Двигатель и Объем -->
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Тип двигателя</label>
                <div class="multiselect-container" style="width: 12.313rem;" >
                  <multiselect v-model="form.engineType" :options="['Дизель', 'Бензин', 'Газ']" placeholder="Выберите" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                </div>
              </div>
              <div class="extra-group">
                <label>КПП</label>
                <div class="multiselect-container" style="width: 12.313rem;" >
                  <multiselect v-model="form.transmission" :options="['Механика', 'Автомат', 'Робот']" placeholder="Выберите" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                </div>
              </div>
              
            </div>
            <!-- Колонна 4: Мощность -->
            <div class="extra-column">
              <div class="extra-group mb-1">
                <label>Мощность</label>
                <div class="chips align-center">
                  <input v-model="form.powerFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.powerTo" type="number" placeholder="До" class="f-input" />
                  <span class="unit-label">кВт</span>
                </div>
              </div>
              <div class="extra-group">
                <label>Объём двигателя</label>
                <div class="chips">
                  <input v-model="form.engineVolFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.engineVolTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
            </div>
          </div>
           <div v-if="subcategory === 'yachts'" class="water-extra-grid">
              <!-- Левая колонка -->
              <div class="extra-column">
                <div class="extra-group mb-1">
                  <label>Длина, м</label>
                  <div class="chips">
                    <input v-model="form.lengthFrom" type="number" placeholder="От" class="f-input" />
                    <input v-model="form.lengthTo" type="number" placeholder="До" class="f-input" />
                  </div>
                </div>
                <div class="extra-group mb-1">
                  <label>Ширина, м</label>
                  <div class="chips">
                    <input v-model="form.widthFrom" type="number" placeholder="От" class="f-input" />
                    <input v-model="form.widthTo" type="number" placeholder="До" class="f-input" />
                  </div>
                </div>
                <div class="extra-group">
                  <label>Материал корпуса</label>
                  <div class="multiselect-container" style="width: 100%;">
                    <multiselect v-model="form.hullMaterial" :options="['Пластик', 'Алюминий', 'Сталь', 'Дерево']" placeholder="Материал корпуса" open-direction="bottom" :show-labels="false"><template #caret><div class="multiselect__caret"></div></template></multiselect>
                  </div>
                </div>
              </div>
              <div class="extra-column">
                <div class="extra-group mb-1">
                  <label>Осадка, м</label>
                  <div class="chips">
                    <input v-model="form.draftFrom" type="number" placeholder="От" class="f-input" />
                    <input v-model="form.draftTo" type="number" placeholder="До" class="f-input" />
                  </div>
                </div>
                <div class="extra-group">
                  <label>Макс. число пассажиров</label>
                  <div class="chips">
                    <input v-model="form.passengersFrom" type="number" placeholder="От" class="f-input" />
                    <input v-model="form.passengersTo" type="number" placeholder="До" class="f-input" />
                  </div>
                </div>
              </div>
            </div>
            <div v-if="subcategory === 'jetski'" class="jetski-extra-panel">
              <div class="extra-group mb-1">
                <label>Мощность</label>
                <div class="chips">
                  <input v-model="form.powerFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.powerTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
              <div class="extra-group">
                <label>Объём двигателя</label>
                <div class="chips">
                  <input v-model="form.engineVolFrom" type="number" placeholder="От" class="f-input" />
                  <input v-model="form.engineVolTo" type="number" placeholder="До" class="f-input" />
                </div>
              </div>
            </div>
        </template>
      </div>
      <div class="filter-footer">
        <button class="apply-btn" @click="applyFilters">Показать</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-title{
  font-size: 1.2rem;
}
.filter-card { background: #64A07A; padding: 1.563rem; border-radius: 1.875rem; color: white; position: relative; margin-bottom: .6rem;}
.filter-main-row { display: flex; gap: 0.625rem; margin-top: 0.938rem; flex-wrap: wrap; align-items: center; justify-content: space-between;}
.transport-layout,.moto-layout,.trucks-layout,.water-layout,.jetski-layout{
  display: flex; gap: 0.625rem; flex-wrap: wrap; align-items: center; justify-content: space-between;
}
/* Кастомная стрелка (ИСПРАВЛЕННЫЙ SVG) */
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
  min-height: 2.6rem !important; height: 2.6rem !important; background: #fff !important; 
  border-radius: 0.938rem; padding: 0 0.638rem 0 0.938rem !important; display: flex !important; align-items: center !important;
  transition: all .1s; 
  /* overflow-x: auto; */
}
:deep(.multiselect){min-height: 2.6rem !important; height: 2.6rem !important;}

:deep(.multiselect__placeholder) { color: #A8A1A1 !important; line-height: 40px !important; margin: 0 !important; padding: 0 !important; font-size: 1rem;}

.multiselect-container { width: 16.8rem; position: relative; cursor: pointer; }
.f-input {border: 1px solid #e8e8e8; -webkit-appearance: none; font-size: 1rem !important; padding: 0 1.875rem 0 0.938rem !important; height: 2.6rem !important; border-radius: 0.938rem; width: 11.438rem; outline: none; color: #000; }
.f-input::placeholder{color: #A8A1A1;}
.f-input::-webkit-outer-spin-button,
.f-input::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}
.f-input[type='number'] {-moz-appearance: textfield;}
.expand-btn {text-align: center; background: white; border: none; border-radius: 10px; width: 2.5rem; height: 2.5rem; cursor: pointer; }
.expand-btn img { width: 1rem; height: 1rem; display: inline-block; color: #000; transition: transform 0.3s;}
.expand-btn img.rotate { transform: rotate(180deg); }
.apply-btn { background: #FFD600; color: #000; border: none; padding: 10px 30px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 15px; }

:deep(.multiselect__option--highlight) { background: #64A07A !important; color: #fff !important; }
:deep(.multiselect__option::after) { display: none !important; }
:deep(.multiselect__option){
  display: block;
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
:deep(.multiselect__tag-icon) {
  margin-left: 7px;
  width: 20px;
}

/* Стили для чипсов (кнопок выбора как на фото) */
.filter-extra {
  margin-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 15px;
}
.extra-group label { display: block; margin-bottom: 8px; font-size: 14px; }
.chips { display: flex; gap: 0.6rem; }
.chip {
  padding: 0.75rem .95rem 0.75rem .95rem;
  border-radius: 0.938rem;
  border: none;
  background: white;
  color: #333;
  cursor: pointer;
}
.chip.active {
  background: #4a6d54;
  color: white;
}
.realty-grid-container{
  display: flex;
  gap: 9.938rem;
}
.realty-chips{
  display: grid;
  grid-template-columns: repeat(2,1fr);
  width: fit-content;
  gap: 1rem;
}
.realty-chips .chip{
  border-radius: 0.938rem;
  padding: 0.75rem 1.188rem 0.938rem 1.188rem;
  text-align: center;
}
.filter-footer {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 0rem;
  bottom: -3.508rem;
}
.apply-btn {
  background: #64A07A;
  color: white;
  padding: 0.75rem 3.313rem 0.938rem 3.313rem;
  border-radius: 0.938rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.deal-selector { display: flex; gap: 1.5rem; margin-bottom: 4.063rem; }
.deal-btn { padding: 0.75rem 3.188rem 0.938rem 3.188rem; border-radius: 0.938rem; border: none; background: #EEEEEE; cursor: pointer; }
.deal-btn.active {    
  background: white;
    box-shadow: 0px 0.2rem 0.2rem 0px #00000040; }
.extra-row {
  display: flex;
  gap: 1rem;
  /* width: 100%; */
}
.mb-1{
  margin-bottom: 0.625rem;
}
.mb-2{
  margin-bottom: 1.75rem;
}
.business-layout{
  display: grid;
  gap: 0.625rem;
}
.water-extra-grid,.trucks-extra-grid,.transport-grid-container{
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
}
.extra-column{
  display: block;
}
.quad-chips{
  flex-wrap: wrap;
  /* gap: 1rem; */
}
.align-center{
  align-items: center;
}
.unit-label{
  width: 2.563rem;
  height: 2.563rem;
  border-radius: 0.738rem;
  background: white;
  color: #A8A1A1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
