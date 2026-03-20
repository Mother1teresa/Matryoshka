<template>
  <section>
    <div class="container">
      <div class="categories">
        <router-link to="/tovary" class="category">
          <img src="/src/assets/img/catalog/catalog11.svg" alt="" />
          Товары
        </router-link>
        <router-link to="/uslugi" class="category">
          <img src="/src/assets/img/catalog/catalog2.svg" alt="" />
          Услуги
        </router-link>
        <router-link to="/transport" class="category">
          <img src="/src/assets/img/catalog/catalog3.svg" />
          Транспорт
        </router-link>
        <router-link to="/nedvizhimost" class="category">
          <img src="/src/assets/img/catalog/catalog4.svg" />
          Недвижимость
        </router-link>
        <button class="category" @click="menu.open()">Все категории</button>
        <router-link to="/rabota" class="category">
          <img src="/src/assets/img/catalog/catalog5.svg" alt="" />
          Работа
        </router-link>
        <router-link to="/biznes" class="category">
          <img src="/src/assets/img/catalog/catalog6.svg" />
          Бизнес и оборудование
        </router-link>
        <router-link to="/travel" class="category">
          <img src="/src/assets/img/catalog/catalog7.svg" />
          Путешествия
        </router-link>
        <router-link to="/animals" class="category">
          <img src="/src/assets/img/catalog/catalog8.svg" />
          Животные
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useMenuStore } from "/src/stores/menu.js";

const menu = useMenuStore();
</script>

<style scoped>
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  width: 84%;
}

.category img {
  height: 2.188rem;
  width: auto;
}
@media (max-width: 77rem) {
  .categories {
    width: 90%;
  }
}
</style>
