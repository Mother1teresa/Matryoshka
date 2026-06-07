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
          :isAuth="authStore.isAuthenticated"
          @toggle-like="handleToggleLike"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import ProductCard from "./ProductCard.vue"
import { useProductStore } from "/src/stores/product.js"
import { useAuthStore } from "/src/stores/authStore.js"

const productStore = useProductStore()
const authStore = useAuthStore()
const route = useRoute()

const displayProducts = computed(() => {
  const category = route.params.category
  const section = route.params.section
  
  if (!category && !section) {
    return productStore.products  // все товары на главной
  }
  
  return productStore.getProductsByCategory(category, section)
})

// обработка лайка
const handleToggleLike = (productId) => {
  if (!authStore.isAuthenticated) {
    return
  }
  productStore.toggleLike(productId)
  saveLikes()
}

// сохранить лайки
const saveLikes = () => {
  const likedIds = productStore.products
    .filter(p => p.isLiked)
    .map(p => p.id)
  localStorage.setItem("likedProducts", JSON.stringify(likedIds))
}

// загрузить лайки
const loadLikes = () => {
  if (!authStore.isAuthenticated) return
  const saved = localStorage.getItem("likedProducts")
  if (!saved) return
  const likedIds = JSON.parse(saved)
  
  // Обновляем лайки в products
  productStore.products.forEach(product => {
    product.isLiked = likedIds.includes(product.id)
  })
}
// следим за logout
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (!isAuth) {
    productStore.resetLikes()
  } else {
    loadLikes()
  }
})

onMounted(() => {
  // Если товары ещё не загружены (редкий случай)
  if (productStore.products.length === 0) {
    productStore.fetchAdverts()
  }
  if (authStore.isAuthenticated) {
    loadLikes()
  }
})
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
  grid-template-columns: repeat(4, 1fr);
}
</style>