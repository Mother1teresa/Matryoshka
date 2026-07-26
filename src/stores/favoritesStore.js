import { defineStore } from 'pinia'
import { ref } from 'vue'
import { favoritesApi } from '/src/api/favorites.api.js'
import { useAuthStore } from '/src/stores/authStore.js'

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

      const items = (res.data || []).map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category,
        subCategory: item.subCategory,
        subcategory: item.subCategory,
        section: item.section || item.subCategory || 'default',
        address: item.address,
        isFavorite: item.isFavorite,
        image: item.image || item.pictures?.[0]?.pictureUrl || item.pictures?.[0]?.url || '/src/assets/img/placeholder.png',
        city: item.city || item.address || '',
        sellerId: item.sellerId || item.userId,
        seller: null
      }))

      // Догружаем имя и аватар продавца так же, как на ProductPage.vue
      const authStore = useAuthStore()
      const sellerIds = [...new Set(items.map(i => i.sellerId).filter(Boolean))]

      if (sellerIds.length > 0) {
        const sellers = await Promise.all(
          sellerIds.map(id => authStore.fetchProfileById(id).catch(() => null))
        )

        const sellerMap = {}
        sellers.forEach(s => { if (s) sellerMap[s.id] = s })

        items.forEach(item => {
          if (item.sellerId && sellerMap[item.sellerId]) {
            const s = sellerMap[item.sellerId]
            item.seller = {
              id: s.id,
              name: s.name || s.username || 'Продавец',
              avatar: s.avatar || s.avatarUrl || '/src/assets/img/mask-avatar.png',
              phone: s.phone || ''
            }
          }
        })
      }

      advertFavorites.value = items
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

  /** Явное удаление через DELETE (для страницы «Избранные») */
  const removeAdvertFavorite = async (advertId) => {
    try {
      await favoritesApi.removeAdvertFavorite(advertId)
      advertFavorites.value = advertFavorites.value.filter(
        a => String(a.id) !== String(advertId)
      )
      return true
    } catch (e) {
      console.error('Ошибка удаления из избранного:', e)
      throw e
    }
  }

  const toggle = toggleAdvertFavorite
  const clear = () => { advertFavorites.value = [] }

  return {
    advertFavorites,
    isLoading,
    isFavorite,
    fetchAdvertFavorites,
    toggleAdvertFavorite,
    removeAdvertFavorite,
    toggle,
    clear,
  }
})