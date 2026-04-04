// favoritesStore.js
import { defineStore } from "pinia"
import { favoritesApi } from "/src/api/favorites.api.js";
import { useAuthStore } from "./authStore";

export const useFavoritesStore = defineStore("favorites", {
  state: () => ({
    favorites: JSON.parse(localStorage.getItem('user_favorites') || '[]')
  }),

  actions: {
    // Загрузка избранного с сервера (вызывать после логина)
    async fetchFavorites() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return;
      this.isLoading = true;
      try {
        // const res = await favoritesApi.getAll();
        // Допустим, сервер возвращает массив объектов или массив ID
        this.favorites = res.data.map(item => item.id || item);
        this.saveToLocal();
      } catch (e) {
        console.error("Ошибка загрузки избранного:", e);
      } finally {
        this.isLoading = false;
      }
    },

    // 2. Переключение лайка (Локально + API)
    async toggle(productId) {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return "login";

      const index = this.favorites.indexOf(productId);
      const isAdding = index === -1;

      // Оптимистичное обновление (сначала меняем в интерфейсе)
      if (isAdding) {
        this.favorites.push(productId);
      } else {
        this.favorites.splice(index, 1);
      }
      this.saveToLocal();

      try {
        // Отправляем на бэкенд
        if (isAdding) {
          await favoritesApi.add(productId);
        } else {
          await favoritesApi.remove(productId);
        }
      } catch (e) {
        // Если ошибка на сервере — откатываем изменения назад
        console.error("Ошибка синхронизации лайка:", e);
        this.fetchFavorites(); 
      }
    },

    saveToLocal() {
      localStorage.setItem('user_favorites', JSON.stringify(this.favorites));
    },

    // Очистка при выходе
    clear() {
      this.favorites = [];
      localStorage.removeItem('user_favorites');
    }
  },

  getters: {
    isFavorite: (state) => (productId) => state.favorites.includes(productId)
  }
});