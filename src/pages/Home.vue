<template>
    <Header />
    <main class="home">
        <MiniVideoSection />
        <CategorySection />
        <ProductSection />
    </main>
</template>

<script setup>
import Header from '../components/layout/Header.vue';
import MiniVideoSection from '../components/video/MiniVideoSection.vue';
import CategorySection from '../components/category/CategorySection.vue';
import ProductSection from '../components/product/ProductSection.vue';
</script>

<style scoped>
.home{
    margin-top: 2.063rem;
}
</style>