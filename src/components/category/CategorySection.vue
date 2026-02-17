<template>
  <section>
    <div class="container">
      <div class="categories">
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog11.svg" alt="" />
          Товары
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog2.svg" alt="" />
          Услуги
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog3.svg" alt="" />
          Транспорт
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog4.svg" alt="" />
          Недвижимость
        </a>
        <a href="" class="category"> Все категории </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog5.svg" alt="" />
          Работа
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog6.svg" alt="" />
          Бизнес и оборудование
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog7.svg" alt="" />
          Путешествия
        </a>
        <a href="" class="category">
          <img src="/src/assets/img/catalog/catalog8.svg" alt="" />
          Животные
        </a>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  width: 80%;
}
.category {
  width: fit-content;
  padding: 0.625rem 1rem;
  padding-right: 1.75rem;
  color: var(--btn-bg);
  font-weight: 500;
  font-size: 1.25rem;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 1.25rem;
  background-color: white;
  transition:
    opacity 0.3s,
    box-shadow 0.3s;
}
.category:hover {
  opacity: 70%;
  box-shadow: none;
}
.category img {
  height: 2.188rem;
  width: auto;
}
</style>
