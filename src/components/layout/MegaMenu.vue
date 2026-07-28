<script setup>
import { ref,watch } from "vue"
import { useRoute } from "vue-router"
import { useMenuStore } from "/src/stores/menu.js"
import { categories } from "/src/data/categories.js"

const route = useRoute();
const menu = useMenuStore()
const activeCategory = ref(categories[0])
const setActive = (cat) => {
  activeCategory.value = cat
}
const close = () => { menu.close() }
watch(route, () => {
  menu.close()
})
</script>

<template>
<div v-if="menu.isOpen" class="auth-modal" @click="close">
  <div class="mega-menu" @click.stop>
    <!-- левая колонка -->
    <div class="mega-left">
      <div
        v-for="cat in categories"
        :key="cat.id"
        @mouseenter="setActive(cat)"
        class="mega-left__name"
        :class="{ active: activeCategory.id === cat.id }"
      >
        <img :src="cat.icon" class="mega-left__icon" alt="" />
        {{ cat.name }}
      </div>

    </div>

    <!-- правая колонка -->
    <div class="mega-right" :class="{
        'is-services': activeCategory.slug === 'uslugi',
        'is-two-sections': activeCategory.sections?.length === 2
      }">
      <div
        v-for="section in activeCategory.sections"
        :key="section.title" class="mega-right__block">
        <div class="section-title">
          {{ section.title }}
        </div>
        <div class="section-links" :class="{ 'section-links--2col': section.links.length > 12 }">
        <router-link
          v-for="link in section.links"
          :key="link.slug"
          :to="{ name: 'catalog', 
                 params: { 
                    type: activeCategory.slug, 
                    section: section.slug || section.title_slug || link.slug, // зависит от вашей структуры данных
                    subcategory: link.slug 
                 }
               }"
          @click="menu.close()"
          class="section-link"
        >
          {{ link.name }}
        </router-link>
        </div>
      </div>
    </div>
  </div>
</div>

</template>
<style scoped>
.mega-menu {
  width: 69.688rem;
  height: 32.313rem;
  background: #ffffff;
  border-radius: 1.563rem;
  display: flex;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.12),
    0 2px 6px rgba(0,0,0,0.06);

  overflow: hidden;
}
.mega-left {
  width: 20.313rem;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  border-right: 1px solid #EEEEEE;
  display: flex;
  flex-direction: column;
}
.mega-left::-webkit-scrollbar {
  width: 6px;
}
.mega-left::-webkit-scrollbar-thumb {
  background: var(--btn-bg);
  border-radius: 10px;
  transition: all .3s;
}
.mega-left::-webkit-scrollbar-thumb:hover {
  background: #105965;
}
.mega-left__name {
  padding: 0.75rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.mega-left__name:hover {
  background: #F6F6F6;
}
.mega-left__name.active {
  background: #F0F0F0;
}
.mega-right {
  flex: 1;
  padding: 2.288rem 1.75rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 2.125rem;
  row-gap: 2.125rem;
  overflow-y: scroll;
  height: auto;
  /* column-count: 4; 
  column-gap: 20px; */
}
.mega-right__block {
  display: flex;
  flex-direction: column;
}
.section-title {
  color: var(--btn-bg);
  margin-bottom: 0.938rem;
}
.section-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-link {
  font-size: 0.875rem;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}
.section-link:hover {
  color: var(--btn-bg);
}
.mega-left__icon {
  width: 2.188rem;
  height: 2.188rem;
  object-fit: contain;
}
.mega-right.is-services {
  grid-template-columns: 1fr;
}
.mega-right.is-services .mega-right__block {
  width: 100%;
}
.mega-right.is-services .section-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem 3rem;
  align-items: start;
}
.mega-right.is-pair {
  grid-template-columns: repeat(2, 1fr);
}
.mega-right.is-two-sections {
  grid-template-columns: repeat(2, 1fr);
}
.section-links--2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1.5rem;
  align-items: start;
}
</style>