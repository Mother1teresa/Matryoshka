import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/Home.vue"),
  },
  {
    path: "/:type/:section/p/:id",
    name: "Product",
    component: () => import("../pages/ProductPage.vue"),
  },
  {
    path: "/:type(tovary|rabota|nedvizhimost|uslugi|transport|biznes|animals|price|travel)/:section?/:subcategory?",
    name: "catalog",
    component: () => import("../pages/CatalogPage.vue"),
  },
  {
    path: "/seller/:id",
    name: "SellerPage",
    component: () => import("../pages/SellerPage.vue"),
  },
  {
    path: '/profile',
    component: () => import('../views/ProfileLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: 'info' },
      { path: 'info', component: () => import('../views/profile/ProfileInfo.vue') },
      { path: 'notifications', component: () => import('../views/profile/ProfilNotifications.vue') },  
      { path: 'messages', component: () => import('../views/profile/ProfilMessages.vue') }, 
      { path: 'reviews', component: () => import('../views/profile/ProfileReviews.vue') },
      // { path: 'advertisements', component: () => import('../views/profile/Messages.vue') }, 
      // ... остальные страницы
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
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
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const saved = localStorage.getItem("auth");
  const isLogged = auth.isAuthenticated || (saved && JSON.parse(saved).isAuthenticated);
  if (!auth.isAuthenticated && saved) {
    auth.loadAuth();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !isLogged) {
    next('/'); 
  } else {
    next();
  }
});
