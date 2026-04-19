<script setup>
import { ref, watch, computed } from 'vue'; 
import { useRouter, useRoute } from 'vue-router';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { productFields } from "/src/stores/productFields.js";
const props = defineProps({ type: String });
const router = useRouter();
const route = useRoute();
const typeParam = computed(() => route.params.type);
const sectionParam = computed(() => route.params.section);
const subcategoryParam = computed(() => route.params.subcategory);
const isExpanded = ref(false);
const isLoading = ref(false);
const form = ref({});

const normalizeQuery = (query) => {const q = { ...query };if (q.priceFrom) q.priceFrom = Number(q.priceFrom);if (q.priceTo) q.priceTo = Number(q.priceTo);return q;};
const mapToBackend = (formData) => {return Object.fromEntries(Object.entries(formData).filter(([_, v]) => v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)));};
const currentConfig = computed(() => {const config = productFields[typeParam.value];if (!config) return { main: [], extra: [] };const section = config[sectionParam.value];if (!section) return config.default || { main: [], extra: [] };if (subcategoryParam.value && section[subcategoryParam.value]) {return section[subcategoryParam.value];}return section.default || section;});
const mainFields = computed(() => currentConfig.value.main || []);
const extraFields = computed(() => currentConfig.value.extra || []);
const hasExtra = computed(() => extraFields.value.length > 0);
watch(currentConfig, (newConfig) => {const obj = {};[...(newConfig.main || []), ...(newConfig.extra || [])].forEach(field => {obj[field.key] = field.type === 'chips' ? [] : '';});
form.value = { ...obj, ...normalizeQuery(route.query) };}, { immediate: true });

const fetchProducts = async () => {isLoading.value = true;try {const params = {...mapToBackend(form.value),type: typeParam.value,section: sectionParam.value,subcategory: subcategoryParam.value};console.log("API Request:", params);
    // const response = await api.get('/adverts', { params });
} catch (e) {console.error("Ошибка загрузки:", e);} finally {isLoading.value = false;}};
watch(() => route.fullPath, () => {fetchProducts();}, { immediate: true });

const applyFilters = () => {const cleanData = mapToBackend(form.value);router.push({name: 'catalog',params: route.params,query: cleanData});};
const toggleChip = (key, value) => {
  const arr = form.value[key] || [];
  form.value[key] = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
};
</script>
<template>
  <div class="filter-wrapper">
    <div class="filter-card">
      <div class="filter-header">
        <span class="filter-title">Параметры поиска</span>
        <div class="filter-main-row">
          <div class="transport-layout">
            <div class="extra-row" :class="currentConfig.extraClass">
              <template v-for="field in mainFields" :key="field.key">
                  <div v-if="field.type === 'select'" class="multiselect-container">
                    <multiselect
                      v-model="form[field.key]"
                      :options="field.options || []"
                      :placeholder="field.label"
                      :searchable="false"
                      :show-labels="false"
                      open-direction="bottom">
                      <template #caret><div class="multiselect__caret"></div></template>
                    </multiselect>
                  </div>
                  <input
                    v-else-if="field.type === 'number'"
                    v-model="form[field.key]"
                    type="number"
                    :placeholder="field.label"
                    class="f-input"/>
                </template>
            </div>
            <button v-if="hasExtra" class="expand-btn" @click="isExpanded = !isExpanded">
              <img src="/src/assets/img/arr-select.svg" :class="{ rotate: isExpanded }">
            </button>
          </div>
        </div>
      </div>
      <!-- Раскрывашка (Extra Fields) -->
      <div v-if="isExpanded && hasExtra" class="filter-extra" :class="currentConfig.extraClass">
        <div class="transport-grid-container">
            <div v-for="field in extraFields" :key="field.key" class="extra-group" :class="[field.type, field.gridClass]">
              <label class="field-label-top">{{ field.label }}</label>
              <div v-if="field.type === 'chips'" class="chips-row">
                <button
                  v-for="opt in field.options || []"
                  :key="opt"
                  class="chip-item"
                  :class="{ active: form[field.key]?.includes(opt)}"
                  @click="toggleChip(field.key, opt)">
                  {{ opt }}
                </button>
              </div>
              <div v-else-if="field.type === 'select'" class="multiselect-container">
                <multiselect
                  v-model="form[field.key]"
                  :options="field.options || []"
                  :placeholder="field.label"
                  :searchable="false"
                  :show-labels="false"
                  open-direction="bottom">
                  <template #caret><div class="multiselect__caret"></div></template>
                </multiselect>
              </div>
              <div v-else-if="field.type === 'number'" class="range-inputs">
                <input v-model="form[field.key]" type="number" :placeholder="field.label" class="f-input" />
              </div>
            </div>
        </div>
      </div><div class="filter-footer"><button class="apply-btn" @click="applyFilters">Показать</button></div>
