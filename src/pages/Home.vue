<template>
    <Header />
    <main class="home">
        <MiniVideoSection />
        <CategorySection />
        <ProductSection />
    </main>
    <Footer />
    <AuthModal />
</template>

<script setup>
import Header from '../components/layout/Header.vue';
import Footer from '../components/layout/Footer.vue';
import MiniVideoSection from '../components/video/MiniVideoSection.vue';
import CategorySection from '../components/category/CategorySection.vue';
import ProductSection from '../components/product/ProductSection.vue';
import AuthModal from '../components/modals/AuthModal.vue';


</script>

<style scoped>
.home{
    margin-top: 2.063rem;
}
</style>