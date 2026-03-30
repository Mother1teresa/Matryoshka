<script setup>
import { computed, watch, onMounted } from "vue";
import { useProductStore } from "/src/stores/product.js"
import ProductSection from "/src/components/product/ProductSection.vue"

const props = defineProps({
  category: String,
  subcategory: String,
  filters: Object
})
const store = useProductStore()

const loadData = () => {
  store.fetchAdverts({
    category: props.category,
    subcategory: props.subcategory,
    ...props.filters
  });
};

watch(() => [props.category, props.subcategory, props.filters], loadData, { deep: true });
onMounted(loadData);

const products = computed(() => store.products);
</script>

<template>
  <div v-if="store.isLoading" class="block__loading">Загрузка товаров...</div>
  <ProductSection v-else :items="products" />
</template>
