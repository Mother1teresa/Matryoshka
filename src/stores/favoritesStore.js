import { defineStore } from 'pinia'
import { ref } from 'vue'
import { favoritesApi } from '/src/api/favorites.api.js'
import { useAuthStore } from '/src/stores/authStore.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const advertFavorites = ref([])
  const favoriteIds = ref(new Set())
  const isLoading = ref(false)

  const isFavorite = (id) => favoriteIds.value.has(String(id))

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
        isFavorite: true,
        image: item.image || item.pictures?.[0]?.pictureUrl || item.pictures?.[0]?.url || '/src/assets/img/placeholder.png',
        city: item.city || item.address || '',
        sellerId: item.sellerId || item.userId,
        seller: null
      }))

      // Догружаем имя и аватар продавца
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
              avatar: s.avatar || s.avatarUrl || '/img/users/mask-avatar.png',
              phone: s.phone || ''
            }
          }
        })
      }

      advertFavorites.value = items
      favoriteIds.value = new Set(items.map(i => String(i.id)))
      return advertFavorites.value
    } catch (e) {
      console.error('Ошибка загрузки избранных объявлений:', e)
      advertFavorites.value = []
      favoriteIds.value = new Set()
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const toggleAdvertFavorite = async (advertId) => {
    const id = String(advertId)
    const currentlyFavorite = isFavorite(id)

    try {
      if (currentlyFavorite) {
        await favoritesApi.removeAdvertFavorite(advertId)
        favoriteIds.value.delete(id)
        advertFavorites.value = advertFavorites.value.filter(a => String(a.id) !== id)
      } else {
        await favoritesApi.addAdvertFavorite(advertId)
        favoriteIds.value.add(id)
      }
      return !currentlyFavorite
    } catch (e) {
      console.error('Ошибка toggle advert favorite:', e)
      throw e
    }
  }

  const removeAdvertFavorite = async (advertId) => {
    const id = String(advertId)
    try {
      await favoritesApi.removeAdvertFavorite(advertId)
      favoriteIds.value.delete(id)
      advertFavorites.value = advertFavorites.value.filter(a => String(a.id) !== id)
      return true
    } catch (e) {
      console.error('Ошибка удаления из избранного:', e)
      throw e
    }
  }

  // Алиасы для обратной совместимости
  const toggle = toggleAdvertFavorite

  const clear = () => {
    advertFavorites.value = []
    favoriteIds.value = new Set()
  }

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