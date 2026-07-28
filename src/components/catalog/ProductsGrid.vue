<script setup>
import { computed } from "vue"
import { useProductStore } from "/src/stores/product.js"
import ProductCard from "/src/components/product/ProductCard.vue"

const props = defineProps({
  category: String,
  section: String,
  subcategory: String,
  filters: Object
})

const store = useProductStore()

const products = computed(() => {
  // Конкретная подкатегория: /tovary/fashion/men-clothes
  if (props.subcategory) {
    return store.getProductsByCategory(props.category, props.subcategory)
  }
  // Страница секции: /tovary/fashion
  if (props.section) {
    return store.getProductsBySection(props.category, props.section)
  }
  // Просто категория: /tovary
  return store.getProductsByCategory(props.category)
})
</script>

<template>
  <div class="products-list">
    <div v-if="store.isLoading" class="block__loading">Загрузка товаров...</div>
    <div v-else-if="products.length === 0" class="block__empty">
      Нет товаров по заданным фильтрам
    </div>
    <div v-else class="products">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<style scoped>
.products-list{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 15rem;
}
.products {
  background-color: #ececec;
  padding: 0.938rem;
  border-radius: 1.25rem;
  display: grid;
  gap: 0.938rem;
  width: 56.438rem;
  margin: 0 auto;
  grid-template-columns: repeat(4, 1fr);
}
</style>