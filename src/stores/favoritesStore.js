import { defineStore } from "pinia"
import { useAuthStore } from "./authStore"

export const useFavoritesStore = defineStore("favorites", {

  state: () => ({
    favorites: []
  }),

  actions: {
    toggle(productId) {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) {
        alert("Войдите или зарегистрируйтесь")
        return false
      }
      const index = this.favorites.indexOf(productId)

      if (index === -1) {
        this.favorites.push(productId)
        return true
      } else {
        this.favorites.splice(index, 1)
        return false
      }
    }
  },

  getters: {
    isFavorite: (state) => {
      return (productId) =>
        state.favorites.includes(productId)
    }
  }
})