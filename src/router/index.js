import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/:type(tovary|rabota|nedvizhimost|uslugi|transport|biznes|animals|price|travel)/:section?/:subcategory?',
    name: 'catalog',
    component: () => import('../pages/CatalogPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/common/NotFound.vue')
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes
})