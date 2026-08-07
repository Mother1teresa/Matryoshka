<template>
  <div class="shorts-page-layout">
    <!-- ЛЕВЫЙ САЙДБАР (как в ProfileLayout.vue) -->
    <aside class="profile-sidebar">
      <div class="profile-sidebar_block">
        <div class="sidebar-header">
          <router-link to="/" class="logo">
            <span>Матрёшка</span>
          </router-link>
          <router-link to="/profile/info" class="user-foto">
            <div class="user-foto_block">
              <img :src="auth.userAvatar" class="user-avatar" />
              <span class="user-name">{{ auth.user?.name }}</span>
            </div>
            <div class="user-brief">
              <div class="rating">
                <p>{{ userRating }}</p>
                <div class="stars-row">
                  <img v-for="n in 5" :key="n" :src="n <= Math.round(userRating) ? '/img/users/star.png' : '/img/users/star_1.png'" class="star-icon" alt="★" />
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <nav class="profile-nav">
          <div class="profile-nav_a">
            <router-link to="/profile/advertisements">Мои объявления</router-link>
            <router-link to="/profile/videos">Мои ролики</router-link>
            <router-link to="/profile/favorites">Избранное</router-link>
            <router-link to="/profile/messages">Сообщения</router-link>
            <router-link to="/profile/notifications">Уведомления</router-link>
            <router-link to="/profile/reviews">Отзывы</router-link>
            <router-link to="/profile/info">Мои данные</router-link>
          </div>
          <div class="nav-footer">
            <button class="edu-btn" @click="handleEduClick">Обучение</button>
          </div>
        </nav>
      </div>
    </aside>

    <!-- ПРАВАЯ ЧАСТЬ -->
    <main class="profile-main">
      <!-- ПОИСК -->
      <div class="shorts-search-bar">
        <div class="search-wrapper">
          <img src="/src/assets/img/icons/Icon-search.svg" class="search-icon" alt="search" />
          <input type="text" v-model="searchQuery" placeholder="Поиск" @keyup.enter="performSearch" />
          <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
        </div>
      </div>

      <!-- РЕЗУЛЬТАТЫ ПОИСКА (карточки из MyVideos.vue) -->
      <div v-if="isSearchActive" class="search-results-page">
        <h2 class="search-results-title">Результаты поиска</h2>
        <div v-if="filteredVideos.length === 0" class="search-empty">
          <p>По запросу «{{ searchQuery }}» ничего не найдено</p>
        </div>
        <div v-else class="videos-grid">
          <div v-for="video in filteredVideos" :key="video.id" class="video-item" @click="openVideo(video.id)">
            <div class="video-card">
              <img :src="video.thumbnail || video.cdnUrl || '/img/users/mask-avatar.png'" class="thumbnail" alt="thumb" />
              <div class="video-overlay">
                <span class="duration">{{ video.duration || "0:11" }}</span>
              </div>
            </div>
            <div class="video-info">
              <div class="stats-line">
                <div class="stat">
                  <img src="/src/assets/img/icons/eye.svg" />
                  {{ video.views ?? video.viewsCount ?? "" }}
                </div>
                <div class="stat">
                  <img src="/src/assets/img/icons/heart.svg" />
                  {{ video.likes ?? video.likesCount ?? "" }}
                </div>
                <div class="stat">
                  <img src="/src/assets/img/icons/comment.svg" />
                  {{ video.commentsCount ?? "" }}
                </div>
              </div>
              <p class="video-description">{{ video.description || "Описание отсутствует" }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ЛЕНТА ШОРТСОВ (оригинал, не трогал video-actions / info-side / share-modal) -->
      <div v-else class="shorts-page-overlay">
        <div v-if="isLoading && videos.length === 0" class="loader">Загрузка роликов...</div>
        <div v-else-if="videos.length" class="shorts-main-container" ref="scrollContainer">
          <div v-for="video in videos" :key="video.id" class="short-snap-item" :class="{ 'is-scrolling': isScrolling }">
            <div class="short-content-wrapper">
              
              <!-- ВИДЕО -->
              <div class="video-side">
                <button class="close-btn" @click="closeShorts">
                  <img src="/src/assets/img/icons/close-white.svg" alt="close" />
                </button>
                
                <div v-if="!video.isVideoReady || !video.isPlaying" class="video-poster">
                  <div class="poster-spinner"></div>
                </div>

                <div v-if="video.hasError" class="video-error">
                  <p>Формат не поддерживается</p>
                </div>

                <video 
                  :src="video.cdnUrl" 
                  :ref="setVideoRef" 
                  :data-id="video.id" 
                  loop 
                  playsinline
                  :muted="isMuted"
                  preload="auto"
                  @canplaythrough="onVideoReady(video)"
                  @loadeddata="onVideoReady(video)"
                  @playing="onVideoPlaying(video)"
                  @error="onVideoError(video)"
                ></video>
                <button class="mute-btn" @click="toggleMute">
                  <img :src="isMuted ? muteIcon : unmuteIcon" alt="sound" />
                </button>
                <div class="video-actions">
                  <div class="v-action">
                    <button class="action-btn" @click.stop="onFavoriteClick(video)">
                      <img :src="video.isFavorite ? bookmarkFilledIcon : bookmarkIcon" class="favorite-icon"/>
                    </button>
                  </div>
                  <div class="v-action">
                    <button class="action-btn" @click.stop="onLikeClick(video)">
                      <img :src="video.isLikedByMe ? heartFilled : heart" class="like-icon"/>
                    </button>
                    <span>{{ (video.likes ?? video.likesCount ?? 0) }}</span>
                  </div>
                  <!-- <div v-if="!isOwnVideo(video)" class="v-action">
                    <button class="action-btn" @click="onWriteClick(video)">
                      <img src="/src/assets/img/mes.svg" />
                    </button>
                  </div> -->
                  <div class="v-action">
                    <button class="action-btn" @click="openShareModal(video)">
                      <img src="/src/assets/img/icons/lin.svg" alt="share" />
                    </button>
                  </div>
                  <div class="v-action scroll-arrows">
                    <button class="action-btn arrow-btn" @click="scrollPrev">
                      <img src="/src/assets/img/icons/up.svg" alt="up" />
                    </button>
                    <button class="action-btn arrow-btn" @click="scrollNext">
                      <img src="/src/assets/img/icons/down.svg" alt="down" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- ИНФОРМАЦИЯ (Правая часть) -->
              <aside class="info-side">
                <div class="info-scroll-area">
                  <div class="info-content-wrapper" :class="{ 'is-visible': activeVideoId === video.id && !isScrolling }">
                  <div class="info-scroll-area_block">
                    <div class="video-header-info">
                      <h2 class="video-title">{{ video.description || '\u00A0' }}</h2>
                      <div class="video-stats-row">
                        <span v-if="video.publishedAt">{{'Мини-видео выложено '+ formatDate(video.publishedAt) }}</span>
                      </div>
                    </div>
                    <div class="shorts-block_avt">
                      <div v-if="video.linkedProduct" class="linked-product-wrapper">
                        <ProductCard :product="normalizeProduct(video.linkedProduct)" />
                      </div>
                      <div class="author-card">
                        <router-link :to="video.author?.id ? { name: 'SellerPage', params: { id: video.author.id } } : ''" class="author-link" :event="video.author?.id ? 'click' : ''">
                          <div class="author-main">
                            <img  :src="video.author?.avatar || '/img/users/mask-avatar.png'"  class="author-ava" />
                              <div class="author-main_block">
                                <div class="author-details">
                                  <p class="name">{{ video.author?.name || '\u00A0' }}</p>
                                </div>
                                <div class="rating-badge">
                                  <span class="rating-num">{{ video.author?.rating || 0 }}</span>
                                  <span class="stars">
                                    <img v-for="n in 5" :key="n" :src="n <= Math.round(video.author?.rating || 0) ? '/img/users/star.png' : '/img/users/star_1.png'" class="star-icon" alt="★" />
                                  </span>
                                </div>
                            </div>
                          </div>
                        </router-link>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div class="comments-block">
                    <p class="section-title">
                      <img src="/src/assets/img/icons/comment.svg" alt="" />
                      Комментарии
                    </p>
                    <div v-if="!video.comments?.length" class="comments-empty">
                      <p>Комментариев нет</p>
                    </div>
                    <div v-if="video.commentsDisabled" class="comments-locked">
                      <p>Комментарии не доступны</p>
                    </div>
                    <div v-else class="comments-list">
                      <div v-for="comment in buildCommentTree(video.comments)" :key="comment.id" class="comment-thread">
                        <div class="comment-item">
                          <img :src="comment.author?.avatar || '/img/users/mask-avatar.png'"/>
                          <div class="c-body">
                            <div class="c-header">
                              <span class="c-user">{{ comment.author?.name || "Пользователь" }}</span>
                              <p class="c-text">{{ comment.text }}</p>
                            </div>
                            <div class="c-header_footer">
                              <span class="c-date">{{ formatDate(comment.createdAt) }}</span>
                              <span v-if="!isOwnComment(comment)" class="c-reply" @click.stop.prevent="startReply(comment)">
                                Ответить
                              </span>
                            </div>
                          </div>
                        </div>

                        <div v-if="comment.replies?.length" class="comment-replies">
                          <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply-item">
                            <img :src="reply.author?.avatar || '/img/users/mask-avatar.png'" class="reply-avatar"/>
                            <div class="c-body">
                              <div class="c-header">
                                <span class="c-reply-badge">Ответ</span>
                                <span class="c-user">{{ reply.author?.name || "Пользователь" }}</span>
                                <p class="c-text">{{ reply.text }}</p>
                              </div>
                              <div class="c-header_footer">
                                <span class="c-date">{{ formatDate(reply.createdAt) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="footer-input">
                  <div v-if="replyTo" class="reply-banner">
                    <span>Ответ {{ replyTo.userName }}</span>
                    <button @click="cancelReply">✕</button>
                  </div>
                  <div class="input-row">
                    <input type="text" v-model="newComment" :placeholder="replyTo ? `Ответ ${replyTo.userName}...` : 'Сообщение'" @keyup.enter="postComment(video, replyTo?.commentId)"/>
                    <button class="send-btn" @click="postComment(video, replyTo?.commentId)">
                      <img src="/src/assets/img/icons/send-plane.svg" />
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <div v-else class="empty">Видео не найдены</div>
        <div v-if="isShareModalOpen" class="modal-overlay" @click.self="isShareModalOpen = false">
          <div class="share-modal">
            <header class="modal-header">
              <h3>Поделиться</h3>
              <button class="close-modal" @click="isShareModalOpen = false">
                ✕
            </button>
            </header>
            <div class="link-section">
              <label>Ссылка на мини-видео</label>
              <div class="input-wrapper">
                <input type="text" :value="shareLink" readonly />
              </div>
              <button class="copy-btn" :class="{ 'copied': isCopied }" @click="copyToClipboard">
                {{ isCopied ? 'Скопировано!' : 'Копировать ссылку' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import { useSubscriptionStore } from "/src/stores/subscriptionStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { notify } from "/src/utils/notify.js";
import { formatDate } from "/src/utils/formatters.js";

import heart from "/src/assets/img/icons/heart.svg";
import heartFilled from "/src/assets/img/icons/heart-filled.svg";
import muteIcon from "/src/assets/img/icons/mute.svg";
import unmuteIcon from "/src/assets/img/icons/unmute.svg";
import ProductCard from "/src/components/product/ProductCard.vue";
import bookmarkIcon from "/src/assets/img/icons/bookmark.svg";
import bookmarkFilledIcon from "/src/assets/img/icons/bookmark-fill.svg";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const favStore = useFavoritesStore();
const subStore = useSubscriptionStore();
const modal = useModalStore();

const videoRefs = ref([]);
const scrollContainer = ref(null);
const newComment = ref("");
const replyTo = ref(null);
let copyTimeout = null;
const isCopied = ref(false);
const isMuted = ref(true);
const isScrolling = ref(false);
const activeVideoId = ref(null);
let scrollTimeout = null;
let observer = null;
const searchQuery = ref("");
const isSearchActive = ref(false);
const isReplyMode = ref(false);

const userRating = computed(() => auth.user?.rating || 0);
const videos = computed(() => auth.welcomeFeed || []);
const isLoading = computed(() => auth.isVideosLoading);
const selectedVideoId = computed(() => route.params.id);

const performSearch = () => {
  if (!searchQuery.value.trim()) { isSearchActive.value = false; return; }
  isSearchActive.value = true;
};

const clearSearch = () => { searchQuery.value = ""; isSearchActive.value = false; };

const filteredVideos = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const q = searchQuery.value.toLowerCase();
  return videos.value.filter(v => {
    const desc = (v.description || "").toLowerCase();
    const authorName = (v.author?.name || "").toLowerCase();
    return desc.includes(q) || authorName.includes(q);
  });
});

const openVideo = (videoId) => {
  isSearchActive.value = false;
  searchQuery.value = "";
  router.push({ name: "shorts", params: { id: videoId } });
  nextTick(() => { scrollToVideo(videoId); });
};

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + " млн";
  if (num >= 1000) return (num / 1000).toFixed(1) + " тыс";
  return String(num);
};

const handleEduClick = () => { notify("Раздел в разработке", "info"); };

const buildCommentTree = (comments) => {
  if (!comments?.length) return [];
  const map = {};
  const roots = [];
  comments.forEach(c => { map[c.id] = { ...c, replies: [] }; });
  comments.forEach(c => {
    const node = map[c.id];
    if (c.parentId && map[c.parentId]) map[c.parentId].replies.push(node);
    else roots.push(node);
  });
  return roots;
};

const loadLinkedProducts = async () => {
  if (!videos.value?.length) return;
  await Promise.all(videos.value.map(async (video) => {
    if (video.productId && !video.linkedProduct) {
      try {
        const product = await auth.getAdvertById(video.productId);
        if (product) video.linkedProduct = product;
      } catch (e) { console.warn(`Не удалось загрузить товар для видео ${video.id}:`, e); }
    }
  }));
};

const normalizeProduct = (product) => ({
  ...product,
  images: product.images || product.pictures?.map(p => p.pictureUrl || p.url) || product.pictureUrls || [],
  category: product.category || product.type || 'tovary',
  section: product.section || 'default',
});

const onVideoReady = (video) => { video.isVideoReady = true; video.hasError = false; };
const onVideoPlaying = (video) => { video.isPlaying = true; };
const onVideoError = (video) => { console.error('Video error:', video.cdnUrl); video.hasError = true; video.isVideoReady = false; video.isPlaying = false; };

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  videoRefs.value.forEach(el => { if (el) el.muted = isMuted.value; });
};

const checkAuthAndRun = (action, message = "Авторизуйтесь, чтобы продолжить") => {
  if (!auth.isAuthenticated) { modal.openLogin(); notify(message); return; }
  action();
};

const addView = async (video) => {
  if (!video?.id) return;
  try { await auth.addView(video.id); } catch (e) { console.error('Ошибка просмотра:', e); }
};

const onFavoriteClick = async (video) => {
  if (!video) return;
  checkAuthAndRun(async () => { try { await auth.toggleFavorite(video.id); } catch (e) { notify("Ошибка избранного", "error"); } });
};

const onLikeClick = async (video) => {
  if (!video) return;
  checkAuthAndRun(async () => { try { await auth.toggleLike(video.id); } catch (e) { notify("Ошибка лайка", "error"); } });
};

const onSubscribeClick = (authorId) => {
  checkAuthAndRun(async () => { const isNowSubscribed = await subStore.toggle(authorId); notify(isNowSubscribed ? "Вы подписались на автора" : "Вы отписались от автора"); });
};

// const onWriteClick = (video) => {
//   if (!video?.author?.id) return;
//   const productId = video.productId || ""; 
//   checkAuthAndRun(async () => {
//     try {  const roomId = await auth.createPrivateRoom(video.author.id, productId); router.push({ name: "ChatDetail", params: { id: roomId } }); }
//     catch (err) { notify("Не удалось открыть чат", "error"); }
//   }, "Войдите, чтобы написать сообщение");
// };

const postComment = async (video, parentId = null) => {
  if (!newComment.value.trim() || !video) return;
  checkAuthAndRun(async () => {
    try {
      await auth.addComment({ userId: auth.user?.id, videoId: video.id, text: newComment.value.trim(), parentId: parentId || null });
      const newItem = { id: `temp-${Date.now()}`, author: { name: auth.user?.username || auth.user?.name || "Пользователь", avatar: auth.userAvatar || "/public/img/users/mask-avatar.png" }, text: newComment.value.trim(), createdAt: new Date().toISOString(), parentId: parentId || null };
      if (!video.comments) video.comments = [];
      video.comments.push(newItem);
      if (parentId) replyTo.value = null;
      newComment.value = "";
      notify(parentId ? "Ответ добавлен" : "Комментарий добавлен");
    } catch (e) { notify("Ошибка отправки комментария", "error"); }
  });
};

const startReply = (comment) => {
  if (!auth.user?.id || !comment.author?.id) return;
  if (String(comment.author.id) === String(auth.user.id)) { notify("Нельзя ответить на своё сообщение"); return; }
  isReplyMode.value = true;
  replyTo.value = { commentId: comment.id, userName: comment.author?.name || "Пользователь" };
  if (scrollContainer.value) scrollContainer.value.style.scrollSnapType = 'none';
  nextTick(() => { const input = document.querySelector(".footer-input input"); if (input) input.focus({ preventScroll: true }); });
};

const cancelReply = () => { replyTo.value = null; newComment.value = ""; isReplyMode.value = false; if (scrollContainer.value) scrollContainer.value.style.scrollSnapType = 'y mandatory'; };

const setVideoRef = (el) => { if (el && !videoRefs.value.includes(el)) videoRefs.value.push(el); };

const handleKeyDown = (e) => {
  if (isReplyMode.value) return;
  if (e.key === "ArrowDown") { e.preventDefault(); scrollNext(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); scrollPrev(); }
};

const scrollNext = () => { if (scrollContainer.value) scrollContainer.value.scrollBy({ top: window.innerHeight, behavior: "smooth" }); };
const scrollPrev = () => { if (scrollContainer.value) scrollContainer.value.scrollBy({ top: -window.innerHeight, behavior: "smooth" }); };

const scrollToVideo = (id) => { const el = videoRefs.value.find((v) => v.dataset.id === id); if (el) el.scrollIntoView({ behavior: 'auto' }); };

const preloadVideos = () => {
  videos.value.forEach(video => { if (!video.cdnUrl) return; const link = document.createElement('link'); link.rel = 'preload'; link.href = video.cdnUrl; link.as = 'video'; document.head.appendChild(link); });
};

const initObserver = () => {
  if (observer) { observer.disconnect(); observer = null; }
  observer = new IntersectionObserver((entries) => {
    if (isReplyMode.value) return;
    entries.forEach((entry) => {
      const videoId = entry.target.dataset.id;
      const video = videos.value.find(v => v.id === videoId);
      if (entry.isIntersecting) {
        clearTimeout(scrollTimeout); activeVideoId.value = videoId; isScrolling.value = true;
        scrollTimeout = setTimeout(() => { isScrolling.value = false; }, 300);
        if (!video?.hasError) {
          entry.target.play().catch(err => { if (err.name === "NotAllowedError" && !isMuted.value) { isMuted.value = true; entry.target.muted = true; entry.target.play(); } });
        }
        videos.value.forEach(v => { if (v.id !== videoId) v.isPlaying = false; });
        auth.enrichVideo(videoId, true); addView(video); router.replace({ name: "shorts", params: { id: videoId } });
      } else { entry.target.pause(); entry.target.currentTime = 0; if (video) video.isPlaying = false; }
    });
  }, { threshold: 0.6 });
  videoRefs.value.forEach((v) => { if (v) observer.observe(v); });
};

const isOwnComment = (comment) => { if (!comment.author?.id || !auth.user?.id) return false; return String(comment.author.id) === String(auth.user.id); };

const closeShorts = () => { if (window.history.length > 1) router.back(); else router.push("/"); };

const isShareModalOpen = ref(false);
const shareLink = ref("");

const openShareModal = (video) => { if (!video) return; shareLink.value = `${window.location.origin}/shorts/${video.id}`; isShareModalOpen.value = true; };

const copyToClipboard = async () => {
  try { await navigator.clipboard?.writeText(shareLink.value); isCopied.value = true; clearTimeout(copyTimeout); copyTimeout = setTimeout(() => isCopied.value = false, 2000); }
  catch { notify("Ошибка копирования", "error"); }
};

const isOwnVideo = (video) => { if (!video?.author?.id || !auth.user?.id) return false; return String(video.author.id) === String(auth.user.id); };

const handleScroll = () => { if (isReplyMode.value) return; isScrolling.value = true; clearTimeout(scrollTimeout); scrollTimeout = setTimeout(() => { isScrolling.value = false; }, 150); };

const preloadAdjacentVideos = () => {
  const currentIdx = videos.value.findIndex(v => v.id === selectedVideoId.value);
  const indicesToLoad = [currentIdx - 1, currentIdx, currentIdx + 1].filter(i => i >= 0 && i < videos.value.length);
  indicesToLoad.forEach(idx => {
    const video = videos.value[idx]; if (!video?.cdnUrl) return;
    const link = document.createElement('link'); link.rel = 'preload'; link.href = video.cdnUrl; link.as = 'video'; document.head.appendChild(link);
  });
};

onMounted(async () => {
  if (videos.value.length === 0) await auth.fetchWelcomeFeed({ page: 0, size: 20, seed: 0.5 });
  await loadLinkedProducts();
  preloadAdjacentVideos();
  const preloadDetails = videos.value.slice(0, 3).map(v => auth.enrichVideo(v.id).catch(() => {}));
  await Promise.all(preloadDetails);
  if (selectedVideoId.value) activeVideoId.value = selectedVideoId.value;
  else if (videos.value.length > 0) activeVideoId.value = videos.value[0].id;
  window.addEventListener("keydown", handleKeyDown);
  scrollContainer.value?.addEventListener('scroll', handleScroll);
  nextTick(() => { initObserver(); scrollToVideo(selectedVideoId.value); });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  scrollContainer.value?.removeEventListener("scroll", handleScroll);
  if (observer) { observer.disconnect(); observer = null; }
  clearTimeout(copyTimeout); clearTimeout(scrollTimeout);
});
</script>
<style scoped>
.mute-btn {
  position: absolute;
  bottom: 1.5rem;
  left: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: background 0.2s;
}
.mute-btn:hover { background: rgba(0, 0, 0, 0.7);}
.mute-btn img {
  width: 1.25rem;
  height: 1.25rem;
  filter: invert(1);
}
.video-error {
  position: absolute;
  inset: 2.438rem 3.75rem 1rem 1.563rem;
  background: #1a1a1a;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: #999;
  font-size: 0.875rem;
}
.video-poster {
  position: absolute;
  inset: 2.438rem 3.75rem 1rem 1.563rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  backdrop-filter: blur(20px);
  background: rgba(240, 240, 240, 0.9);
}

.poster-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #64a07a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  z-index: 3;
}

