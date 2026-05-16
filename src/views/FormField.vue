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
        @input="$emit('update:modelValue', $event.target.value)"
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
      >
        <template #caret>
          <div class="multiselect__caret"></div>
        </template>
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

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number, Array, Object], default: '' },
  subSubCategory: { type: String, default: '' } 
});

const emit = defineEmits(['update:modelValue']);

// ─── Условное отображение (showIf) ───
const isVisible = computed(() => {
  if (!props.field.showIf) return true;
  return props.subSubCategory === props.field.showIf;
});

// Options для select
const fieldOptions = computed(() => {
  if (props.field.dynamic) return []; // загрузить из API
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
  gap: 8px; 
  margin-bottom: 16px; 
}
.label { 
  font-size: 14px; 
  font-weight: 500; 
  color: #333; 
}
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
  gap: 10px; 
}
.chip-btn { 
  padding: 10px 20px; 
  border: 1px solid #e0e0e0; 
  border-radius: 12px; 
  background: #f5f5f5; 
  cursor: pointer; 
  font-size: 14px; 
  transition: 0.2s;
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
}
.input-with-suffix .f-input { 
  padding-right: 40px; 
}
.suffix { 
  position: absolute; 
  right: 16px; 
  top: 50%; 
  transform: translateY(-50%); 
  color: #aaa; 
  font-size: 14px; 
}

/* Price with unit */
.price-type-wrapper { 
  display: flex; 
  gap: 12px; 
  max-width: 400px; 
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
  gap: 8px; 
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
.f-input, .f-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
}
.f-input:focus, .f-textarea:focus {
  border-color: #76a58f;
}
.f-textarea { 
  min-height: 100px; 
  resize: vertical; 
}

/* Multiselect */
.multiselect-container {
  position: relative;
}
</style>
