<script setup>
import { computed } from "vue"
import { useProductStore } from "/src/stores/product.js"
import ProductSection from "/src/components/product/ProductSection.vue"

const props = defineProps({
  category: String
})

const store = useProductStore()

const products = computed(() => {
  if (!props.category) return []
  return store.products.filter(
    p => p.category === props.category
  )
})
</script>

<template>
  <ProductSection :items="products" />
</template>