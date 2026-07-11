<template>
  <div 
    class="form-group" 
    :class="[`type-${field.type}`, field.gridClass]"
    v-if="isVisible"
  >
    <label class="label">
      {{ field.label }}
      <span v-if="field.required" class="required">*</span>
      <span v-if="field.hint" class="field-hint">{{ field.hint }}</span>
    </label>

    <!-- TEXT -->
    <input 
      v-if="field.type === 'text'" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      type="text" 
      :placeholder="field.placeholder" 
      class="f-input" 
    />

    <!-- NUMBER -->
    <div v-else-if="field.type === 'number'" class="input-with-suffix">
      <input 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.valueAsNumber || $event.target.value)"
        type="number" 
        :placeholder="field.placeholder || '0'" 
        class="f-input" 
      />
      <span v-if="field.suffix" class="suffix">{{ field.suffix }}</span>
    </div>

    <!-- SELECT -->
    <div v-else-if="field.type === 'select'" class="multiselect-container">
      <multiselect 
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :options="fieldOptions" 
        :placeholder="field.placeholder || 'Выберите'" 
        :searchable="field.searchable !== false"
        :show-labels="false"
        open-direction="bottom">
        <template #caret><div class="multiselect__caret"></div></template>
      </multiselect>
    </div>

    <!-- CHIPS -->
    <div v-else-if="field.type === 'chips'" class="chips-row">
      <button
        v-for="opt in field.options"
        :key="opt"
        type="button"
        class="chip-btn"
        :class="{ active: isChipActive(opt) }"
        @click="toggleChip(opt)"
      >
        {{ opt }}
      </button>
    </div>

    <!-- TEXTAREA -->
    <textarea 
      v-else-if="field.type === 'textarea'" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      class="f-textarea" 
      :placeholder="field.placeholder"
    />

    <!-- DYNAMIC LIST -->
    <div v-else-if="field.type === 'dynamic-list'" class="dynamic-list">
      <div v-for="(item, idx) in listValue" :key="idx" class="list-row">
        <span class="bullet">—</span>
        <input 
          v-model="listValue[idx]" 
          type="text" 
          :placeholder="field.placeholder" 
          class="f-input" 
        />
      </div>
      <button type="button" class="btn-add-row" @click="addListItem">+ Добавить поле</button>
    </div>

    <!-- PRICE WITH UNIT -->
    <div v-else-if="field.type === 'price-with-unit'" class="price-type-wrapper">
      <div class="price-input-container">
        <input 
          :value="priceValue"
          @input="updatePrice($event.target.value)"
          type="number" 
          placeholder="Цена" 
          class="f-input" 
        />
        <span class="currency-p">₽</span>
      </div>
      <div class="multiselect-container unit-select">
        <multiselect 
          :model-value="unitValue"
          @update:model-value="updateUnit"
          :options="field.unitOptions" 
          placeholder="За услугу" 
          :searchable="false" 
          :show-labels="false"
        >
          <template #caret>
            <div class="multiselect__caret"></div>
          </template>
        </multiselect>
      </div>
    </div>

    <!-- DAYS CHECKBOX -->
    <div v-else-if="field.type === 'days-checkbox'" class="days-grid-layout">
      <label 
        v-for="day in field.options" 
        :key="day" 
        class="day-checkbox-label"
      >
        <input 
          type="checkbox" 
          :value="day" 
          :checked="isDayChecked(day)"
          @change="toggleDay(day)"
          class="hidden-native-checkbox" 
        />
        <span class="custom-checkbox-view"></span>
        <span class="day-text">{{ day }}</span>
      </label>
    </div>

    <!-- TIME RANGE -->
    <div v-else-if="field.type === 'time-range'" class="time-inputs-block">
      <div class="time-row-item">
        <span class="time-prefix">с</span>
        <input 
          type="time" 
          :value="timeFrom" 
          @input="updateTime('from', $event.target.value)" 
          class="time-field" 
        />
      </div>
      <div class="time-row-item">
        <span class="time-prefix">до</span>
        <input 
          type="time" 
          :value="timeTo" 
          @input="updateTime('to', $event.target.value)" 
          class="time-field" 
        />
      </div>
    </div>

    <!-- NUMBER WITH UNIT -->
    <div v-else-if="field.type === 'number-with-unit'" class="unit-input-wrapper">
      <input 
        :value="numericValue"
        @input="updateNumeric($event.target.value)"
        type="number" 
        class="f-input compact" 
        placeholder="0" 
      />
      <div class="unit-select-box">
        <select :value="currentUnit" @change="updateUnit($event.target.value)" class="unit-native-select">
          <option v-for="opt in field.unitOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <span class="custom-arrow-icon-unit"></span>
      </div>
    </div>

    <!-- MAP ADDRESS -->
    <div v-else-if="field.type === 'map-address'" class="map-address-field">
      <p class="address-hint">Адрес указывается в секции "Местоположение" ниже</p>
    </div>

    <!-- Fallback для неизвестных типов -->
    <div v-else class="unknown-type">
      <input 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)"
        type="text" 
        :placeholder="field.placeholder || field.label" 
        class="f-input" 
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { carModels } from '/src/data/sharedFieldOptions.js';

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number, Array, Object], default: '' },
  subSubCategory: { type: String, default: '' },
  parentAttributes: { type: Object, default: () => ({}) }  // ← ДОБАВЛЕНО: для доступа к brand и другим полям
});

