import { defineStore } from "pinia"
import { api } from "/src/api/api.js"
const maskAvatar = 'src/assets/img/mask-avatar.png'

export const useAuthStore = defineStore("auth", {

  state: () => ({
    isAuthenticated: false,
    user: null,
    token: null
  }),

  actions: {
    login(userData) {
      this.isAuthenticated = true
      const user = userData.user || userData
      this.user = {
        id: user.id,
        name: user.name,
        avatar: user.avatar || maskAvatar
      }
      this.token = userData.token || this.token
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: this.isAuthenticated,
        user: this.user,
        token: this.token
      }))
    },

    // Исправлено: принимаем объект { email, password }
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/login", { login:email, password })
        if (res.data.user) {
          // Вызываем наш метод login для обновления состояния и localStorage
          this.login(res.data)
        }

        if (res.data.token) {
          localStorage.setItem("token", res.data.token)
        }

        return true
      } catch (e) {
        console.error("Login error:",  e.response?.data || e)
        throw e
      }
    },

    async registerAPI(userData) {
      try {
        const res = await api.post("/register", userData)
        if (res.data && res.data.user) {
          this.login(res.data)
        }
        return res.data
      } catch (e) {
        console.error("Register error:", e)
        throw e
      }
    },

    async verifyCodeAPI(payload) { // Принимаем готовый объект payload
      try {
        // Шлем ровно то, что пришло (без ручного перечисления полей)
        const res = await api.post("/check-code", payload);
        return res.data;
      } catch (e) {
        console.error("Ошибка в verifyCodeAPI:", e.response?.data);
        throw e;
      }
    },

    async sendSms(phone) {
      return await api.post("/sendsms", { phone })
    },
    async completeRegistrationAPI(data) {
      try {
        // data должен содержать { name, phone, email, password }
        const res = await api.post("/auth/complete-registration", data)
        const result = res.data
        this.token = result.token
        this.login({
          id: result.user.id,
          name: result.user.name,
          avatar: result.user.avatar
        })
        localStorage.setItem("token", result.token)
        return result
      } catch (e) {
        console.error("Complete registration error:", e)
        throw e
      }
    },
    /* ---------------- LOGOUT ---------------- */

    logout() {
      this.isAuthenticated = false
      this.user = null
      this.token = null

      localStorage.removeItem("auth")
      localStorage.removeItem("products")
      localStorage.removeItem("token")
    },
    /* ---------------- LOAD AUTH ---------------- */

    loadAuth() {
      const saved = localStorage.getItem("auth")
      const token = localStorage.getItem("token")
      if (saved) {
        const data = JSON.parse(saved)
        this.isAuthenticated = data.isAuthenticated
        this.user = data.user
      }
      if (token) {
        this.token = token
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      }
    }
  }
})