.author-skeleton {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.skeleton-ava {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.skeleton-line {
  height: 0.875rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.25rem;
}

.skeleton-line.short { width: 60%;}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.short-snap-item {
  will-change: transform;
  contain: layout style paint;
}

.video-side video {
  will-change: opacity;
}
.shorts-page-overlay {
  position: fixed;
  inset: 0;
  background: #f5f5f5;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* Альтернатива: blur эффект */
.info-content-wrapper {
  opacity: 0;
  filter: blur(4px);
  transition: opacity 0.25s ease, filter 0.25s ease;
}

.info-content-wrapper.is-visible {
  opacity: 1;
  filter: blur(0);
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: background 0.3s;
}
.close-btn:hover {
  background: #e7e7e7;
}
.close-btn img {
  width: 1.25rem;
  height: 1.25rem;
}
.loader {
  color: #666;
  font-size: 1rem;
}
.shorts-main-container {
  height: 100vh;
  width: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
}
.shorts-main-container::-webkit-scrollbar { display: none;}

.short-snap-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
}

.short-content-wrapper {
  display: grid;
  width: 100%;
  max-width: 65.75rem;
  height: 47rem;
  gap: 0.75rem;
  /* overflow: hidden; */
  grid-template-columns: 1fr 1fr;
}

.video-side {
  flex: 1.3;
  position: relative;
  background: white;
  min-width: 0;
  padding: 2.438rem 3.75rem 1rem 1.563rem;
  border-radius: 0.625rem;
  width: 32rem;
  height: 47rem;
}
.video-side video {
  width: 99%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.625rem;
}

.video-actions {
  position: absolute;
  right: 0.5rem;
  top: 36%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.063rem;
  z-index: 10;
}
.v-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.v-action span{font-size: 0.563rem; color: #959595; font-weight: 700;}
.action-btn {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #f9f9f9;
  backdrop-filter: blur(0.625rem);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.action-btn:hover { background: #fff; transform: scale(1.05);}
.action-btn img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}
.like-icon { width: 1.5rem; height: 1.375rem;}
.arrow-btn img {
  width: 1.125rem;
  height: 1.125rem;
}
.action-count {
  font-size: 0.75rem;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.5);
}
.v-divider {
  width: 1.5rem;
  height: 0.0625rem;
  background: rgba(255, 255, 255, 0.3);
  margin: 0.25rem 0;
}
.scroll-arrows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.info-side {flex: 1;display: flex;flex-direction: column;min-width: 0;}
.info-scroll-area {
  margin-top: 1.063rem;
  display: grid;
  align-content: space-between;
  height: 100%;
}
.info-scroll-area::-webkit-scrollbar { width: 0.25rem;}
.info-scroll-area::-webkit-scrollbar-thumb {background: #ddd;border-radius: 0.25rem;}
.video-header-info {
  margin-bottom: 0.938rem;
  background: white;
  border-radius: 0.625rem;
  padding: 0.563rem 0.688rem;
}
.linked-product-wrapper :deep(.title){font-size: 0.813rem; font-weight: 700;-webkit-box-orient: vertical; -webkit-line-clamp: 1;overflow: hidden; height: fit-content;}
.linked-product-wrapper :deep(.price){font-size: 0.875rem; font-weight: 700; padding: 0.188rem 0.438rem; color: #ffffff; background: var(--btn-bg); width: fit-content; border-radius: 0.625rem; margin-top: 0.313rem;}
.linked-product-wrapper :deep(.product-content__bottom){font-size: 0.813rem; font-weight: 700;-webkit-box-orient: vertical; -webkit-line-clamp: 1;overflow: hidden; margin-top: 0.313rem;}
.linked-product-wrapper :deep(.product-card){min-height: fit-content;}
.video-title {
  font-size: 1.25rem;
  font-weight: 400;
  color: #000000;
  line-height: 1;
  margin: 0;
  height: 2.875rem;
}
.video-stats-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.375rem;
  color: #999;
  font-size: 0.813rem;
  margin-top: 1.25rem;
}
.dot {width: 0.1875rem;height: 0.1875rem;background: #ccc;border-radius: 50%;}
.author-card {
  background: white;
  border-radius: 1rem;
  padding: 0.688rem 1rem;
  height: fit-content;
  width: 100%;
  order: 2;
}
.linked-product-wrapper{
  order: 3;
}
.author-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.author-main_block{
  display: grid;
  align-items: center;
  gap: 0.35rem;
}
.author-ava {
  width: 3.125rem;
  height: 3.125rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.author-details {display: grid;flex: 1;min-width: 0;}
.name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  display: inline-block;
  text-transform: lowercase;
  margin-top: .8rem;
}
.name::first-letter {
  text-transform: uppercase;
}
.rating-badge {display: flex;align-items: center;gap: 0.5rem; margin-top: 0;}
.rating-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--btn-bg);
  width: auto;
}
.stars { display: flex; gap: 0.125rem; }
.star-icon { width: 0.938rem; height: 0.938rem; }
.btn-primary {
  width: 6.875rem;
  background: #6aaa7d;
  color: white;
  border: none;
  padding: 0.438rem 1rem;
  border-radius: 0.313rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow:none;
  text-align: center;
  justify-content: center;
  margin-left: .5rem;
}
.comments-block {
  padding: 0.625rem 0.875rem;
  height: 19.125rem;
  background: white;
  border-radius: 0.625rem 0.625rem 0 0;
}
.comments-block::-webkit-scrollbar { width: 0.25rem;}
.comments-block::-webkit-scrollbar-thumb {background: #ddd;border-radius: 0.25rem;}
.section-title {
  display: flex;
  align-items: center;
  gap: 10.2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  position: sticky;
  top: 0;
  background: #fff;
  padding-bottom: 0.5rem;
  z-index: 2;
}
.section-title img {width: 1.5rem;height: 1.5rem;}
.comments-empty {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  font-size: 0.875rem;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 15.8rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}
.comment-item {display: flex;gap: 0.75rem;}
.comment-item > img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.c-body { flex: 1; min-width: 0;}
.c-user {font-size: 1rem;font-weight: 600;color: #1a1a1a;}
.c-date {font-size: 0.75rem;color: #959595;}
.c-text {font-size: 0.9375rem;color: #444;margin: 0 0 0.438rem 0;}
.c-header {display: grid; gap: 0.15rem;}
.c-header_footer{display: flex;gap: 5rem;}
.c-reply {font-size: 0.75rem;color: #828282;cursor: pointer;transition: color 0.2s;}
.c-reply:hover { color: #6aaa7d;}
.footer-input {padding: 0.333rem 0.5rem 0.467rem 0.5rem;border-top: 0.0625rem solid #eee;background: #fff;border-radius: 0 0 0.625rem 0.625rem;}
.input-row {display: flex;align-items: center;gap: 0.5rem;}
.footer-input input {
  flex: 1;
  background: #f1f1f1;
  border: none;
  padding: 0.467rem 0.8rem;
  border-radius: 0.438rem;
  font-size: 0.875rem;
  outline: none;
  transition: background 0.2s;
}
.footer-input input:focus {background: #e8e8e8;}
.send-btn {
  width: 2rem;
  height: -webkit-fill-available;
  border-radius: 0.467rem;
  background: #E5E5E5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;
}
.send-btn:hover { background: #5a9669;}
.send-btn img { width: 0.938rem; height: 0.938rem;}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
  padding: 1.25rem;
}
.share-modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 24rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}
.modal-header {display: flex;justify-content: space-between;align-items: center;margin-bottom: 1.125rem;}
.modal-header h3 {  font-size: 1.25rem;  font-weight: 500;  margin: 0;  color: #1a1a1a;}
.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-modal:hover { color: #1a1a1a;}
.link-section {display: flex;flex-direction: column;gap: 0.75rem;}
.link-section label {font-size: 0.875rem;color: #999;margin: 0;}
.input-wrapper {
  background: #fff;
  border: 0.0625rem solid #ddd;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
}
.input-wrapper input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #333;
  outline: none;
}
.copy-btn {
  width: fit-content;
  background: #6aaa7d;
  color: #fff;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.938rem;
}
.copy-btn:hover {background: #5a9669;}
.shorts-block_avt{
  display: grid;
  grid-template-columns: 50% 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.reply-banner{display: flex;gap: 2rem;margin-bottom: .5rem;justify-content: space-between;}
.reply-banner button{font-size: 1rem; width: 1.3rem;}
.own-badge {font-size: 0.55rem;color: #999;padding: 0 1rem;}
.favorite-icon {width: 1.5rem; height: 1.5rem;}
/* .favorite-icon
  filter: brightness(0) saturate(100%) invert(31%) sepia(82%) saturate(4477%) hue-rotate(340deg) brightness(92%) contrast(96%);
} */
.favorite-icon[src*="-fill"] {
  filter: invert(27%) sepia(95%) saturate(5000%) hue-rotate(350deg) brightness(95%) contrast(100%);
}
.comment-thread {display: flex;flex-direction: column;gap: 0.5rem;}
.comment-replies {display: flex;flex-direction: column;gap: 0.5rem;margin-left: 1.125rem;}
.reply-item {background: #F6F6F6;border-radius: 0.625rem;padding: 0.225rem 0.475rem;align-items: flex-start;}
.reply-item .c-header {display: flex;flex-wrap: wrap;align-items: center;row-gap: 0.35rem; column-gap: .55rem;}
.c-reply-badge {font-size: 0.75rem;color: #8E8C8C;line-height: 1;}
.reply-item .c-text {width: 100%;}
.reply-item .reply-avatar{width: 2rem; height: 2rem;}
:deep(.product-card .product-img){height: 9rem;}
:deep(.product-card){height: 15.25rem;}
</style>