const emit = defineEmits(['update:modelValue']);

// ─── Условное отображение (showIf) ───
const isVisible = computed(() => {
  if (!props.field.showIf) return true;
  return props.subSubCategory === props.field.showIf;
});

// Options для select — с поддержкой dynamic (модели авто)
const fieldOptions = computed(() => {
  // Если поле dynamic и это model — берём модели по выбранной марке
  if (props.field.dynamic && props.field.key === 'model') {
    const brand = props.parentAttributes?.brand;
    if (brand && carModels[brand]) {
      return carModels[brand];
    }
    return ['Сначала выберите марку'];
  }
  
  // Обычные options
  return props.field.options || [];
});

// ─── CHIPS ───
const isChipActive = (opt) => {
  const val = props.modelValue;
  return Array.isArray(val) && val.includes(opt);
};
const toggleChip = (opt) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const idx = current.indexOf(opt);
  if (idx > -1) current.splice(idx, 1);
  else current.push(opt);
  emit('update:modelValue', current);
};

// ─── DYNAMIC LIST ───
const listValue = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue : [''],
  set: (val) => emit('update:modelValue', val)
});
const addListItem = () => {
  listValue.value = [...listValue.value, ''];
};

// ─── PRICE WITH UNIT ───
const priceValue = computed(() => props.modelValue?.price || '');
const unitValue = computed(() => props.modelValue?.unit || props.field.unitOptions?.[0]);
const updatePrice = (val) => {
  emit('update:modelValue', { price: val, unit: unitValue.value });
};
const updateUnit = (val) => {
  emit('update:modelValue', { price: priceValue.value, unit: val });
};

// ─── DAYS ───
const isDayChecked = (day) => {
  return Array.isArray(props.modelValue) && props.modelValue.includes(day);
};
const toggleDay = (day) => {
  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const idx = current.indexOf(day);
  if (idx > -1) current.splice(idx, 1);
  else current.push(day);
  emit('update:modelValue', current);
};

// ─── TIME RANGE ───
const timeFrom = computed(() => props.modelValue?.from || '08:00');
const timeTo = computed(() => props.modelValue?.to || '20:00');
const updateTime = (key, val) => {
  emit('update:modelValue', { ...props.modelValue, [key]: val });
};

// ─── NUMBER WITH UNIT ───
const numericValue = computed(() => props.modelValue?.value || '');
const currentUnit = computed(() => props.modelValue?.unit || props.field.unitOptions?.[0]);
const updateNumeric = (val) => {
  emit('update:modelValue', { value: val, unit: currentUnit.value });
};
</script>

