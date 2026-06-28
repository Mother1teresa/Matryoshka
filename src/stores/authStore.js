import { defineStore } from "pinia";
import { router } from "/src/router/index.js";
import { api, resetRefreshCooldown  } from "/src/api/api.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";
import { useRegionModalStore } from "/src/stores/regionModal.js";

export const useAuthStore = defineStore("auth", {
  state: () => {
    const saved = localStorage.getItem("auth");
    console.log("=== AUTH STATE INIT ===");
    console.log("Raw localStorage:", saved);
    try {
      const data = saved ? JSON.parse(saved) : null;
      console.log("Parsed data:", data);
      console.log("user:", data?.user);
      console.log("user.id:", data?.user?.id);
      console.log("isAuthenticated:", data?.isAuthenticated);
      return {
        isAuthenticated: data?.isAuthenticated || false,
        user: data?.user || null,
        allVideos: [],
        welcomeFeed: [],
        isVideosLoading: false,
        allChats: [],
        allNotifications: [],
        isNotificationsLoading: false,
      };
    } catch (e){
      console.error("Auth parse error:", e);
      localStorage.removeItem("auth");
      return {
        isAuthenticated: false,
        user: null,
        allVideos: [],
        welcomeFeed: [],
        allChats: [],
        isVideosLoading: false,
        allNotifications: [],
        isNotificationsLoading: false,
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
    async fetchUserChats() {
      if (!this.user?.id) {
        console.log("Невозможно загрузить чаты: пользователь не авторизован");
        return;
      }
      try {
        const res = await api.get(`/chat/users/${this.user.id}/rooms`);
        const rooms = res.data?.rooms || [];
        this.allChats = rooms.map((room) => {
          const opponent = room.users?.find((u) => u.id !== this.user.id) || {};
          const lastMsg = room.messages && room.messages.length > 0
            ? room.messages[room.messages.length - 1]
            : null;

          return {
            id: room.id,
            productName: "Объявление",
            productImage: "/src/assets/img/mask-avatar.png",
            price: "",
            user: {
              id: opponent.id || "",
              name: opponent.username || opponent.email || "Пользователь",
              avatar: opponent.avatar || "/src/assets/img/mask-avatar.png",
              isOnline: false,
            },
            lastMessage: {
              text: lastMsg ? lastMsg.text : "Сообщений нет",
              isMine: lastMsg ? lastMsg.userId === this.user.id : false,
              isRead: false,
              time: lastMsg && lastMsg.createdAt
                ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            },
          };
        });
      } catch (e) {
        console.error("Ошибка при получении чатов через API:", e.response?.data || e);
        throw e;
      }
    },
    async fetchChatMessages(roomId) {
      try {
        const res = await api.get(`/chat/rooms/${roomId}/messages`);
        const msgs = res.data?.messages || [];
        return {
          messages: msgs.map(msg => ({
            id: msg.id,
            text: msg.text,
            isMine: msg.userId === this.user?.id,
            isRead: false,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            createdAt: msg.createdAt,
          })),
        };
      } catch (e) {
        console.error("Ошибка загрузки сообщений:", e.response?.data || e);
        throw e;
      }
    },
    async sendMessage(roomId, text) {
      try {
        const res = await api.post(`/chat/rooms/${roomId}/messages`, {
          text,
          userId: this.user?.id,
        });
        return res.data;
      } catch (e) {
        console.error("Ошибка отправки сообщения:", e.response?.data || e);
        throw e;
      }
    },
    async createPrivateRoom(userBId) {
      if (!this.user?.id) throw new Error("Пользователь не авторизован");
      try {
        const res = await api.post("/chat/rooms/private", {
          userA: this.user.id,
          userB: userBId,
        });
        return res.data?.roomId;
      } catch (e) {
        console.error("Ошибка создания комнаты:", e.response?.data || e);
        throw e;
      }
    },
    async searchMessages(roomId, query) {
      if (!query.trim()) return [];
      try {
        const res = await api.get(
          `/chat/rooms/${roomId}/messages/search?q=${encodeURIComponent(query)}`
        );
        return res.data?.messages || [];
      } catch (e) {
        console.error("Ошибка поиска:", e.response?.data || e);
        throw e;
      }
    },
    async createAdvert(payload) {
      try {
        const res = await api.post('/advert/create', payload);
        notify("Объявление опубликовано!", "success");
        return res.data;
      } catch (e) {
        console.error("Ошибка создания:", e);
        notify(e.response?.data?.message || "Не удалось опубликовать", "error");
        throw e;
      }
    },
    async fetchMyAdverts() {
      if (!this.isAuthenticated || !this.user?.id) {
        notify("Нужна авторизация для загрузки объявлений");
        return [];
      }
      try {
        const res = await api.get('/advert', {
          params: { userId: this.user.id }
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Ошибка загрузки:", e);
        notify("Не удалось загрузить объявления", "error");
        return [];
      }
    },
    async updateAdvert(payload) {
      try {
        const res = await api.patch('/advert/update', payload);
        notify("Объявление обновлено!", "success");
        return res.data;
      } catch (e) {
        console.error("Ошибка обновления:", e);
        notify(e.response?.data?.message || "Не удалось обновить объявление", "error");
        throw e;
      }
    },
    async updateAdvertStatus(id, status) {
      try {
        await api.patch('/advert/update', { id, status });
        notify(status === 'archive' ? "В архив" : "Опубликовано", "success");
        return true;
      } catch (e) {
        console.error("Ошибка обновления статуса:", e);
        notify("Не удалось обновить статус", "error");
        return false;
      }
    },
    async deleteAdvert(id, s3Key = null) {
      try {
        const params = { id };
        if (s3Key) params.s3Key = s3Key;
        await api.delete('/advert', { params });
        notify("Объявление удалено", "success");
        return true;
      } catch (e) {
        console.error("Ошибка удаления:", e);
        notify("Не удалось удалить", "error");
        return false;
      }
    },
    async getAdvertById(id) {
      try {
        const res = await api.get(`/advert/${id}`);
        return res.data;
      } catch (e) {
        console.error("Ошибка загрузки объявления:", e);
        throw e;
      }
    },
    async fetchAdvertsBySeller(sellerId) {
      if (!sellerId) {
        console.log("fetchAdvertsBySeller: sellerId не передан");
        return [];
      }
      try {
        const res = await api.get('/advert', {
          params: { userId: sellerId }
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Ошибка загрузки товаров продавца:", e);
        notify("Не удалось загрузить объявления продавца", "error");
        return [];
      }
    },
    // лента видео
    async fetchWelcomeFeed({ page = 0, size = 10, seed = 0.5 }) {
      this.isVideosLoading = true;
      try {
        const response = await api.get('/feed/video/welcome-feed', {
          params: { page: Number(page), size: Number(size), seed: Number(seed) }
        });
        
        const shortVideos = response.data || [];
        
        // Просто сохраняем базовые данные, author подтянем позже
        this.welcomeFeed = shortVideos.map(v => ({
          id: v.id,
          likes: v.likes || 0,
          commentsCount: v.commentsCount || 0,
          description: v.description || '',
          createdAt: v.createdAt || '',
          cdnUrl: v.cdnUrl || '',
          views: 0, 
          author: null,
          comments: [],
          isDetailsLoaded: false,
          isVideoReady: false
        }));
        
        return this.welcomeFeed;
      } catch (e) {
        console.error('Ошибка загрузки ленты:', e);
        return [];
      } finally {
        this.isVideosLoading = false;
      }
    },
    async fetchVideo(videoId) {
      try {
        const response = await api.get(`/feed/video/${videoId}`);
        const video = response.data;
        
        return {
          id: video.id,
          cdnUrl: video.cdnUrl || '',
          description: video.description || '',
          likes: video.likes || 0,
          views: video.views || 0,
          commentsCount: video.comments?.length || video.commentsCount || 0,
          createdAt: video.createdAt || '',
          comments: video.comments || [],
          author: {
            id: video.author?.id || '',
            name: video.author?.name || 'Пользователь',
            username: video.author?.name || '',
            avatar: video.author?.avatar || '/public/img/users/mask-avatar.png',
            rating: video.author?.rating
          }
        };
      } catch (e) {
        console.error('Ошибка загрузки видео:', e);
        return null;
      }
    },
    async enrichVideo(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (!video || video.isDetailsLoaded) return video;
      
      const details = await this.fetchVideo(videoId);
      if (!details) return video;
      
      // Обновляем реактивно
      Object.assign(video, {
        views: details.views,
        author: details.author,
        comments: details.comments,
        commentsCount: details.commentsCount,
        isDetailsLoaded: true
      });
      
      return video;
    },
    async addView(videoId, ip) {
      try {
        await api.post('/feed/video/add-view', {
          videoId,
          ip
        });
      } catch (e) {
        console.error('Ошибка просмотра:', e);
      }
    },
    async likeVideo(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (video?.isLikedByMe) return;
      
      try {
        await api.post('/feed/like', { videoId });
        await api.post('/feed/video/mark-as-favorite', { videoId });
        
        if (video) {
          video.isLikedByMe = true;
          video.likes = (video.likes || 0) + 1;
        }
      } catch (e) {
        console.error('Ошибка лайка:', e);
        throw e;
      }
    },
    async unlikeVideo(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (video && !video.isLikedByMe) return;
      
      try {
        await api.post('/feed/unlike', { videoId });
        await api.post('/feed/video/unmark-as-favorite', { videoId });
        
        if (video) {
          video.isLikedByMe = false;
          video.likes = Math.max(0, (video.likes || 0) - 1);
        }
      } catch (e) {
        console.error('Ошибка удаления лайка:', e);
        throw e;
      }
    },
    async toggleLike(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (!video) return;
      
      if (video.isLikedByMe) {
        await this.unlikeVideo(videoId);
        notify("Лайк убран");
      } else {
        await this.likeVideo(videoId);
        notify("Лайк поставлен");
      }
    },
    async fetchLikeCount(videoId) {
      try {
        const response = await api.get('/feed/like-count', {
          params: { videoId }
        });
        return response.data;
      } catch (e) {
        console.error('Ошибка получения лайков:', e);
        return 0;
      }
    },
    async fetchFavorites(userId) {
      try {
        const response = await api.get(`/feed/video/favorites/${userId}`);  // ← исправлено
        const data = response.data || [];
        // favorites возвращает массив объектов с favoriteVideos
        const favoritesData = Array.isArray(data) ? data[0] : data;
        if (favoritesData?.favoriteVideos?.length) {
          const videos = [];
          for (const videoId of favoritesData.favoriteVideos) {
            const video = await this.fetchVideo(videoId);
            if (video) videos.push(video);
          }
          return videos;
        }
        return [];
      } catch (e) {
        console.error('Ошибка загрузки избранного:', e);
        return [];
      }
    },
    async addComment({ userId, videoId, text, parentId }) {
      try {
        const response = await api.post('/feed/comments', {
          userId,
          videoId,
          text,
          parentId
        });
        return response.data;
      } catch (e) {
        console.error('Ошибка комментария:', e);
        throw e;
      }
    },
    async fetchUserViews(userId) {
      try {
        const response = await api.get('/feed/video/user-views', {
          params: { userId }
        });
        return response.data;
      } catch (e) {
        console.error('Ошибка загрузки просмотров:', e);
        return null;
      }
    },
    // конец
    
    saveToStorage() {
      if (!this.user && this.isAuthenticated) {
        console.error("Попытка сохранить пустой профиль!");
        return;
      }
      localStorage.setItem("auth", JSON.stringify({ isAuthenticated: this.isAuthenticated, user: this.user,}),);
    },
    login(user) {
      this.isAuthenticated = true;
      this.user = { ...user };
      this.saveToStorage();
      resetRefreshCooldown();
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
        const res = await api.post("/auth/refresh");
        // Если сервер возвращает новый токен:
        if (res.data?.token) {
          this.user = { ...this.user, token: res.data.token };
          this.saveToStorage(); // обновляем localStorage
        }
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
      if (!this.user?.id) {
        console.error("Нет user.id для fetchProfile");
        return;
      }
      
      try {
        const res = await api.get(`/profile/${this.user.id}`);
        const rawData = res.data;
        
        // 🛠️ Очищаем JsonNullable мусор
        const cleanValue = (val) => {
          if (typeof val === 'string' && val.includes('JsonNullable@')) return null;
          return val;
        };
        
        // 🛠️ Фикс avatarUrl: объект → строка
        const cleanAvatar = (avatar) => {
          if (typeof avatar === 'string') return avatar;
          if (avatar && typeof avatar === 'object') {
            return avatar.cdnUrl || avatar.url || null;
          }
          return null;
        };
        
        const userData = {
          ...rawData,
          email: cleanValue(rawData.email),
          address: cleanValue(rawData.address),
          description: cleanValue(rawData.description),
          avatarUrl: cleanAvatar(rawData.avatarUrl),
          avatar: cleanAvatar(rawData.avatarUrl),
        };
        
        if (userData) {
          this.user = { ...this.user, ...userData, id: this.user.id };
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
      this.isVideosLoading = true;
      try {
        const res = await api.get('/media/video', {
          params: { 
            userId: this.user?.id
          }
        });
        const rawVideos = Array.isArray(res.data) ? res.data : [];

        const enrichedVideos = await Promise.all(rawVideos.map(async (v) => {
          console.log('Processing video:', v.id, 'userId:', v.userId);
          let userData = null;
          if (v.userId) {
            try {
              // const userRes = await api.get(`/users/${v.userId}`);
              // userData = userRes.data;
              console.log('User data:', userData);
            } catch (e) {
              console.log(`Автор ${v.userId} не найден`);
            }
          }

          return {
            ...v,
            s3Key: v.s3Key || v.fileName || v.id,
            thumbnail: v.thumbnailUrl || v.cdnUrl || v.url,
            description: v.description || 'Описание ролика временно недоступно',
            isArchived: v.isArchived || false,
            likes: v.likes || v.likesCount || 0,
            likesCount: v.likesCount || v.likes || 0,
            author: {
              name: userData?.username || userData?.name || 'Пользователь',
              avatar: userData?.avatar || userData?.avatarUrl || maskAvatar,
              city: userData?.city || 'Город не указан',
              rating: userData?.rating || 0,
              deals: userData?.dealsCount || 0
            },
            likesCount: v.likesCount || 0,
            viewsCount: v.viewsCount || 0,
            commentsCount: v.commentsCount || 0, 
            commentsDisabled: v.commentsDisabled || false
          };
        }));

        this.allVideos = enrichedVideos;
      } catch (e) {
        console.error("Ошибка загрузки роликов:", e);
      } finally {
        this.isVideosLoading = false;
      }
    },
    async fetchVideosByUser(userId) {
      this.isVideosLoading = true;
      try {
        const res = await api.get('/media/video', {
          params: { userId }  // бэкенд фильтрует по userId
        });
        const rawVideos = Array.isArray(res.data) ? res.data : [];

        const enrichedVideos = await Promise.all(rawVideos.map(async (v) => {
          let userData = null;
          if (v.userId) {
            try {
              // const userRes = await api.get(`/users/${v.userId}`);
              // userData = userRes.data;
            } catch (e) {
              console.log(`Автор ${v.userId} не найден`);
            }
          }

          return {
            ...v,
            s3Key: v.s3Key || v.fileName || v.id,
            thumbnail: v.thumbnailUrl || v.cdnUrl || v.url,
            description: v.description || 'Описание ролика временно недоступно',
            isArchived: v.isArchived || false,
            likes: v.likes || v.likesCount || 0,
            likesCount: v.likesCount || v.likes || 0,
            author: {
              name: userData?.username || userData?.name || 'Пользователь',
              avatar: userData?.avatar || userData?.avatarUrl || maskAvatar,
              city: userData?.city || 'Город не указан',
              rating: userData?.rating || 0,
              deals: userData?.dealsCount || 0
            },
            viewsCount: v.viewsCount || 0,
            commentsCount: v.commentsCount || 0, 
            commentsDisabled: v.commentsDisabled || false
          };
        }));

        return enrichedVideos;  // ← возвращаем, не сохраняем в allVideos
      } catch (e) {
        console.error("Ошибка загрузки видео пользователя:", e);
        return [];
      } finally {
        this.isVideosLoading = false;
      }
    },
    async deleteVideo(s3Key) {
      if (!this.user?.id) return false;
      try {
        await api.delete('/media', {
          params: { s3Key }
        });
        this.allVideos = this.allVideos.filter(v => v.s3Key !== s3Key);
        return true;
      } catch (e) {
        console.error("Ошибка удаления:", e.response?.data || e.message);
        throw e;
      }
    },
    addVideoLocally(video) {
      this.allVideos = [video, ...this.allVideos];
    },
    toggleArchiveLocal(videoId, status) {
      const video = this.allVideos.find((v) => String(v.id) === String(videoId));
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
      if (!this.user?.id) {
        console.log("Невозможно загрузить уведомления: user.id отсутствует");
        return;
      }
      this.isNotificationsLoading = true;
      try {
        const res = await api.get('/notifications');
        this.allNotifications = (res.data || []).map(n => ({
          id: n.id,
          title: 'Уведомление',           // API не отдаёт title, можно захардкодить или парсить из message
          message: n.message,
          date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('ru-RU') : '',
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '',
          is_read: false,                  // API не отдаёт статус прочтения — пока все как непрочитанные
          createdAt: n.createdAt
        }));
      } catch (e) {
        console.error("Ошибка уведомлений:", e);
        this.allNotifications = [];
      } finally {
        this.isNotificationsLoading = false;
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
