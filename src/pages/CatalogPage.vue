<script setup>
import { computed, watchEffect, onMounted  } from "vue";
import { useRoute, useRouter } from "vue-router";
import { categories } from "/src/data/categories.js";
import { useMenuStore } from "/src/stores/menu.js";
import Header from "../components/layout/Header.vue";
import Footer from "../components/layout/Footer.vue";
import ProductsGrid from "/src/components/catalog/ProductsGrid.vue";
import HorizontalList from "/src/components/catalog/HorizontalList.vue";
import CatalogFilter from "/src/components/catalog/CatalogFilter.vue";
const menu = useMenuStore();
const route = useRoute();
const router = useRouter();
const type = computed(() => route.params.type);
const sectionSlug = computed(() => route.params.section);
const subcategory = computed(() => route.params.subcategory);
const currentCategory = computed(() =>
  categories.find((c) => c.slug === type.value),
);
const tabs = computed(() => {
  if (!currentCategory.value) return [];
  return currentCategory.value.sections.flatMap((s) =>
    !s.title || s.title.trim() === ""
      ? s.links || []
      : [{ name: s.title, slug: s.slug }],
  );
});
const subLinks = computed(() => {
  if (!currentCategory.value) return [];
  for (const section of currentCategory.value.sections) {
    if (!section.title || section.title.trim() === "") {
      const link = section.links?.find((l) => l.slug === sectionSlug.value);
      if (link?.subLinks) return link.subLinks;
    }
  }
  return [];
});
const activeTabItem = computed(() => {
  if (!currentCategory.value) return null;
  return (
    currentCategory.value.sections.find((s) => s.slug === sectionSlug.value) ||
    currentCategory.value.sections
      .flatMap((s) => s.links || [])
      .find((l) => l.slug === sectionSlug.value)
  );
});
const breadcrumbSectionName = computed(
  () => activeTabItem.value?.title || activeTabItem.value?.name,
);
const breadcrumbSubName = computed(() => {
  if (!activeTabItem.value || !subcategory.value) return null;
  const list = activeTabItem.value.links || activeTabItem.value.subLinks || [];
  return list.find((item) => item.slug === subcategory.value)?.name;
});
const filterType = computed(() => {
  if (type.value === "rabota") return "jobs";
  if (type.value === "nedvizhimost") return "realty";
  if (type.value === "uslugi") return "uslugi";
  if (type.value === "transport") return "transport";
  if (type.value === "biznes") return "business"; 
  if (type.value === "animals") return "animals"; 
  return "price";
});
const pageConfig = computed(() => ({
  component: type.value === "tovary" ? ProductsGrid : HorizontalList,
  filterType: filterType.value,
}));

watchEffect(() => {
  if (!currentCategory.value) return;
  if (!sectionSlug.value && tabs.value.length > 0) {
    router.replace({
      name: "catalog",
      params: { ...route.params, section: tabs.value[0].slug },
    });
    return;
  }
  // Если выбран раздел, но нет подкатегории, а subLinks есть — выбираем первую
  if (sectionSlug.value && !subcategory.value && subLinks.value.length > 0) {
    router.replace({
      name: "catalog",
      params: { ...route.params, subcategory: subLinks.value[0].slug },
    });
  }
});
onMounted(() => {
  const exists = categories.find(c => c.slug === route.params.type);
  if (!exists) {
    router.replace({ name: 'NotFound' });
  }
});
</script>
<template>
  <Header />
  <div class="container">
    <div class="breadcrumbs">
      <a href="/">Главная</a> → {{ currentCategory?.name }}
      <span v-if="breadcrumbSectionName"> → {{ breadcrumbSectionName }}</span>
      <span v-if="breadcrumbSubName"> → {{ breadcrumbSubName }}</span>
    </div>
    <div class="catalog-title">
      <img :src="currentCategory?.icon" />
      {{ currentCategory?.name }}
    </div>
    <div class="catalog-tabs">
      <div class="titcategories">
        <router-link v-for="tab in tabs" :key="tab.slug" :to="{ name: 'catalog', params: { type, section: tab.slug } }" class="tab-btn" :class="{ active: sectionSlug === tab.slug }">
          {{ tab.name }}
        </router-link>
        <button class="tab-btn" @click="menu.open()">Все подкатегории</button>
      </div>
      <div v-if="subLinks.length" class="subcategories">
        <router-link v-for="link in subLinks" :key="link.slug" :to="{ name: 'catalog', params: { type, section: sectionSlug, subcategory: link.slug },}" class="sub-btn" :class="{ active: subcategory === link.slug }">
          {{ link.name }}
        </router-link>
      </div>
    </div>
    <CatalogFilter :type="pageConfig.filterType" />
    <component :is="pageConfig.component" :category="type" :subcategory="subcategory" :filters="route.query"/>
  </div>
  <Footer />
</template>

<style scoped>
.breadcrumbs {
  color: #8e8c8c;
  font-size: 0.875rem;
  margin-bottom: 1.063rem;
  margin-top: 1.375rem;
  display: inline-block;
  align-items: center;
}
.catalog-title {
  width: fit-content;
  padding: 0.825rem 1rem;
  padding-right: 1.75rem;
  color: var(--btn-bg);
  font-weight: 500;
  font-size: 1.25rem;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 0.938rem;
  background-color: white;
  transition:
    opacity 0.3s,
    box-shadow 0.3s;
  margin-bottom: 1.738rem;
}
.catalog-title img {
  height: 2.188rem;
  width: auto;
}
.catalog-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.tab-btn {
  padding: 0.938rem;
  font-size: 1.115rem;
  border-radius: 0.938rem;
  background: #eeeeee;
}

.tab-btn.active {
  background: white;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
}
.titcategories {
  display: flex;
  gap: 0.75rem;
  column-gap: 0.5rem;
  height: fit-content;
  flex-wrap: wrap;
}

.subcategories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-left: 5rem;
  height: fit-content;
}
.sub-btn {
  padding: 0.938rem;
  border-radius: 0.938rem;
  background: #eeeeee;
  font-size: 1.115rem;
  width: 12.313rem;
}
.sub-btn.active {
  background: white;
  box-shadow: 0px 0.2rem 0.2rem 0px #00000040;
}
</style>
