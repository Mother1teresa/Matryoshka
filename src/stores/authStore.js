import { defineStore } from "pinia";
import { router } from "/src/router/index.js";
import { api } from "/src/api/api.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";
import { useRegionModalStore } from "/src/stores/regionModal.js";

export const useAuthStore = defineStore("auth", {
  state: () => {
    const saved = localStorage.getItem("auth");
    try {
      const data = saved ? JSON.parse(saved) : null;
      return {
        isAuthenticated: data?.isAuthenticated || false,
        user: data?.user || null,
        allVideos: [],
        isVideosLoading: false,
        allChats: [],
        allNotifications: [],
        isNotificationsLoading: false,
      };
    } catch {
      localStorage.removeItem("auth");
      return {
        isAuthenticated: false,
        user: null,
        allVideos: [],
        allChats: [],
      };
    }
  },
  getters: {
    userAvatar: (state) =>
      state.user?.avatarUrl || state.user?.avatar || maskAvatar,
    formattedPhone: (state) => {
      const phone = state.user?.phone;
      if (!phone) return "Не указан";
      const cleaned = ("" + phone).replace(/\D/g, "");
      const match = cleaned.match(/^(\d|7|8)(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+7 (${match[2]}) ${match[3]} ${match[4]}-${match[5]}`;
      }
      return phone;
    },
    unreadMessagesCount: (state) => {
      return state.allChats.filter(
        (chat) =>
          chat.lastMessage &&
          !chat.lastMessage.isRead &&
          !chat.lastMessage.isMine,
      ).length;
    },
    unreadNotificationsCount: (state) => {
      return state.allNotifications.filter((note) => !note.is_read).length;
    },
  },
  actions: {
      saveToStorage() {
    // Если данных нет, не затираем старые (или логируем ошибку)
    if (!this.user && this.isAuthenticated) {
      console.error("Попытка сохранить пустой профиль!");
      return;
    }
    
    localStorage.setItem(
      "auth",
      JSON.stringify({
        isAuthenticated: this.isAuthenticated,
        user: this.user,
      }),
    );
  },

    login(user) {
      this.isAuthenticated = true;
      this.user = { ...user };
      this.saveToStorage();
    },
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/auth/login", { login: email, password });
        if (res.data && res.data.user) {
          this.login(res.data.user);
          if (res.data.user.city) {
            useRegionModalStore().setRegion(
              res.data.user.city,
              res.data.user.coordinates || [37.6173, 55.7558],
            );
          }
          await useFavoritesStore()
            .fetchFavorites()
            .catch(() => {});
          return true;
        }
      } catch (e) {
        console.error("Login error:", e.response?.data || e);
        throw e;
      }
    },
    async registerAPI(userData) {
      try {
        const res = await api.post("/auth/register", userData);
        if (res.data && res.data.user) {
          this.login(res.data.user);
        }
        return res.data;
      } catch (e) {
        console.error("Register error:", e.response?.data || e);
        throw e;
      }
    },
    async refreshToken() {
      try {
        await api.post("/auth/refresh");
        return true;
      } catch (e) {
        throw e;
      }
    },
    async verifyCodeAPI(payload) {
      try {
        const res = await api.post("/auth/check-code", payload);
        return res.data;
      } catch (e) {
        console.error("Ошибка в verifyCodeAPI:", e.response?.data);
        throw e;
      }
    },
    async sendSms(phone) {
      return await api.post("/auth/sendsms", { phone });
    },
    async fetchProfile() {
      try {
        const res = await api.get("/profile/");
        const userData = res.data.user;
        if (userData) {
          this.user = { ...this.user, ...userData };
          this.isAuthenticated = true;
          this.saveToStorage();
          const regionStore = useRegionModalStore();
          if (userData.city) {
            regionStore.setRegion(
              userData.city,
              userData.coordinates || [37.6173, 55.7558],
            );
          }
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (e.response?.data?.code === "SESSION_EXPIRED") this.logout();
      }
    },
    async fetchVideos() {
      if (!this.user?.id) return;
      this.isVideosLoading = true;
      try {
        const res = await api.get(`/media/user/${this.user.id}`);
        this.allVideos = (res.data.data || []).map((v) => ({
          ...v,
          isArchived: false,
          thumbnail: v.previewUrl || v.cdnUrl || v.url,
        }));
      } catch (e) {
        console.error("Ошибка загрузки роликов:", e);
      } finally {
        this.isVideosLoading = false;
      }
    },
    async deleteVideo(id) {
  if (!this.user?.id || !this.user?.token) return false;
  try {
    // В документации параметр называется videoId, а не mediaId
    await api.delete(`/media/user/${this.user.id}`, {
      params: { 
        videoId: id, // Исправлено с mediaId
        // geocode: '0,0' // Если в доке этого нет, лучше убрать или уточнить у бэка
      },
      headers: {
        Authorization: `Bearer ${this.user.token}`
      }
    });

    // Обновляем только локальный стейт (в памяти)
    this.allVideos = this.allVideos.filter(v => v.id !== id);
    
    // saveToStorage здесь по сути бесполезен, так как он не сохраняет allVideos,
    // но если оставить, то он просто лишний раз перезапишет данные юзера.
    return true;
  } catch (e) {
    console.error("Ошибка при удалении:", e);
    throw e;
  }
},


    toggleArchiveLocal(videoId, status) {
      const video = this.allVideos.find((v) => v.id === videoId);
      if (video) {
        video.isArchived = status;
      }
    },
    async validateAndFormatCity(query) {
      if (!query || query.length < 3) return null;
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=ab3a562f-41f9-4eb0-94ab-b982e13c7742&format=json&geocode=${encodeURIComponent(query)}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        const feature =
          data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        return feature ? feature.name : null;
      } catch (e) {
        console.error("Ошибка геокодера:", e);
        return null;
      }
    },
    async fetchUserNotifications() {
      if (!this.user?.id) return;
      this.isNotificationsLoading = true;
      try {
        // const res = await api.get('/notifications');
        // this.allNotifications = res.data.notifications || [];
      } catch (e) {
        console.error("Ошибка уведомлений:", e);
        // Если API пока нет, можно оставить моки прямо здесь для тестов:
        this.allNotifications = [
          {
            id: 1,
            title: "Объявление опубликовано",
            message: "Ваш товар 'Дождевик чугунный' успешно прошел модерацию.",
            date: "15 нояб.",
            time: "12:30",
            is_read: true,
          },
          {
            id: 2,
            title: "Новый отзыв",
            message: "Пользователь Иван оставил отзыв о вашем товаре.",
            date: "14 нояб.",
            time: "10:15",
            is_read: false,
          },
          {
            id: 3,
            title: "Объявление отклонено",
            message: "Ваше объявление не соответствует правилам площадки.",
            reason: "Некорректная категория",
            date: "13 нояб.",
            time: "09:00",
            is_read: false,
          },
        ];
      } finally {
        this.isNotificationsLoading = false;
      }
    },
    async fetchFavorites(type) {
      // Выбираем эндпоинт: видео или айтемы (вместо ads)
      const endpoint =
        type === "videos" ? "/favorites/videos" : "/favorites/items";
      try {
        // const res = await api.get(endpoint);
        return res.data.data || [];
      } catch (e) {
        console.error("Ошибка загрузки избранного:", e);
        return [];
      }
    },

    async removeFromFavorites(id) {
      try {
        // await api.delete(`/favorites/${id}`);
        return true;
      } catch (e) {
        console.error("Ошибка удаления из избранного:", e);
        return false;
      }
    },
    async fetchUserChats() {
      try {
        // const res = await api.get('/chats');
        // Предполагаем, что бэкенд возвращает { chats: [...] }
        // this.allChats = res.data.chats || [];
        return this.allChats;
      } catch (e) {
        console.error("Ошибка загрузки списка чатов:", e);
        throw e;
      }
    },
    async getOrCreateChat(sellerId, productId) {
      if (!this.isAuthenticated) throw new Error("UNAUTHORIZED");
      try {
        // const res = await api.post('/chats/get-or-create', { sellerId, productId });

        // Возвращаем ID чата (проверь, как именно бэк отдает: res.data.id или res.data.chatId)
        return res.data.chatId || res.data.id;
      } catch (e) {
        console.error("Ошибка при создании чата в Store:", e);
        throw e;
      }
    },
    async fetchChatMessages(chatId) {
      try {
        // const res = await api.get(`/chats/${chatId}`);
        return res.data; // Ожидаем { chat: {...}, messages: [...] }
      } catch (e) {
        console.error("Ошибка загрузки сообщений:", e);
        throw e;
      }
    },
    async sendMessage(chatId, text) {
      try {
        // await api.post(`/chats/${chatId}/send`, { text });
      } catch (e) {
        console.error("Ошибка отправки:", e);
        throw e;
      }
    },
    async markChatAsRead(chatId) {
      try {
        // await api.post(`/chats/${chatId}/read`);
      } catch (e) {
        console.error("Ошибка прочтения:", e);
      }
    },
    async logout() {
      this.isAuthenticated = false;
      this.user = null;
      useRegionModalStore().$patch({
        selectedRegion: null,
        coordinates: [37.6173, 55.7558],
      });
      ["auth", "region", "regionCoords", "products"].forEach((key) =>
        localStorage.removeItem(key),
      );
      useFavoritesStore().clear();

      const favStore = useFavoritesStore();
      favStore.clear();

      if (window.location.pathname !== "/") {
        try {
          await router.push("/");
        } catch (e) {
          window.location.href = "/";
        }
      }
    },
  },
});
