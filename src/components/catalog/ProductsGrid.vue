<script setup>
import { computed } from "vue"
import { useProductStore } from "/src/stores/product.js"
import { useRegionModalStore } from "/src/stores/regionModal.js"
import ProductCard from "/src/components/product/ProductCard.vue"

const props = defineProps({
  category: String,
  section: String,
  subcategory: String,
  filters: Object
})

const store = useProductStore()
const region = useRegionModalStore()

const baseProducts = computed(() => {
  if (props.subcategory) {
    return store.getProductsByCategory(props.category, props.subcategory)
  }
  if (props.section) {
    return store.getProductsBySection(props.category, props.section)
  }
  return store.getProductsByCategory(props.category)
})

const products = computed(() => {
  if (!region.selectedRegion) return baseProducts.value
  const city = region.selectedRegion.toLowerCase()
  return baseProducts.value.filter(p =>
    (p.city || p.address || '').toLowerCase().includes(city)
  )
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