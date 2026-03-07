import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/:type(rabota|nedvizhimost|uslugi|transport|biznes|animals|price|travel)/:section?/:subcategory?',
    name: 'catalog',
    component: () => import('/src/pages/CatalogPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/common/NotFound.vue') // Или ваш компонент
  }
]

export const router = createRouter({
  history: createWebHistory('/Matryoshka/'),
  routes
})