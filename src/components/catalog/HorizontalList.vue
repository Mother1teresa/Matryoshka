<script setup>
import { computed } from "vue";
import { useProductStore } from "../../stores/product.js";

const props = defineProps({
  // Список может прийти готовым (например, из JobList)
  items: {
    type: Array,
    default: null,
  },
  // Либо может прийти только категория (из CatalogView)
  category: {
    type: String,
    default: "",
  },
  subcategory: {
    type: String,
    default: ""
  }
});


const store = useProductStore();

// ОСНОВНАЯ ЛОГИКА:
const displayItems = computed(() => {
  return store.products.filter(p => {
    if (p.category !== props.category) return false

    if (props.subcategory && p.subcategory !== props.subcategory)
      return false
    return true
  })
})
</script>

<template>
  <div class="horizontal-list">
    <!-- Теперь итерируемся по displayItems -->
    <div v-for="item in displayItems" :key="item.id" class="horizontal-card">
      <img :src="item.image" class="card-img" />

      <div class="card-content">
        <div class="card-title">{{ item.title }}</div>

        <div class="card-city">{{ item.city }}</div>
        <!-- Логика отображения цены или зарплаты -->
        <div class="card-price" v-if="item.salary">{{ item.salary }} ₽</div>
        <div class="card-price" v-else-if="item.price">{{ item.price }} ₽</div>
        <p class="card-description">{{ item.description }}</p>
      </div>
      <div class="card-content__rigth">
        <img src="" alt="" class="card-avatar" />
        <div class="card-title">{{ item.name }}</div>
        <div class="card-content__rigth-btns">
          <button class="card-btn">Написать</button>
          <button class="card-btn">Показать номер</button>
        </div>
      </div>
    </div>

    <!-- Сообщение, если ничего не нашли -->
    <div v-if="displayItems.length === 0" class="empty-state">
      Нет объявлений в категории "{{ category }}"
    </div>
  </div>
</template>
<style scoped>
.horizontal-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 15rem;
}

.horizontal-card {
  display: flex;
  gap: 1.25rem;
  background: white;
  padding: 1.25rem;
  border-radius: 1.25rem;
  width: 60.875rem;
}
.card-img {
  width: 7.875rem;
  height: 11.188rem;
  object-fit: scale-down;
  border-radius: 1.25rem;
}

.card-title {
  font-weight: 700;
}
.card-description {
  color: #7c7c7c;
  font-size: 0.938rem;
}
.card-content {
  width: 44.125rem;
}
.card-price {
  margin: 8px 0;
  font-weight: 800;
}

.card-btn {
  background: var(--btn-bg);
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
</style>
