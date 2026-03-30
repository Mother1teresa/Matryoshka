<template>
  <section>
    <div class="container">
      <div v-if="productStore.isLoading" class="block__loading">Загрузка...</div>
      <div v-else class="products">
        <ProductCard
          v-for="product in productStore.products"
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
import { onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import ProductCard from "./ProductCard.vue"
import { useProductStore } from "/src/stores/product.js"
import { useAuthStore } from "/src/stores/authStore.js"

const productStore = useProductStore()
const authStore = useAuthStore()
const route = useRoute()

const loadData = () => {
  const category = route.params.category 
  productStore.fetchAdverts({ category: category })
}

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
  localStorage.setItem(
    "products",
    JSON.stringify(productStore.products)
  )
}

// загрузить лайки
const loadLikes = () => {
  if (!authStore.isAuthenticated) return
  const saved = localStorage.getItem("products")
  if (!saved) return
  const savedProducts = JSON.parse(saved)
  
  // Обновляем лайки в основном массиве
  productStore.allProducts.forEach(product => {
    const savedProduct = savedProducts.find(p => p.id === product.id)
    if (savedProduct) {
      product.isLiked = savedProduct.isLiked
    }
  })
}
watch(
  () => route.params.category,
  () => {
    loadData()
  }
)
// следим за logout
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {

    if (!isAuth) {
      productStore.resetLikes()
    } else {
      loadLikes()
    }
  }
)

onMounted(() => {
  loadData() // Загружаем товары при открытии страницы
  authStore.loadAuth()
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