import { defineStore } from "pinia";
import { Client } from '@stomp/stompjs';
import { markRaw, ref } from 'vue';
import { api, resetRefreshCooldown } from "/src/api/api.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";
import { useRegionModalStore } from "/src/stores/regionModal.js";
import { geocodeByQuery } from '/src/utils/geocode.js';
import { notify } from "/src/utils/notify";

let stompClient = null;

export const useAuthStore = defineStore("auth", {
  state: () => {
    const saved = localStorage.getItem("auth");
    try {
      const data = saved ? JSON.parse(saved) : null;
      return {
        isAuthenticated: data?.isAuthenticated || false,
        user: data?.user || null,
        allVideos: [],
        welcomeFeed: [],
        isVideosLoading: false,
        allChats: [],
        allNotifications: [],
        isNotificationsLoading: false,
        // === STOMP ===
        _stompConnected: false,
        // === POLLING ===
        _pollingIntervals: {}, // roomId -> intervalId
        _lastMessageIds: {}, 
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
        _stompConnected: false,
        _pollingIntervals: {},
        _lastMessageIds: {},
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
      return state.allChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
    },
    unreadNotificationsCount: (state) => {
      return state.allNotifications.filter((note) => !note.is_read).length;
    },
    isStompConnected: (state) => state._stompConnected,
  },
  actions: {
   _stompClient: null,
    getSocket() {
      return this._stompClient;
    },
    initSocket() {
      console.log('[initSocket] START (Native WebSocket)');
      
      if (this._stompClient?.connected) return this._stompClient;
      if (!this.user?.id) {
        console.log('[initSocket] NO USER ID');
        return null;
      }
      
      let wsUrl;
      if (import.meta.env.DEV) {
        wsUrl = `ws://${window.location.host}/chat-websocket`;
      } else {
        wsUrl = `ws://85.198.96.229:8080/chat-websocket`;
      }

      console.log('[initSocket] Connecting to:', wsUrl);
      const client = new Client({
        webSocketFactory: () => new WebSocket(wsUrl),
        debug: (str) => console.log('[STOMP]', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 10000,
      });
      
      let reconnectAttempts = 0;
      const MAX_RECONNECT_ATTEMPTS = 3;

      client.onConnect = (frame) => {
        console.log('[STOMP] Connected');
        this._stompConnected = true;
        reconnectAttempts = 0;
      };
      
      client.onDisconnect = () => {
        console.log('[STOMP] Disconnected');
        this._stompConnected = false;
      };
      
      client.onStompError = (frame) => {
        console.error('[STOMP] Error:', frame.headers['message']);
        this._stompConnected = false;
      };
      
      client.onWebSocketError = (event) => {
        console.error('[STOMP] WebSocket Error:', event);
        this._stompConnected = false;
      };
      
      client.onWebSocketClose = (event) => {
        console.log('[STOMP] WebSocket Closed:', event.code, event.reason);
        this._stompConnected = false;
        
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('[STOMP] Лимит попыток исчерпан, переходим на polling');
          client.deactivate();
          this._stompClient = null;
        }
      };
      try {
        client.activate();
      } catch (e) {
        console.error('[STOMP] Activate error:', e);
        return null;
      }
      
      this._stompClient = markRaw(client);
      return this._stompClient;
    },
    
    disconnectSocket() {
      console.log('[disconnectSocket]');
      
      if (this._stompClient) {
        try {
          this._stompClient.reconnectDelay = 0;
          this._stompClient.deactivate();
        } catch (e) {
          console.error('[disconnectSocket] Error:', e);
        }
        this._stompClient = null;
      }
      this._stompConnected = false;
    },

    // ========== POLLING (Fallback) ==========
    startMessagePolling(roomId, onNewMessage) {
      // Останавливаем предыдущий polling для этой комнаты
      this.stopMessagePolling(roomId);
      
      console.log(`[Polling] Started for room ${roomId}`);
      
      const poll = async () => {
        try {
          const { messages } = await this.fetchChatMessages(roomId);
          
          if (messages && messages.length > 0) {
            const lastId = this._lastMessageIds[roomId];
            const newMessages = lastId 
              ? messages.filter(m => m.id > lastId)
              : messages;
            
            if (newMessages.length > 0) {
              this._lastMessageIds[roomId] = messages[messages.length - 1].id;
              newMessages.forEach(msg => onNewMessage?.(msg));
            }
          }
        } catch (e) {
          console.error(`[Polling] Error for room ${roomId}:`, e);
        }
      };
      
      // Первый запрос сразу
      poll();
      
      // Затем каждые 3 секунды
      this._pollingIntervals[roomId] = setInterval(poll, 3000);
    },
    
    stopMessagePolling(roomId) {
      if (this._pollingIntervals[roomId]) {
        clearInterval(this._pollingIntervals[roomId]);
        delete this._pollingIntervals[roomId];
        console.log(`[Polling] Stopped for room ${roomId}`);
      }
    },
    
    stopAllPolling() {
      Object.keys(this._pollingIntervals).forEach(roomId => {
        this.stopMessagePolling(roomId);
      });
      this._lastMessageIds = {};
    },

    // ========== CHAT ACTIONS ==========
    async subscribeToRoom(roomId, onMessage) {
      const client = this.initSocket();
      if (client && client.connected) {
        const subscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
          const body = JSON.parse(message.body);
          onMessage?.(body);
        });
        console.log(`[subscribeToRoom] WebSocket subscription for room ${roomId}`);
        return { type: 'websocket', subscription };
      } else {
        console.log(`[subscribeToRoom] Using polling for room ${roomId}`);
        this.startMessagePolling(roomId, onMessage);
        return { type: 'polling' };
      }
    },

    async sendMessage(roomId, text) {
      const client = this.getSocket();
      
      if (client?.connected) {
        client.publish({
          destination: `/app/chat.sendMessage/${roomId}`,
          body: JSON.stringify({
            senderId: this.user?.id,
            message: text,
          })
        });
        console.log('[sendMessage] Sent via STOMP');
      } else {
        console.log('[sendMessage] STOMP unavailable, using HTTP fallback');
        await api.post(`/chat/rooms/${roomId}/messages`, {
          message: text,
          senderId: this.user?.id
        });
      }
    },
    async markMessageAsRead(messageId, roomId) {
      try {
        await api.patch(`/chat/messages/${messageId}/read?roomId=${roomId}`);
      } catch (e) {
        console.error('Ошибка markMessageAsRead:', e.response?.data || e);
        throw e;
      }
    },
    async createTestRoom() {
      if (!this.user?.id) throw new Error("Пользователь не авторизован");
      
      try {
        const res = await api.post("/chat/create-room", {
          userA: this.user.id,
          userB: this.user.id,
        });
        
        const roomId = res.data?.roomId || res.data?.id;
        console.log('[createTestRoom] Created room:', roomId);
        
        // Перезагружаем чаты, чтобы новая комната появилась в списке
        await this.fetchUserChats();
        
        return roomId;
      } catch (e) {
        console.error("Ошибка создания тестовой комнаты:", e.response?.data || e);
        throw e;
      }
    },
    async fetchUserChats() {
      if (!this.user?.id) {
        console.log("Невозможно загрузить чаты: пользователь не авторизован");
        return;
      }
      try {
        const res = await api.get('/chat/user-rooms');
        const rooms = res.data || [];
        this.allChats = rooms.map((room) => {
          const opponent = room.users?.find((u) => u.id !== this.user.id) || {};
          const lastMsg = room.messages && room.messages.length > 0
            ? room.messages[room.messages.length - 1]
            : null;

          const unreadCount = room.messages?.filter(
            m => m.senderId !== this.user.id && !m.isRead
          ).length || 0;

          return {
            id: room.id,
            productName: room.productName || "Объявление",
            productImage: room.productImage || "/src/assets/img/mask-avatar.png",
            price: room.price || "",
            user: {
              id: opponent.id || "",
              name: opponent.username || opponent.email || "Пользователь",
              avatar: opponent.avatar || "/src/assets/img/mask-avatar.png",
              isOnline: opponent.isOnline || false,
            },
            lastMessage: {
              text: lastMsg ? lastMsg.message : "Сообщений нет",
              isMine: lastMsg ? lastMsg.senderId === this.user.id : false,
              isRead: lastMsg ? lastMsg.isRead : false,
              time: lastMsg && lastMsg.createdAt
                ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            },
            unreadCount,
          };
        });
      } catch (e) {
        console.error("Ошибка при получении чатов:", e.response?.data || e);
        throw e;
      }
    },
    async fetchChatMessages(roomId, signal) {
      try {
        const res = await api.get(`/chat/room/${roomId}`, { signal });
        const msgs = res.data || [];
        return {
          messages: msgs.map(msg => ({
            id: msg.id,
            text: msg.message,
            isMine: msg.senderId === this.user?.id,
            isRead: msg.isRead || false,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            createdAt: msg.createdAt,
          })),
        };
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        console.error("Ошибка загрузки сообщений:", e.response?.data || e);
        throw e;
      }
    },
   
    async createPrivateRoom(userBId) {
      if (!this.user?.id) throw new Error("Пользователь не авторизован");
      try {
        const res = await api.post("/chat/create-room", {
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
        const res = await api.get(`/chat/search-messages/${roomId}?query=${encodeURIComponent(query)}`);
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
    // async fetchMyAdverts() {
    //   if (!this.isAuthenticated || !this.user?.id) {
    //     notify("Нужна авторизация для загрузки объявлений");
    //     return [];
    //   }
    //   try {
    //     const res = await api.get('/advert', {
    //       params: { userId: this.user.id }
    //     });
    //     return Array.isArray(res.data) ? res.data : [];
    //   } catch (e) {
    //     console.error("Ошибка загрузки:", e);
    //     notify("Не удалось загрузить объявления", "error");
    //     return [];
    //   }
    // },
    //ИЛИ 
    async fetchMyAdverts() {
      if (!this.isAuthenticated || !this.user?.id) {
        notify("Нужна авторизация для загрузки объявлений");
        return [];
      }
      try {
        const res = await api.get('/advert', {
          params: {
            dto: JSON.stringify({ userId: String(this.user.id) })
          }
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Ошибка загрузки:", e.response?.status, e.response?.data);
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
    // async updateAdvertStatus(id, status) {
    //   try {
    //     await api.patch('/advert/update', { id, status });
    //     notify(status === 'archive' ? "В архив" : "Опубликовано", "success");
    //     return true;
    //   } catch (e) {
    //     console.error("Ошибка обновления статуса:", e);
    //     notify("Не удалось обновить статус", "error");
    //     return false;
    //   }
    // },
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
    // async fetchAdvertsBySeller(sellerId) {
    //   if (!sellerId) {
    //     console.log("fetchAdvertsBySeller: sellerId не передан");
    //     return [];
    //   }
    //   try {
    //     const res = await api.get('/advert', {
    //       params: {
    //         dto: JSON.stringify({ userId: String(sellerId) })
    //       }
    //     });
    //     return Array.isArray(res.data) ? res.data : [];
    //   } catch (e) {
    //     console.error("Ошибка загрузки товаров продавца:", e);
    //     notify("Не удалось загрузить объявления продавца", "error");
    //     return [];
    //   }
    // },
    //ИЛИ
    async fetchAdvertsBySeller(sellerId) {
      if (!sellerId) {
        console.log("fetchAdvertsBySeller: sellerId не передан");
        return [];
      }
      try {
        const res = await api.get('/advert', {
          params: {
            dto: JSON.stringify({ userId: String(sellerId) })
          }
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
          isVideoReady: false,
          isLikedByMe: false,
          isFavorite: false, 
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
          isLikedByMe: false,
          isFavorite: false,
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
        isDetailsLoaded: true,
        isFavorite: details.isFavorite ?? video.isFavorite,
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
    async markAsFavorite(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (video?.isFavorite) return;
      
      try {
        await api.post('/feed/video/mark-as-favorite', { videoId });
        
        if (video) {
          video.isFavorite = true;
        }
      } catch (e) {
        console.error('Ошибка добавления в избранное:', e);
        throw e;
      }
    },

    async unmarkAsFavorite(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (video && !video.isFavorite) return;
      
      try {
        await api.post('/feed/video/unmark-as-favorite', { videoId });
        
        if (video) {
          video.isFavorite = false;
        }
      } catch (e) {
        console.error('Ошибка удаления из избранного:', e);
        throw e;
      }
    },
    async toggleFavorite(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (!video) return;
      
      if (video.isFavorite) {
        await this.unmarkAsFavorite(videoId);
        notify("Удалено из избранного");
      } else {
        await this.markAsFavorite(videoId);
        notify("Добавлено в избранное");
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
    login(userData) {
      this.isAuthenticated = true;
      const cleanEmail = (email) => {
        if (email && email.includes && email.includes('JsonNullable@')) return '';
        return email || '';
      };
      this.user = { 
        ...userData,
        email: cleanEmail(userData.email),
        role: userData.role || 'PRIVATE_PERSON',
      };
      this.saveToStorage();
      resetRefreshCooldown();
    },
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/auth/login", { login: email, password });
        const userData = res.data;
        if (userData && userData.id) {
          this.login(userData);
          if (userData.city) {
            useRegionModalStore().setRegion(
              userData.city,
              userData.coordinates || [37.6173, 55.7558],
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
        const responseData = res.data;
        console.log('registerAPI response:', responseData);
        if (responseData && responseData.id) {
          const userToLogin = {
            ...responseData,
            email: userData.email,
            role: 'PRIVATE_PERSON',
          };
          this.login(userToLogin);
        
          // Загружаем избранное
          await useFavoritesStore()
            .fetchFavorites()
            .catch(() => {});
        }
        return responseData;
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
        
        console.log('=== fetchProfile ===');
        console.log('RAW RESPONSE:', JSON.stringify(rawData, null, 2));

        const cleanValue = (val) => {
          if (val && val.includes && val.includes('JsonNullable@')) return '';
          return val || '';
        };
        
        const cleanAvatar = (avatar) => {
          if (avatar && avatar.cdnUrl) return avatar.cdnUrl;
          if (avatar && avatar.url) return avatar.url;
          if (typeof avatar === 'string') return avatar;
          return '';
        };
        
        // === ЗАЩИТА: не затираем role и email если бэкенд вернул null ===
        const currentRole = this.user?.role;
        const currentEmail = this.user?.email;
        
        const newRole = rawData.role || currentRole || 'PRIVATE_PERSON';
        // Чистим email от JsonNullable@ и т.п.
        const newEmail = cleanValue(rawData.email) || currentEmail || '';
        
        // === Создаём НОВЫЙ объект для реактивности Vue ===
        const updatedUser = {
          ...this.user,
          id: rawData.id,
          email: newEmail,           // ← теперь чистый email
          name: cleanValue(rawData.name),
          phone: rawData.phone || '',
          description: cleanValue(rawData.description),
          avatarUrl: cleanAvatar(rawData.avatarUrl),
          city: cleanValue(rawData.city),
          employees: rawData.employees || [],
          role: newRole,
        };
        
        this.user = updatedUser;
        
        console.log('this.user.role ПОСЛЕ:', this.user?.role);
        console.log('this.user.email ПОСЛЕ:', this.user?.email);
        console.log('===================');
        
        this.saveToStorage();
        
        const regionStore = useRegionModalStore();
        if (this.user.city) {
          regionStore.setRegion(
            this.user.city,
            rawData.coordinates || [37.6173, 55.7558],
          );
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (e.response?.data?.code === "SESSION_EXPIRED") this.logout();
      }
    },
    // В actions добавь:
    async fetchProfileById(userId) {
      if (!userId) {
        console.error("fetchProfileById: userId не передан");
        return null;
      }
      try {
        const res = await api.get(`/profile/${userId}`);
        const rawData = res.data;
        
        const cleanValue = (val) => {
          if (val && val.includes && val.includes('JsonNullable@')) return '';
          return val || '';
        };
        
        const cleanAvatar = (avatar) => {
          if (avatar && avatar.cdnUrl) return avatar.cdnUrl;
          if (avatar && avatar.url) return avatar.url;
          if (typeof avatar === 'string') return avatar;
          return '';
        };
        
        return {
          id: rawData.id,
          name: cleanValue(rawData.name) || cleanValue(rawData.username) || 'Пользователь',
          username: cleanValue(rawData.username),
          email: cleanValue(rawData.email),
          phone: rawData.phone || '',
          description: cleanValue(rawData.description) || 'Переходите на наш профиль, чтобы увидеть все актуальные предложения.',
          avatar: cleanAvatar(rawData.avatarUrl) || maskAvatar,
          avatarUrl: cleanAvatar(rawData.avatarUrl),
          city: cleanValue(rawData.city),
          type: rawData.role === 'COMPANY' ? 'company' : 'private',
          role: rawData.role || 'PRIVATE_PERSON',
          createdAt: rawData.createdAt,
          website: rawData.website || '',
          employees: rawData.employees || [],
          // Доп поля если есть
          companyName: rawData.companyName || '',
          rating: rawData.rating || 0,
        };
      } catch (e) {
        console.error("Ошибка загрузки профиля:", e);
        return null;
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
      const result = await geocodeByQuery(query);
      return result ? result.name : null;
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
      this.disconnectSocket();
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