</div></div></template>
<style scoped>
.filter-title{
  font-size: 1.2rem;
}
.filter-card { background: var(--btn-bg); padding: 1.563rem; border-radius: 1.875rem; color: white; position: relative; margin-bottom: .6rem;}
.filter-main-row { display: flex; gap: 0.625rem; margin-top: 0.938rem; flex-wrap: wrap; align-items: center; justify-content: space-between;
flex-direction: column;}
.transport-layout,.moto-layout,.trucks-layout,.water-layout,.jetski-layout{
  display: flex; gap: 0.625rem; align-items: flex-end; justify-content: space-between;
}
/* Кастомная стрелка */
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
}
:deep(.multiselect){min-height: 2.6rem !important; height: 2.6rem !important;}
:deep(.multiselect__placeholder) { color: #A8A1A1 !important; line-height: 40px !important; margin: 0 !important; padding: 0 !important; font-size: 1rem;}
.multiselect-container { width: 14.5rem; position: relative; cursor: pointer; }
.f-input {border: 1px solid #e8e8e8; -webkit-appearance: none; font-size: 1rem !important; padding: 0 1.875rem 0 0.938rem !important; height: 2.6rem !important; border-radius: 0.938rem; width: 11.438rem; outline: none; color: #000; }
.f-input::placeholder{color: #A8A1A1;}
.f-input::-webkit-outer-spin-button,
.f-input::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}
.f-input[type='number'] {-moz-appearance: textfield;}
.expand-btn {text-align: center; background: white; border: none; border-radius: 0.938rem; width: 2.5rem; height: 2.4rem; cursor: pointer; }
.expand-btn img { width: 1rem; height: 1rem; display: inline-block; color: #000; transition: transform 0.3s;}
.expand-btn img.rotate { transform: rotate(180deg); }

:deep(.multiselect__option--highlight) { background: var(--btn-bg) !important; color: #fff !important; font-weight: 600;}
:deep(.multiselect__option::after) { display: none !important; }
:deep(.multiselect__option--selected){
  color: var(--btn-bg);
}
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

.filter-footer {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 0rem;
  bottom: -3.4rem;
}
.apply-btn {
  background: var(--btn-bg);
  color: white;
  padding: 0.75rem 3.313rem 0.75rem 3.313rem;
  border-radius: 0.938rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.extra-row {
  display: flex;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}
.deal-selector { display: flex; gap: 1.5rem; margin-bottom: 4.063rem; }
.deal-btn { padding: 0.75rem 3.188rem 0.938rem 3.188rem; border-radius: 0.938rem; border: none; background: #EEEEEE; cursor: pointer; }
.deal-btn.active {    
  background: white;
    box-shadow: 0px 0.2rem 0.2rem 0px #00000040;}
.transport-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr)); /* Авто-сетка */
  /* gap: 1rem; */
  row-gap: 1rem;
  /* margin-top: 1.25rem; */
}
.field-label-top {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}
.chips-row {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
.chip-item {
  background: white;
  border: none;
  border-radius: 0.938rem;
  padding: .5rem 1rem;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.chip-item.active {
  background: #4a6d54;
  color: white;
}
.commercial .chip-item {
  background: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 25px;
  min-width: 100px;
}
.commercial .extra-group.comm-grid .chips-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  max-width: 500px;
}

.deal-selector.sub-grid {
  background: none;
  padding: 0;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sub-grid .deal-btn {
  padding: 0.75rem 3.188rem 0.938rem 3.188rem;
  border-radius: 0.938rem;
  border: none;
  background: #EEEEEE;
  cursor: pointer;
}

.sub-grid .deal-btn.active {
  background: white;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
}
/* Специфические сетки для групп */
.comm-grid .chips-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 8px;
}

.voltage-grid .chips-row, 
.access-grid .chips-row {
  display: flex; 
  gap: 12px;
}

/* Заголовки над группами (белые на зеленом фоне) */
.extra-container label {
  color: #fff;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}
.deal-selector.houses-types {
  display: flex;
  flex-wrap: wrap; 
  gap: 12px;
  margin-bottom: 20px;
  background: none; 
  padding: 0;
}
.houses-types .deal-btn {
  background-color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.houses-types .deal-btn.active {
  background-color: #fff;
  color: #000;
  box-shadow: 0 0 0 2px var(--btn-bg, #2d8a40); 
  font-weight: 600;
}
.houses-types .deal-btn:last-child {
  margin-top: 5px; 
}
.grid-realty-buy .transport-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2.5rem;
  row-gap: 1.25rem; 
  align-items: start;
}

.grid-realty-buy .extra-group.select {
  grid-column: span 1;
}

.grid-realty-buy .extra-group:nth-child(3) .chips-row {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 1rem;  
}

.grid-realty-buy .extra-group:nth-child(4) .chips-row {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 1rem;      
}

.grid-realty-buy .chip-item {
  background: rgb(255, 255, 255); 
  border: 0.0625rem solid rgba(255, 255, 255, 0.3); 
  border-radius: 0.938rem;  
  color: #4a6d54;
  padding: 0.75rem 0.9375rem; 
  font-size: 1rem;
  text-align: center;
  width: 100%; 
  transition: all 0.2s;
}

.grid-realty-buy .chip-item.active {
  background: #4a6d54;
  color: white; 
}

.grid-realty-buy .field-label-top {
  color: #fff;
  font-weight: 500;
  margin-bottom: 0.75rem;   /* 12px */
  display: block;
}

/* Базовый стиль чипсов для коммерции */
.commercial .chip-item {
  background: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 25px;
  min-width: 100px;
}

/* Специфические сетки для групп */
.comm-grid .chips-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.voltage-grid .chips-row, 
.access-grid .chips-row {
  display: flex; 
  gap: 12px;
}

.extra-container label {
  color: #fff;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}
.commercial .comm-grid {
  grid-column: span 2;
}

.voltage-grid {
  display: flex;
  gap: 6px;
}

.parking .chips-row {
  justify-content: space-between;
}
</style>
