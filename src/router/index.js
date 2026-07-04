import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
const routes = [
  {
    path: "/",
    name: "Home",
    meta: { title: 'Матрешка — доска объявлений' },
    component: () => import("../pages/Home.vue"),
  },
  {
    path: "/:type/:section/p/:id",
    name: "Product",
    meta: { title: 'Товар' },
    component: () => import("../pages/ProductPage.vue"),
  },
  {
    path: "/:type(tovary|rabota|nedvizhimost|uslugi|transport|biznes|animals|price|travel)/:section?/:subcategory?",
    name: "catalog",
    meta: { title: 'Каталог' },
    component: () => import("../pages/CatalogPage.vue"),
  },
  {
    path: "/seller/:id",
    name: "SellerPage",
    meta: { title: 'Продавец' },
    component: () => import("../pages/SellerPage.vue"),
  },
  {
    path: '/search',
    name: 'Search',
    meta: { title: 'Поиск' },
    component: () => import('../pages/SearchPage.vue')
  },
  {
    path: '/profile',
    meta: { title: 'Личный кабинет', requiresAuth: true },
    component: () => import('../views/ProfileLayout.vue'),
    children: [
      { path: '', redirect: 'info' },
      { path: 'info', meta: { title: 'Профиль' }, component: () => import('../views/profile/ProfileInfo.vue') },
      { path: 'notifications', meta: { title: 'Уведомления' }, component: () => import('../views/profile/ProfilNotifications.vue') },
      { path: 'messages', meta: { title: 'Сообщения' }, component: () => import('../views/profile/ProfilMessages.vue') },
      { path: 'messages/:id', name: 'ChatDetail', meta: { title: 'Чат' }, component: () => import('../views/profile/ChatDetail.vue') },
      { path: 'reviews', meta: { title: 'Отзывы' }, component: () => import('../views/profile/ProfileReviews.vue') },
      { path: 'videos', meta: { title: 'Мои видео' }, component: () => import('../views/profile/MyVideos.vue') },
      { path: 'advertisements', meta: { title: 'Мои объявления' }, component: () => import('../views/profile/MyAdvertisements.vue') },
      { path: 'favorites', meta: { title: 'Избранное' }, component: () => import('../views/profile/Favorites.vue') },
      { path: 'create-ad', meta: { title: 'Создать объявление' }, component: () => import('../views/profile/CreateAd.vue') },
      { path: 'edit-ad/:id', name: 'EditAd', meta: { title: 'Редактировать объявление' }, component: () => import('../views/profile/CreateAd.vue') }
    ]
  },
  {
    path: '/shorts/:id?',
    name: 'shorts',
    meta: { title: 'Shorts' },
    component: () => import('../pages/ShortsPage.vue')
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    meta: { title: 'Страница не найдена' },
    component: () => import("../components/common/NotFound.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
});
router.afterEach((to) => {
  const title = to.meta?.title || 'Матрешка';
  document.title = title;
});
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const isLogged = auth.isAuthenticated;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !isLogged) {
    next('/'); 
  } else {
    next();
  }
});
export default router; 