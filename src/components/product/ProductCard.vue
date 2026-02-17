<template>
  <div class="product-card">

    <a href="">
      <img :src="product.image" alt="" class="product-img" />
    </a>

    <div class="product-card__content">

      <a href="" class="text13 title">
        {{ product.title }}
      </a>

      <div class="price">
        {{ product.price }} р
      </div>

      <div class="product-content__bottom">

        <div class="text13">
          {{ product.city }}
        </div>

        <img
          class="card-like"
          :src="product.isLiked ? heartFilled : heart"
          @click="onLikeClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import heart from "/src/assets/img/icons/heart.svg"
import heartFilled from "/src/assets/img/icons/heart-filled.svg"

import { useAuthStore } from "/src/stores/authStore.js"
import { useModalStore } from "/src/stores/modal.js"

const authStore = useAuthStore()
const modalStore = useModalStore()

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(["toggle-like"])

const onLikeClick = () => {
  if (!authStore.isAuthenticated) {
    modalStore.openAuthModal()
    return
  }
  emit("toggle-like", props.product.id)
}
</script>

<style scoped>
.product-card {
  border: 1px solid transparent;
  width: 12.938rem;
  min-height: 16.375rem;
  background-color: white;
  padding: 0.875rem 0.75rem 0.813rem 0.813rem;
  border-radius: 1.25rem;
  transition: all 0.3s;
}

.product-card:hover {
  border-color: var(--btn-bg);
}

.product-card .product-img {
  width: 100%;
  height: 9.125rem;
  object-fit: cover;
  border-radius: 0.625rem;
}

.price {
  font-size: 0.875rem;
  font-weight: 800;
  margin-top: 0.475rem;
}

.product-content__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.313rem;
}

.title {
  height: 2.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  transition: all 0.3s;
  border-radius: 0;
}

.title:hover {
  color: var(--btn-bg);
}

.card-like {
  cursor: pointer;
  width: 1.313rem;
  height: 1.125rem;
  transition: all 0.3s;
}

.card-like:hover {
  transform: translateY(-15%);
}
</style>