<style scoped>
.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.938rem; 
}
.label { font-size: 1.25rem; font-weight: 400; color: #262626; display: block;}
.required { 
  color: #ff4d4f; 
  margin-left: 4px; 
}
.field-hint { 
  color: #999; 
  font-weight: normal; 
  margin-left: 8px; 
  font-size: 13px;
}

/* Chips */
.chips-row { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.75rem; 
}
.chip-btn { 
  padding: 0.875rem 1.5rem; 
  border: 1px solid #e0e0e0; 
  border-radius: 0.875rem;
  background: #f5f5f5; 
  cursor: pointer; 
  font-size: 0.975rem;
  transition: 0.3s;
}
.chip-btn:hover {
  background: #eef0ef;
}
.chip-btn.active { 
  background: #76a58f; 
  color: white; 
  border-color: #76a58f; 
}

/* Suffix input */
.input-with-suffix { 
  position: relative; 
  width: fit-content;
}
.input-with-suffix .f-input { 
  padding-right: 2.5rem !important; 
}
.suffix { 
  position: absolute; 
  right: .8rem; 
  top: 50%; 
  transform: translateY(-50%); 
  color: #aaa; 
  font-size: 0.875rem; 
}

/* Price with unit */
.price-type-wrapper { 
  display: flex; 
  gap: 0.75rem; 
  max-width: 25rem; 
}
.price-input-container { 
  position: relative; 
  flex: 1; 
}
.currency-p { 
  position: absolute; 
  right: 16px; 
  top: 50%; 
  transform: translateY(-50%); 
  color: #aaa; 
}
.unit-select { 
  width: 160px; 
}

/* Days */
.days-grid-layout { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 12px; 
}
.day-checkbox-label { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  cursor: pointer; 
}
.hidden-native-checkbox { 
  position: absolute; 
  opacity: 0; 
}
.custom-checkbox-view { 
  width: 20px; 
  height: 20px; 
  border: 1px solid #e0e0e0; 
  border-radius: 6px; 
  display: inline-block; 
  transition: 0.2s;
}
.hidden-native-checkbox:checked + .custom-checkbox-view { 
  background: #76a58f; 
  border-color: #76a58f; 
}
.day-text { 
  font-size: 14px; 
}

/* Time */
.time-inputs-block { 
  display: flex; 
  gap: 16px; 
}
.time-row-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.time-prefix { 
  font-size: 14px; 
  color: #666; 
}
.time-field { 
  padding: 10px 14px; 
  border: 1px solid #e0e0e0; 
  border-radius: 10px; 
  font-size: 14px;
}

/* Number with unit */
.unit-input-wrapper { 
  position: relative; 
  width: 150px; 
}
.f-input.compact { 
  padding-right: 70px; 
}
.unit-select-box { 
  position: absolute; 
  right: 1px; 
  top: 1px; 
  bottom: 1px; 
  width: 65px; 
  background: #fff; 
  border-left: 1px solid #e0e0e0; 
  border-radius: 0 12px 12px 0; 
  display: flex; 
  align-items: center; 
}
.unit-native-select { 
  width: 100%; 
  height: 100%; 
  border: none; 
  background: transparent; 
  padding-left: 8px; 
  font-size: 14px; 
  cursor: pointer; 
  outline: none; 
  appearance: none; 
}

/* Dynamic list */
.dynamic-list { 
  display: flex; 
  flex-direction: column; 
  gap: 0.938rem; 
}
.list-row { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.bullet { 
  color: #76a58f; 
  font-size: 16px; 
  min-width: 16px;
}
.btn-add-row { 
  padding: 10px 20px; 
  background: #76a58f; 
  color: white; 
  border: none; 
  border-radius: 12px; 
  cursor: pointer; 
  align-self: flex-start; 
  font-size: 14px;
  transition: 0.2s;
  margin-top: 4px;
}
.btn-add-row:hover {
  background: #5e9079;
}

/* Map address hint */
.map-address-field { 
  width: 100%; 
}
.address-hint {
  font-size: 13px;
  color: #999;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

/* Unknown type fallback */
.unknown-type {
  width: 100%;
}

/* Общие стили инпутов */
.f-input, .f-textarea,:deep(.multiselect__tags) {
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
.price-input-container .f-input{
  padding-right: 2rem !important;
}
:deep(.multiselect__input), :deep(.multiselect__single){
  line-height: normal !important;
  min-height:auto !important;
  vertical-align:auto !important;
}

.f-input:focus, .f-textarea:focus {
  border-color: #76a58f;
}
.f-textarea { 
  min-height: 100px; 
  resize: vertical; 
}

/* Multiselect */
/* Кастомная стрелка */
.multiselect__caret {
  position: absolute; right: 12px; top: 50%; width: 12px; height: 12px; margin-top: -6px;
  background-image: url("/src/assets/img/arr-select.svg");
  background-repeat: no-repeat; background-size: contain; transition: transform 0.3s; z-index: 1; pointer-events: none;
}
:deep(.multiselect--active .multiselect){
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
:deep(.multiselect--active .multiselect__caret) { transform: rotate(180deg); }
:deep(.multiselect__select) { display: none !important; }
/* Фикс текста */
:deep(.multiselect__single) { 
  color: #000 !important; font-size: 1rem !important; 
  padding-left: 0 !important; margin-bottom: 0 !important; background: transparent !important; display: block !important;
}
/* :deep(.multiselect__tags) { 
  min-height: 2.6rem !important; height: 2.6rem !important; background: #fff !important; 
  border-radius: 0.938rem; padding: 0 0.638rem 0 0.938rem !important; display: flex !important; align-items: center !important;
  transition: all .1s; 
} */
:deep(.multiselect){height: 3.188rem !important;}
:deep(.multiselect__placeholder) { color: #A8A1A1 !important; margin: 0 !important; padding: 0 !important; font-size: 1rem;}
:deep(.multiselect__input), :deep(.multiselect__single){
  margin-bottom: 0;
}
:deep(.multiselect), :deep( .multiselect__input),:deep( .multiselect__single){
  font-size: 1rem !important;
  padding:0 !important;
 
}
:deep( .multiselect__input){
 color: #A8A1A1 !important;
}
:deep(.multiselect__option--highlight) { background: var(--btn-bg) !important; color: #fff !important; font-weight: 600;}
.multiselect-container { width: 100%; position: relative; cursor: pointer; }
/* .f-input {border: 1px solid #e8e8e8; -webkit-appearance: none; font-size: 1rem !important; padding: 0 1.875rem 0 0.938rem !important; height: 2.6rem !important; border-radius: 0.938rem; outline: none; color: #000; } */
.f-input::placeholder{color: #A8A1A1;}
.f-input::-webkit-outer-spin-button,
.f-input::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}
.f-input[type='number'] {-moz-appearance: textfield;}
:deep(.multiselect__option--selected) {
  color: var(--btn-bg);
  background: #f3f3f3;
}
</style>
