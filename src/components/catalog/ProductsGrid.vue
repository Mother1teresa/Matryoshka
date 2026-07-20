<script setup>
import { computed, watch, onMounted } from "vue"
import { useProductStore } from "/src/stores/product.js"
import ProductCard from "/src/components/product/ProductCard.vue"
import { API_FILTER_FIELDS } from "/src/utils/filterToApiMapper.js"

const props = defineProps({
  category: String,
  section: String,
  subcategory: String,
  filters: Object
})
const store = useProductStore()
const apiFilters = computed(() => {
  const result = {}
  if (props.category) result.category = props.category
  if (props.subcategory || props.section) {
    result.subcategory = props.subcategory || props.section
  }
  if (props.filters) {
    for (const key of API_FILTER_FIELDS) {
      const val = props.filters[key]
      if (val !== '' && val !== null && val !== undefined) {
        result[key] = val
      }
    }
  }
  return result
})

const loadData = () => {
  store.fetchAdverts(apiFilters.value)
}

watch(apiFilters, loadData, { deep: true })
onMounted(loadData)

const products = computed(() => store.products)
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