<template>
  <section>
    <div class="container">
      <div v-if="productStore.isLoading" class="block__loading">Загрузка...</div>
      <div v-else-if="displayProducts.length === 0" class="block__empty">
        Нет товаров
      </div>
      <div v-else class="products">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from "vue"
import ProductCard from "./ProductCard.vue"
import { useProductStore } from "/src/stores/product.js"
import { useRegionModalStore } from "/src/stores/regionModal.js"

const productStore = useProductStore()
const region = useRegionModalStore()

const displayProducts = computed(() => {
  const all = productStore.products
  if (!region.selectedRegion) return all
  const city = region.selectedRegion.toLowerCase()
  return all.filter(p => (p.city || p.address || '').toLowerCase().includes(city))
})

const load = () => {
  const filters = {}
  if (region.selectedRegion) filters.address = region.selectedRegion
  productStore.fetchAdverts(filters, true)
}

onMounted(load)
watch(() => region.selectedRegion, load)
</script>

<style scoped>
.products {
  background-color: #ececec;
  padding: 0.938rem;
  border-radius: 1.25rem;
  display: grid;
  gap: 0.938rem;
  width: 56.438rem;
  margin: 0 auto;
  grid-template-columns: repeat(3, 1fr);
}
</style>