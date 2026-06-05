<template>
  <div class="product-card">
    <router-link
      :to="{
        name: 'Product',
        params: {
          type: product.category || product.type || 'tovary',
          section: product.section || 'default',
          id: product.id,
        },
      }"
    >
      <img
        :src="
          product.images
            ? product.images[0]
            : product.pictures?.[0]?.url || '/img/placeholder.png'
        "
        alt=""
        class="product-img"
      />
    </router-link>
    <div class="product-card__content">
      <router-link
        :to="{
          name: 'Product',
          params: {
            type: product.category || product.type || 'tovary',
            section: product.section || 'default',
            id: product.id,
          },
        }"
        class="text13 title"
      >
        {{ product.title }}
      </router-link>
      <div class="price">{{ product.price }} р</div>
      <div class="product-content__bottom">
        <div class="text13">
          {{ product.city }}
        </div>
        <img
          class="card-like"
          :src="favStore.isFavorite(product.id) ? heartFilled : heart"
          @click.stop="onLikeClick(product)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

import { useFavoritesStore } from "/src/stores/favoritesStore";
const favStore = useFavoritesStore();

import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";

const auth = useAuthStore();
const modal = useModalStore();
const route = useRoute();

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const onLikeClick = (item) => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    return;
  }
  favStore.toggle(item.id);
  emit("toggle-like", item.id);
};
onMounted(async () => {});
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
  height: 2rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  transition: all 0.3s;
  border-radius: 0;
  margin-top: 0.5rem;
}
.title:hover {
  color: var(--btn-bg);
}
/* .product-card:hover .title {
  color: var(--btn-bg);
} */
</style>
