<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "../../stores/product.js";
import { notify } from "../../utils/notify";
import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";

import { useFavoritesStore } from "/src/stores/favoritesStore";
const favStore = useFavoritesStore();

import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
const auth = useAuthStore();
const modal = useModalStore();
const isNumberShown = ref(false);

const props = defineProps({
  category: String,
  section: String,
  subcategory: String,
  filters: Object,
});
const route = useRoute();
const store = useProductStore();
const loadData = () => {
  if (route.params.id) return;
  store.fetchAdverts({
    category: props.category,
    section: props.section,
    subcategory: props.subcategory,
    ...props.filters,
  });
};
watch(
  () => [props.category, props.section, props.subcategory, props.filters],
  loadData,
  { deep: true },
);
onMounted(loadData);

const displayItems = computed(() => {
  let items = store.products;
  return items.filter((p) => {
    const isSameCategory = p.category === props.category;
    const isSameSection = !props.section || p.section === props.section;
    const isSameSub = !props.subcategory || p.subcategory === props.subcategory;
    return isSameCategory && isSameSection && isSameSub;
  });
});
const getImageUrl = (item) => {
  if (item.images && item.images.length > 0) {
    return item.images[0];
  }
  if (item.pictures && item.pictures[0]) {
    return item.pictures[0].url || item.pictures[0];
  }
  return "/img/placeholder.png";
};

const onLikeClick = (item) => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    return;
  }
  favStore.toggle(item.id);
  emit("toggle-like", item.id);
};

onMounted(async () => {});
const checkAuthAndRun = (
  action,
  message = "Авторизуйтесь, чтобы продолжить",
) => {
  if (!auth.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};
const onShowNumberClick = () => {
  checkAuthAndRun(() => {
    isNumberShown.value = true;
  }, "Войдите, чтобы увидеть номер телефона");
};
const onWriteClick = (e) => {
  if (!auth.isAuthenticated) {
    e.preventDefault();
    modal.openLogin();
    notify("Войдите, чтобы написать сообщение");
  }
};
</script>
<template>
  <div class="horizontal-list">
    <div v-if="store.isLoading">Загрузка...</div>
    <template v-else>
      <div v-for="item in displayItems" :key="item.id" class="horizontal-card">
        <router-link
          :to="{
            name: 'Product',
            params: {
              type: item.category,
              section: item.section || 'default',
              id: item.id,
            },
          }"
          class="card-link-wrapper"
        >
          <img :src="getImageUrl(item)" class="card-img" alt="product image" />
        </router-link>
        <div class="card-content">
          <div class="card-header">
            <router-link
              :to="{
                name: 'Product',
                params: {
                  type: item.category,
                  section: item.section || 'default',
                  id: item.id,
                },
              }"
            >
              <h3 class="card-title">{{ item.title }}</h3>
            </router-link>
          </div>
          <div class="card-price-row">
            <span class="card-price">
              <template v-if="item.category === 'rabota' && item.salary">
                {{ item.salary.toLocaleString() }} ₽
              </template>
              <!-- Если это обычный товар или недвижимость -->
              <template v-else-if="item.price">
                {{ item.price.toLocaleString() }} ₽
                <span
                  v-if="
                    item.category === 'nedvizhimost' &&
                    (subcategory === 'rent' ||
                      $route.params.subcategory === 'rent')
                  "
                  class="price-period"
                >
                  в месяц</span
                >
              </template>
            </span>
            <!-- Доп. инфо (например, цена за м2 для недвижки) -->
            <span
              class="price-extra"
              v-if="
                item.category === 'nedvizhimost' &&
                (subcategory === 'rent' ||
                  $route.params.subcategory === 'rent') &&
                item.attributes?.area
              "
            >
              {{
                Math.round(item.price / item.attributes.area).toLocaleString()
              }}
              ₽ за м2
            </span>
          </div>
          <div class="card-location">
            <span class="city-text">{{ item.city }}</span>
          </div>
          <p class="card-description">{{ item.description }}</p>
          <div class="card-footer-info" v-if="item.subcategory">
            {{ item.subcategory }}
          </div>
          <img
            class="card-like"
            :src="favStore.isFavorite(item.id) ? heartFilled : heart"
            @click.stop="onLikeClick(item)"
          />
        </div>
        <div class="card-content__rigth">
          <div class="card-content__rigth-btns">
            <a class="btn card-btn" @click="onWriteClick">Написать</a>
            <button class="btn card-btn" @click="onShowNumberClick">
              Показать номер
            </button>
          </div>
        </div>
      </div>
      <!-- Сообщение, если ничего не нашли -->
      <div v-if="displayItems.length === 0" class="empty-state">
        Нет объявлений в категории "{{ category }}":"{{ section }}"
      </div>
    </template>
  </div>
</template>
<style scoped>
.horizontal-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 15rem;
}
.horizontal-card {
  display: flex;
  gap: 1.25rem;
  background: white;
  padding: 1.25rem;
  border-radius: 1.25rem;
  width: 60.875rem;
}

.card-img {
  width: 7.875rem;
  height: 11.188rem;
  object-fit: cover;
  border-radius: 1.25rem;
}
.card-title {
  font-weight: 400;
  width: 90%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem;
}
.card-description {
  color: #7c7c7c;
  font-size: 0.938rem;
}

.card-btn {
  background: var(--btn-bg);
  color: white;
  padding: 0.5rem 0;
  text-align: center;
  border-radius: 0.313rem;
  border: none;
  cursor: pointer;
}
.card-btn:last-child {
  background-color: white;
  border: 1px solid var(--btn-bg);
  color: var(--btn-bg);
}
.card-content {
  display: flex;
  flex-direction: column;
  width: 35.125rem;
  min-height: 100%;
  position: relative;
}
.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0.5rem 0;
}
.card-price {
  font-size: 1.45rem;
  font-weight: 600;
  color: #000;
}
.price-period {
  font-size: 1.25rem;
  font-weight: 800;
}
.price-extra {
  color: #b0b0b0;
  font-size: 0.875rem;
  font-size: 1rem;
}
.card-description {
  color: #7c7c7c;
  font-size: 0.938rem;
  margin-top: 0.5rem;
  /* Ограничение текста в 2-3 строки, если нужно */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* Тот самый "Офис" или "Седан" внизу */
.card-footer-info {
  margin-top: auto; /* Выталкивает текст в самый низ блока */
  padding-top: 1rem;
  color: #b0b0b0;
  font-size: 0.875rem;
  text-transform: capitalize;
}
.card-content__rigth {
  display: none;
  transition: all 0.3s;
}
.horizontal-card:hover .card-content__rigth {
  display: block;
}
.card-content__rigth-btns {
  display: grid;
  align-content: center;
  align-items: center;
  height: 100%;
  width: 12.813rem;
  gap: 0.688rem;
}
.card-like {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.563rem;
  height: 1.5rem;
}
</style>
