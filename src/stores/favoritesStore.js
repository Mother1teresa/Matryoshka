import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favoritesApi } from '/src/api/favorites.api.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const advertFavorites = ref([])
  const isLoading = ref(false)
  const isFavorite = (id) => {
    return advertFavorites.value.some(a => String(a.id) === String(id))
  }

  const fetchAdvertFavorites = async () => {
    isLoading.value = true
    try {
      const res = await favoritesApi.getAdvertFavorites()
      advertFavorites.value = (res.data || []).map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category,
        subCategory: item.subCategory,
        address: item.address,
        isFavorite: item.isFavorite,
        image: '/src/assets/img/placeholder.png', // API не возвращает картинку, подставим placeholder
        city: item.address || '',
        seller: null
      }))
      return advertFavorites.value
    } catch (e) {
      console.error('Ошибка загрузки избранных объявлений:', e)
      advertFavorites.value = []
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const toggleAdvertFavorite = async (advertId) => {
    try {
      await favoritesApi.toggleAdvertFavorite(advertId)
      await fetchAdvertFavorites()
      return true
    } catch (e) {
      console.error('Ошибка toggle advert favorite:', e)
      throw e
    }
  }
  const toggle = toggleAdvertFavorite;
  const clear = () => { advertFavorites.value = []; };
  return {
    advertFavorites,
    isLoading,
    isFavorite,
    fetchAdvertFavorites,
    toggleAdvertFavorite,
    toggle,
    clear,
}})