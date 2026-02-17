import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {

  state: () => ({
    isAuthenticated: false,
    user: null
  }),

  actions: {
    login() {
      this.isAuthenticated = true
      this.user = {
        id: 1,
        name: "Сергей",
        avatar: "https://i.pravatar.cc/100"
      }
      // сохраняем в localStorage
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: this.isAuthenticated,
        user: this.user
      }))
    },
    logout() {
      this.isAuthenticated = false
      this.user = null

      localStorage.removeItem("auth")
      // сбрасываем лайки товаров
      localStorage.removeItem("products")
    },
    loadAuth() {
      const saved = localStorage.getItem("auth")
      if (saved) {
        const data = JSON.parse(saved)
        this.isAuthenticated = data.isAuthenticated
        this.user = data.user
      }
    }
  }
})