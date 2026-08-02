import { defineStore } from "pinia";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { markRaw, ref } from 'vue';
import router from "/src/router/index.js";
import { api, authApi } from "/src/api/api.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";
import { useRegionModalStore } from "/src/stores/regionModal.js";
import { geocodeByQuery } from '/src/utils/geocode.js';
import { getFCMToken, listenToMessages } from '/src/firebase.js';
import { notify } from "/src/utils/notify";

let stompClient = null;
let refreshTimer = null;
let connectCallbacks = [];

export const useAuthStore = defineStore("auth", {
  state: () => {
    const saved = localStorage.getItem("auth");
    try {
      const data = saved ? JSON.parse(saved) : null;
      return {
        isAuthenticated: data?.isAuthenticated || false,
        user: data?.user || null,
        isAuthLoading: !!data?.isAuthenticated,
        allVideos: [],
        welcomeFeed: [],
        isVideosLoading: false,
        allChats: [],
        favoriteVideos: [],
        allNotifications: [],
        isNotificationsLoading: false,
        _stompConnected: false,
        _pollingIntervals: {},
        _lastMessageIds: {},
        fcmToken: null,
        _fcmUnsubscribe: null,
        _isFetchingChats: false,
        _activeRoomId: null,
        _activeRoomHandler: null,
      };
    } catch (e){
      console.error("Auth parse error:", e);
      localStorage.removeItem("auth");
      return {
        isAuthenticated: false,
        user: null,
        isAuthLoading: false,
        allVideos: [],
        welcomeFeed: [],
        allChats: [],
        isVideosLoading: false,
        allNotifications: [],
        isNotificationsLoading: false,
        _stompConnected: false,
        _pollingIntervals: {},
        _lastMessageIds: {},
        fcmToken: null,
        _fcmUnsubscribe: null,
        _isFetchingChats: false,
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
    setActiveRoom(roomId, handler) {
      this._activeRoomId = roomId;
      this._activeRoomHandler = handler;
    },
    clearActiveRoom() {
      this._activeRoomId = null;
      this._activeRoomHandler = null;
    },
    waitForStompConnect(timeout = 15000) {
      return new Promise((resolve, reject) => {
        if (this._stompClient?.connected) {
          resolve(this._stompClient);
          return;
        }
        const timer = setTimeout(() => {
          reject(new Error('Таймаут подключения к WebSocket'));
        }, timeout);
        const callback = (client) => {
          clearTimeout(timer);
          resolve(client);
        };
        connectCallbacks.push(callback);
      });
    },

    initSocket() {
      console.log('[initSocket] START (SockJS + STOMP)');

      if (this._stompClient?.connected) return this._stompClient;
      if (!this.user?.id) {
        console.log('[initSocket] NO USER ID');
        return null;
      }
      if (this._stompClient && !this._stompClient.connected) {
        return this._stompClient;
      }

      let sockJsUrl;
      if (import.meta.env.DEV) {
        sockJsUrl = `${window.location.protocol}//${window.location.host}/chat-websocket`;
      } else {
        sockJsUrl = `/chat-websocket`;
      }
      console.log('[initSocket] Connecting to:', sockJsUrl);
      const client = new Client({
        webSocketFactory: () => new SockJS(sockJsUrl, null, {
          transports: ['websocket'],
          withCredentials: true,
        }),
        debug: (str) => {
          if (str.includes('<<< PONG') || str.includes('>>> PING')) return;
          console.log('[STOMP DEBUG]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 20000,
      });
      let reconnectAttempts = 0;
      const MAX_RECONNECT_ATTEMPTS = 5;

      client.onConnect = (frame) => {
        console.log('[STOMP] ✅ Connected. Frame:', frame);
        this._stompConnected = true;
        reconnectAttempts = 0;
        connectCallbacks.forEach(cb => cb(client));
        connectCallbacks = [];

        // ⬇️ Автоподписка на активную комнату при reconnect
        if (this._activeRoomId && this._activeRoomHandler) {
          console.log(`[STOMP] Auto-subscribing to active room ${this._activeRoomId}`);
          client.subscribe(`/topic/room/${this._activeRoomId}`, (message) => {
            const body = JSON.parse(message.body);
            this._activeRoomHandler(body);
          });
          client.publish({
            destination: `/app/chat.enterRoom/${this._activeRoomId}`,
            body: JSON.stringify({ userId: this.user?.id })
          });
        }
      };
      client.onDisconnect = () => {
        console.log('[STOMP] 🔌 Disconnected');
        this._stompConnected = false;
      };
      client.onStompError = (frame) => {
        console.error('[STOMP] ❌ Error:', frame.headers['message'], frame);
        this._stompConnected = false;
      };
      client.onWebSocketError = (event) => {
        console.error('[STOMP] ❌ WebSocket Error:', event);
        this._stompConnected = false;
      };
      client.onWebSocketClose = (event) => {
        console.log('[STOMP] WebSocket Closed. Code:', event.code, 'Reason:', event.reason);
        this._stompConnected = false;
        reconnectAttempts++;
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('[STOMP] Лимит попыток исчерпан');
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
      this.clearActiveRoom();
      if (this._stompClient) {
        try {this._stompClient.deactivate();} catch (e) {console.error('[disconnectSocket] Error:', e); }
        this._stompClient = null;
      }
      this._stompConnected = false;
      connectCallbacks = [];
    },

    startMessagePolling(roomId, onNewMessage) {
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
      poll();
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

    async initFCM() {
      if (!this.user?.id) return;
      const token = await getFCMToken();
      if (!token) return;
      this.fcmToken = token;
      try {
        await api.post('/notifications', {
          userId: String(this.user.id),
          token: token
        });
        console.log('[FCM] Токен зарегистрирован');
      } catch (e) {
        console.error('[FCM] Ошибка регистрации:', e);
      }
      this._fcmUnsubscribe = listenToMessages((payload) => {
        const { title, body } = payload.notification || {};
        notify(body || title || 'Новое уведомление', 'info');
        const newNote = {
          id: payload.data?.notificationId || Date.now(),
          title: title || 'Уведомление',
          message: body || '',
          date: new Date().toLocaleDateString('ru-RU'),
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          is_read: false,
          createdAt: new Date().toISOString()
        };
        this.allNotifications.unshift(newNote);
      });
    },
    stopFCM() {
      if (this._fcmUnsubscribe) {
        this._fcmUnsubscribe();
        this._fcmUnsubscribe = null;
      }
      this.fcmToken = null;
    },
    updateChatInList(roomId, updater) {
      const idx = this.allChats.findIndex(c => String(c.id) === String(roomId));
      if (idx !== -1) {
        const updated = updater({ ...this.allChats[idx] });
        this.allChats.splice(idx, 1, updated);
      }
    },
    async subscribeToRoom(roomId, onMessage) {
      this.initSocket();
      const client = await this.waitForStompConnect();
      const subscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
        const body = JSON.parse(message.body);
        // ← расширенное логирование: текст сообщения, id, senderId
        console.log('[STOMP] 📨 Получено сообщение:', {
          id: body.id,
          senderId: body.senderId,
          text: body.message,
          isRead: body.isRead,
          createdAt: body.createdAt,
          raw: body
        });
        onMessage?.(body);
      });
      this.setActiveRoom(roomId, onMessage);
      console.log(`[subscribeToRoom] ✅ WebSocket subscription for room ${roomId}`);
      return { type: 'websocket', subscription };
    },
    async sendMessage(roomId, text) {
      const client = await this.waitForStompConnect(10000);
      if (!client.connected) {
        throw new Error('Соединение потеряно, попробуйте ещё раз');
      }
      const payload = {
        senderId: this.user?.id,
        message: text,
      };
      console.log('[STOMP] 📤 Отправка сообщения:', {
        roomId,
        ...payload,
        destination: `/app/chat.sendMessage/${roomId}`
      });
      client.publish({
        destination: `/app/chat.sendMessage/${roomId}`,
        body: JSON.stringify(payload)
      });
      console.log('[sendMessage] ✅ Отправлено через STOMP');
    },

    async markMessageAsRead(messageId, roomId) {
      try {
        await api.patch(`/chat/messages/${messageId}/read?roomId=${roomId}`);
      } catch (e) {
        console.error('Ошибка markMessageAsRead:', e.response?.data || e);
        throw e;
      }
    },
    async fetchUserChats() {
      if (!this.user?.id) {
        console.log("Невозможно загрузить чаты: пользователь не авторизован");
        return;
      }
      if (this._isFetchingChats) {
        console.log('[fetchUserChats] Уже выполняется, пропускаем');
        return;
      }
      this._isFetchingChats = true;
      try {
        const res = await api.get('/chat/user-rooms');
        const rooms = res.data || [];

        // Старый кэш для сохранения данных между обновлениями
        const existingMap = new Map();
        this.allChats.forEach(c => {
          existingMap.set(String(c.id), c);
          if (c.userA && c.userB) {
            existingMap.set(`${c.userA}:${c.userB}`, c);
            existingMap.set(`${c.userB}:${c.userA}`, c);
          }
        });

        // Базовый список чатов с opponentId
        const baseChats = rooms
          .map((room) => {
            const pseudoId = `${room.userA}:${room.userB}`;
            const existing = existingMap.get(String(room.id)) 
              || existingMap.get(pseudoId) 
              || existingMap.get(`${room.userB}:${room.userA}`);
            const opponentId = String(room.userA) === String(this.user.id) ? room.userB : room.userA;

            return { raw: room, existing, pseudoId, opponentId };
          })
          .filter((item) => {
            if (!item.opponentId || String(item.opponentId) === String(this.user.id)) {
              console.log('[fetchUserChats] Filtering out self-chat:', item.raw.id || item.pseudoId);
              return false;
            }
            return true;
          });

        // Параллельно обогащаем: профиль собеседника + последнее сообщение
        const enrichedChats = await Promise.all(
          baseChats.map(async ({ raw, existing, pseudoId, opponentId }) => {
            const chatId = raw.id || existing?.id || pseudoId;

            // --- 1. Профиль собеседника ---
            let opponentName = existing?.user?.name;
            let opponentAvatar = existing?.user?.avatar;
            let opponentRating = existing?.user?.rating || 0;
            let opponentOnline = existing?.user?.isOnline || false;

            const needProfile = !opponentName 
              || opponentName === 'Пользователь' 
              || !opponentAvatar 
              || opponentAvatar === '/img/users/mask-avatar.png';

            if (needProfile) {
              try {
                const profile = await this.fetchProfileById(opponentId);
                if (profile) {
                  opponentName = profile.name || opponentName;
                  opponentAvatar = profile.avatar || profile.avatarUrl || opponentAvatar;
                  opponentRating = profile.rating || opponentRating;
                  // если бэкенд присылает isOnline в профиле — можно добавить:
                  // opponentOnline = profile.isOnline ?? opponentOnline;
                }
              } catch (e) {
                console.warn(`[fetchUserChats] Не удалось загрузить профиль ${opponentId}:`, e);
              }
            }

            // --- 2. Последнее сообщение ---
            let lastMessage = existing?.lastMessage;
            const hasValidLastMsg = lastMessage && lastMessage.text && lastMessage.text !== 'Сообщений нет';

            if (!hasValidLastMsg) {
              try {
                // ⚠️ Если бэкенд поддерживает пагинацию, замени на:
                // const res = await api.get(`/chat/search-messages/${chatId}`, { params: { query: '', take: 1 }});
                // const msgs = res.data || [];
                // const last = msgs[0];
                
                const { messages } = await this.fetchChatMessages(chatId);
                if (messages && messages.length > 0) {
                  const last = messages[messages.length - 1];
                  lastMessage = {
                    text: last.text,
                    isMine: last.isMine,
                    isRead: last.isRead,
                    time: last.time,
                  };
                }
              } catch (e) {
                console.warn(`[fetchUserChats] Не удалось загрузить сообщения для ${chatId}:`, e);
              }
            }

            return {
              id: chatId,
              userA: raw.userA,
              userB: raw.userB,
              user: {
                id: opponentId,
                name: opponentName || 'Пользователь',
                avatar: opponentAvatar || '/img/users/mask-avatar.png',
                isOnline: opponentOnline,
                rating: opponentRating,
              },
              productName: existing?.productName || raw.productName || '',
              productImage: existing?.productImage || raw.productImage || '',
              price: existing?.price || raw.price || '',
              lastMessage: lastMessage || {
                text: 'Сообщений нет',
                isMine: false,
                isRead: false,
                time: '',
              },
              unreadCount: existing?.unreadCount || raw.unreadCount || 0,
            };
          })
        );

        this.allChats = enrichedChats;
      } catch (e) {
        console.error("Ошибка при получении чатов:", e.response?.data || e);
        throw e;
      } finally {
        this._isFetchingChats = false;
      }
    },
    async fetchChatMessages(roomId, signal) {
      try {
        const res = await api.get(`/chat/search-messages/${roomId}`, {
          params: { query: '' },
          signal
        });
        const msgs = res.data || [];
        return {
          messages: msgs.map(msg => ({
            id: msg.id,
            text: msg.message,
            senderId: msg.senderId,
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
      if (String(userBId) === String(this.user.id)) {
        throw new Error("Нельзя создать чат с самим собой");
      }
      try {
        const res = await api.post("/chat/get-or-create-room", {
          userA: String(this.user.id),
          userB: String(userBId),
        });
        const roomId = res.data;
        const existingIndex = this.allChats.findIndex(c => String(c.id) === String(roomId));
        if (existingIndex === -1) {
          this.allChats.unshift({
            id: roomId,
            userA: String(this.user.id),
            userB: String(userBId),
            user: {
              id: String(userBId),
              name: "Пользователь",
              avatar: "/img/users/mask-avatar.png",
              isOnline: false,
            },
            productName: "",
            productImage: "",
            price: "",
            lastMessage: {
              text: "Сообщений нет",
              isMine: false,
              isRead: false,
              time: "",
            },
            unreadCount: 0,
          });
        }
        return roomId;
      } catch (e) {
        console.error("Ошибка создания комнаты:", e.response?.data || e);
        throw e;
      }
    },
    async searchMessages(roomId, query) {
      if (!query.trim()) return [];
      try {
        const res = await api.get(`/chat/search-messages/${roomId}`, {
          params: { query: query.trim() }
        });
        return res.data || [];
      } catch (e) {
        console.error("Ошибка поиска:", e.response?.data || e);
        throw e;
      }
    },
    async createAdvert(payload) {
      try {
        const res = await api.post('/adverts', payload);
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
        const res = await api.get('/adverts/my');
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Ошибка загрузки:", e.response?.status, e.response?.data);
        notify("Не удалось загрузить объявления", "error");
        return [];
      }
    },
    async updateAdvert(payload) {
      try {
        const res = await api.patch('/adverts', payload);
        notify("Объявление обновлено!", "success");
        return res.data;
      } catch (e) {
        console.error("Ошибка обновления:", e);
        notify(e.response?.data?.message || "Не удалось обновить объявление", "error");
        throw e;
      }
    },
    async deleteAdvert(id, s3Key = null) {
      try {
        await api.delete(`/adverts/${id}`);
        notify("Объявление удалено", "success");
        return true;
      } catch (e) {
        console.error("Ошибка удаления:", e.response?.data || e);
        notify("Не удалось удалить", "error");
        return false;
      }
    },
    async getAdvertById(id) {
      try {
        const res = await api.get(`/adverts/${id}`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        return data;
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
        const res = await api.post('/adverts/search', {
          userId: String(sellerId),
          take: 50
        });
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Ошибка загрузки товаров продавца:", e);
        notify("Не удалось загрузить объявления продавца", "error");
        return [];
      }
    },
    async fetchWelcomeFeed({ page = 0, size = 10, seed = 0.5 }) {
      this.isVideosLoading = true;
      try {
        const response = await api.get('/feed/video/welcome-feed', {
          params: { page: Number(page), size: Number(size), seed: Number(seed) }
        });
        const shortVideos = response.data || [];
        this.welcomeFeed = shortVideos.map(v => ({
          id: v.id,
          likes: v.likes || "",
          commentsCount: v.commentsCount || "",
          description: v.description || '',
          createdAt: v.createdAt || '',
          publishedAt: v.publishedAt || '',
          cdnUrl: v.cdnUrl || '',
          views: v.views ?? v.viewsCount ?? "",
          author: null,
          comments: [],
          isDetailsLoaded: false,
          isVideoReady: false,
          isLikedByMe: v.isLikedByMe || v.likedByMe || false,
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
        let author = video.author;
        if (author?.id) {
          const profile = await this.fetchProfileById(author.id);
          if (profile) {
            author = {
              id: author.id,
              name: author.name || profile.name || 'Пользователь',
              username: profile.username || author.name,
              avatar: profile.avatar || '/img/users/mask-avatar.png',
              rating: profile.rating || 0
            };
          }
        }
        return {
          id: video.id,
          cdnUrl: video.cdnUrl || '',
          description: video.description || '',
          likes: video.likes ?? video.likesCount ?? "",
          views: video.views ?? video.viewsCount ?? "",
          commentsCount: video.comments?.length ?? video.commentsCount ?? video.commentCount ?? "",
          createdAt: video.createdAt || '',
          publishedAt: video.publishedAt || '',
          comments: (video.comments || []).map(c => ({
            id: c.id,
            text: c.text,
            name: c.name,
            parentId: c.parentId,
            createdAt: c.createdAt,
            author: {
              id: c.author?.id,
              name: c.author?.name || 'Пользователь',
              avatar: '/img/users/mask-avatar.png'
            }
          })),
          isLikedByMe: video.isLikedByMe ?? video.likedByMe ?? false,
          isFavorite: video.isFavorite ?? false,
          author: author || {
            id: '',
            name: 'Пользователь',
            username: '',
            avatar: '/img/users/mask-avatar.png',
            rating: 0
          }
        };
      } catch (e) {
        console.error('Ошибка загрузки видео:', e);
        return null;
      }
    },
    async enrichVideo(videoId, force = false) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      if (!video) return null;
      if (video.isDetailsLoaded && !force) return video;
      const details = await this.fetchVideo(videoId);
      if (!details) return video;
      if (details.author?.id && (!details.author.avatar || !details.author.rating)) {
        const profile = await this.fetchProfileById(details.author.id);
        if (profile) {
          details.author = {
            ...details.author,
            avatar: profile.avatar || '/img/users/mask-avatar.png',
            rating: profile.rating || 0
          };
        }
      }
      Object.assign(video, {
        views: details.views,
        likes: details.likes,
        author: details.author,
        comments: details.comments,
        commentsCount: details.commentsCount,
        createdAt: details.createdAt || video.createdAt,
        publishedAt: details.publishedAt || video.publishedAt,
        isDetailsLoaded: true,
        isLikedByMe: details.isLikedByMe,
        isFavorite: details.isFavorite,
      });
      return video;
    },
    async addView(videoId) {
      if (!this.user?.id) {
        notify("⚠️ Попытка засчитать просмотр неавторизованным пользователем заблокирована.");
        return;
      }
      try {
        await api.post('/feed/video/add-view', {
          userId: this.user.id,
          videoId: videoId
        });
        const inFeed = this.welcomeFeed.find(v => v.id === videoId);
        if (inFeed) {
          inFeed.views = (inFeed.views || 0) + 1;
        }
        const inAll = this.allVideos.find(v => v.id === videoId);
        if (inAll) {
          inAll.views = (inAll.views || 0) + 1;
          inAll.viewsCount = inAll.views;
        }
      } catch (e) {
        console.error('Ошибка отправки просмотра:', e.response?.data || e);
      }
    },
    async likeVideo(videoId) {
      try {
        await api.post('/feed/like', { videoId });
      } catch (e) {
        console.error('Ошибка лайка:', e);
        throw e;
      }
    },
    async unlikeVideo(videoId) {
      try {
        await api.post('/feed/unlike', { videoId });
      } catch (e) {
        console.error('Ошибка удаления лайка:', e);
        throw e;
      }
    },
    async toggleLike(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      const currentlyLiked = video?.isLikedByMe ?? false;
      try {
        if (currentlyLiked) {
          await this.unlikeVideo(videoId);
        } else {
          await this.likeVideo(videoId);
        }
        const fresh = await this.fetchVideo(videoId);
        if (fresh) {
          const idx = this.welcomeFeed.findIndex(v => v.id === videoId);
          if (idx !== -1) {
            this.welcomeFeed[idx] = { ...this.welcomeFeed[idx], ...fresh };
          }
          const allIdx = this.allVideos.findIndex(v => v.id === videoId);
          if (allIdx !== -1) {
            this.allVideos[allIdx] = { ...this.allVideos[allIdx], ...fresh };
          }
        }
        notify(currentlyLiked ? "Лайк убран" : "Лайк поставлен");
      } catch (e) {
        notify("Ошибка лайка", "error");
        throw e;
      }
    },
    async markAsFavorite(videoId) {
      try {
        await api.post('/feed/video/mark-as-favorite', { videoId });
      } catch (e) {
        console.error('Ошибка:', e);
        throw e;
      }
    },
    async unmarkAsFavorite(videoId) {
      try {
        await api.post('/feed/video/unmark-as-favorite', { videoId });
      } catch (e) {
        console.error('Ошибка:', e);
        throw e;
      }
    },
    async toggleFavorite(videoId) {
      const video = this.welcomeFeed.find(v => v.id === videoId);
      const currentlyFav = video?.isFavorite ?? false;
      try {
        if (currentlyFav) {
          await this.unmarkAsFavorite(videoId);
        } else {
          await this.markAsFavorite(videoId);
        }
        const fresh = await this.fetchVideo(videoId);
        if (fresh) {
          const idx = this.welcomeFeed.findIndex(v => v.id === videoId);
          if (idx !== -1) {
            this.welcomeFeed[idx] = { ...this.welcomeFeed[idx], ...fresh };
          }
          const allIdx = this.allVideos.findIndex(v => v.id === videoId);
          if (allIdx !== -1) {
            this.allVideos[allIdx] = { ...this.allVideos[allIdx], ...fresh };
          }
        }
        notify(currentlyFav ? "Удалено из избранного" : "Добавлено в избранное");
      } catch (e) {
        notify("Ошибка избранного", "error");
        throw e;
      }
    },
    async fetchLikeCount(videoId) {
      try {
        const response = await api.get('/feed/like-count', {
          params: { videoId }
        });
        return response.data;
      } catch (e) {
        console.error('Ошибка получения количества лайков:', e.response?.data || e);
        return 0;
      }
    },
    async fetchFavorites(userId) {
      try {
        const response = await api.get(`/feed/video/favorites/${userId}`);
        const data = response.data || [];
        const favoritesData = Array.isArray(data) ? data[0] : data;
        if (favoritesData?.favoriteVideos?.length) {
          const promises = favoritesData.favoriteVideos.map(id => this.fetchVideo(id));
          const results = await Promise.all(promises);
          this.favoriteVideos = results.filter(v => v !== null);
          return this.favoriteVideos;
        }
        this.favoriteVideos = [];
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
      this.isAuthLoading = false;
      this.saveToStorage();
      this.startRefreshTimer();
      this.initFCM().catch(console.error);
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
          await Promise.all([
            this.fetchFavorites(this.user?.id).catch(() => {}),
            useFavoritesStore().fetchAdvertFavorites().catch(() => {})
          ]);
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
          await Promise.all([
            this.fetchFavorites(this.user?.id).catch(() => {}),
            useFavoritesStore().fetchAdvertFavorites().catch(() => {})
          ]);
        }
        return responseData;
      } catch (e) {
        console.error("Register error:", e.response?.data || e);
        throw e;
      }
    },
    async loginWithVK(vkData) {
      try {
        const res = await api.post('/auth/vk', {
          accessToken: vkData.access_token,
          userId: vkData.user_id,
          email: vkData.email || null,
        });
        const userData = res.data;
        if (userData && userData.id) {
          this.login(userData);
          return true;
        }
      } catch (e) {
        console.error('VK login error:', e.response?.data || e);
        throw e;
      }
    },
    async refreshToken() {
      if (!this.isAuthenticated || !this.user?.id) {
        console.log('[refreshToken] Пропуск: пользователь не авторизован');
        return false;
      }
      try {
        const res = await authApi.post("/auth/refresh");
        const isSuccess = res.status === 204 || res.status === 200;
        if (isSuccess) {
          this.isAuthenticated = true;
          this.saveToStorage();
        }
        return isSuccess;
      } catch (err) {
        console.error("Ошибка обновления сессии:", err.response?.data || err);
        return false;
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
        const currentRole = this.user?.role;
        const currentEmail = this.user?.email;
        const newRole = rawData.role || currentRole || 'PRIVATE_PERSON';
        const newEmail = cleanValue(rawData.email) || currentEmail || '';
        const isMyProfile = String(rawData.id) === String(this.user?.id);
        const editable = isMyProfile ? true : (rawData.editable ?? false);
        const updatedUser = {
          ...this.user,
          id: rawData.id,
          email: newEmail,
          name: cleanValue(rawData.name),
          phone: rawData.phone || '',
          description: cleanValue(rawData.description),
          avatarUrl: cleanAvatar(rawData.avatarUrl),
          city: cleanValue(rawData.city),
          employees: rawData.employees || [],
          role: newRole,
          editable: editable,
          rating: rawData.rating || 0,
        };
        this.user = updatedUser;
        console.log('this.user.editable ПОСЛЕ:', this.user?.editable);
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
          companyName: rawData.companyName || '',
          rating: rawData.rating || 0,
          editable: rawData.editable ?? true,
        };
      } catch (e) {
        console.error("Ошибка загрузки профиля:", e);
        return null;
      }
    },
    async fetchVideos() {
      this.isVideosLoading = true;
      try {
        const res = await api.get('/media/videos', {
          params: { userId: this.user?.id }
        });
        const rawVideos = Array.isArray(res.data) ? res.data : [];
        const enrichedVideos = await Promise.all(rawVideos.map(async (v) => {
          const base = {
            ...v,
            s3Key: v.s3Key || v.fileName || v.id,
            thumbnail: v.thumbnailUrl || v.cdnUrl || v.url,
            isArchived: v.isArchived || false,
          };
          let feedData = null;
          try {
            feedData = await this.fetchVideo(v.id);
          } catch (e) {
            console.error(`[fetchVideos] Не удалось обогатить видео ${v.id}:`, e);
          }
          if (feedData) {
            return {
              ...base,
              description: feedData.description || base.description || 'Описание ролика временно недоступно',
              likes: feedData.likes ?? 0,
              likesCount: feedData.likes ?? 0,
              views: feedData.views ?? 0,
              viewsCount: feedData.views ?? 0,
              commentsCount: feedData.commentsCount ?? 0,
              createdAt: feedData.createdAt || '',
              author: feedData.author || {
                name: 'Пользователь',
                avatar: maskAvatar,
              },
              comments: feedData.comments || [],
              commentsDisabled: v.commentsDisabled || false,
            };
          }
          return {
            ...base,
            description: v.description || 'Описание ролика временно недоступно',
            likes: v.likes ?? v.likesCount ?? 0,
            likesCount: v.likesCount ?? v.likes ?? 0,
            views: v.views ?? v.viewsCount ?? 0,
            viewsCount: v.viewsCount ?? v.views ?? 0,
            commentsCount: v.commentsCount ?? 0,
            createdAt: v.createdAt || '',
            author: {
              name: 'Пользователь',
              avatar: maskAvatar,
            },
            commentsDisabled: v.commentsDisabled || false,
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
        const res = await api.get('/media/videos', {
          params: { userId }
        });
        const rawVideos = Array.isArray(res.data) ? res.data : [];
        return rawVideos.map(v => ({
          id: v.id,
          s3Key: v.s3Key || v.fileName || v.id,
          thumbnail: v.thumbnailUrl || v.cdnUrl || v.url,
          cdnUrl: v.cdnUrl || '',
          description: v.description || 'Описание ролика временно недоступно',
          isArchived: v.isArchived || false,
          likes: v.likes || v.likesCount || 0,
          likesCount: v.likesCount || v.likes || 0,
          viewsCount: v.viewsCount || 0,
          commentsCount: v.commentsCount || 0,
          commentsDisabled: v.commentsDisabled || false,
          duration: v.duration || '',
          userId: v.userId
        }));
      } catch (e) {
        console.error("Ошибка загрузки видео пользователя:", e);
        return [];
      } finally {
        this.isVideosLoading = false;
      }
    },
    async fetchUserMediaVideos(userId) {
      if (!userId) {
        console.log("fetchUserMediaVideos: userId не передан");
        return [];
      }
      try {
        const res = await api.get(`/media/${userId}/videos`);
        const rawVideos = Array.isArray(res.data) ? res.data : [];
        return rawVideos.map(v => ({
          id: v.id,
          fileName: v.fileName || '',
          description: v.description || 'Описание ролика временно недоступно',
          extension: v.extension || '',
          s3Key: v.s3Key || v.fileName || v.id,
          cdnUrl: v.cdnUrl || '',
          thumbnailUrl: v.thumbnailUrl || '',
          type: v.type || '',
          mimeType: v.mimeType || '',
          userId: v.userId,
        }));
      } catch (e) {
        console.error("Ошибка загрузки медиа-видео пользователя:", e);
        return [];
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
          title: 'Уведомление',
          message: n.message,
          date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('ru-RU') : '',
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '',
          is_read: false,
          createdAt: n.createdAt
        }));
      } catch (e) {
        console.error("Ошибка уведомлений:", e);
        this.allNotifications = [];
      } finally {
        this.isNotificationsLoading = false;
      }
    },
    startRefreshTimer() {
      this.stopRefreshTimer();
      if (!this.isAuthenticated || !this.user?.id) {
        console.log('[startRefreshTimer] Пропуск: пользователь не авторизован');
        return;
      }
      console.log('[startRefreshTimer] Запущен, интервал 15 минут');
      refreshTimer = setInterval(async () => {
        if (!this.isAuthenticated || !this.user?.id) {
          console.log('[refreshTimer] Пользователь разлогинен, останавливаем таймер');
          this.stopRefreshTimer();
          return;
        }
        try {
          await this.refreshToken();
        } catch (e) {
          console.error('[refreshTimer] Ошибка рефреша:', e);
          this.logout();
        }
      }, 15 * 60 * 1000);
    },
    stopRefreshTimer() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
        console.log('[stopRefreshTimer] Таймер остановлен');
      }
    },
    async logout() {
      this.stopRefreshTimer();
      this.disconnectSocket();
      this.stopFCM();
      this.stopAllPolling();
      this.isAuthenticated = false;
      this.user = null;
      this.isAuthLoading = false;
      useRegionModalStore().$patch({
        selectedRegion: null,
        coordinates: [37.6173, 55.7558],
      });
      ["auth", "region", "regionCoords", "products"].forEach((key) =>
        localStorage.removeItem(key),
      );
      const favStore = useFavoritesStore();
      favStore.clear();
      this.favoriteVideos = [];
      this.allChats = [];
      this.allNotifications = [];
      this.welcomeFeed = [];
      this.allVideos = [];
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