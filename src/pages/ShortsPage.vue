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

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const favStore = useFavoritesStore();
const subStore = useSubscriptionStore();
const modal = useModalStore();

const videoRefs = ref([]);
const scrollContainer = ref(null);
const newComment = ref("");
const replyTo = ref(null);
let copyTimeout = null;
const isCopied = ref(false);

const videos = computed(() => authStore.allVideos);
const isLoading = computed(() => authStore.isVideosLoading);

// ===== AUTH CHECK =====
const checkAuthAndRun = (
  action,
  message = "Авторизуйтесь, чтобы продолжить",
) => {
  if (!authStore.isAuthenticated) {
    modal.openLogin();
    notify(message);
    return;
  }
  action();
};

// ===== LIKE =====
const onLikeClick = (video) => {
  if (!video) return;
  checkAuthAndRun(() => {
    favStore.toggle(video.id);
    notify(
      favStore.isFavorite(video.id)
        ? "Добавлено в избранное"
        : "Удалено из избранного",
    );
  }, "Войдите, чтобы добавить в избранное");
};

// ===== SUBSCRIBE =====
const onSubscribeClick = (authorId) => {
  checkAuthAndRun(async () => {
    const isNowSubscribed = await subStore.toggle(authorId);
    notify(
      isNowSubscribed ? "Вы подписались на автора" : "Вы отписались от автора",
    );
  });
};

// ===== WRITE MESSAGE =====
const onWriteClick = (video) => {
  checkAuthAndRun(async () => {
    try {
      const roomId = await authStore.createPrivateRoom(video.author.id);
      router.push({ name: "ChatDetail", params: { id: roomId } });
    } catch (err) {
      notify("Не удалось открыть чат", "error");
    }
  }, "Войдите, чтобы написать сообщение");
};

// ===== COMMENTS =====
const postComment = (video, parentId = null) => {
  if (!newComment.value.trim()) return;

  checkAuthAndRun(async () => {
    try {
      // API вызов (раскомментировать когда бэк готов)
      // await api.post(`/api/shorts/${video.id}/comments`, {
      //   text: newComment.value,
      //   parentId: parentId || null
      // });

      const newItem = {
        id: `temp-${Date.now()}`,
        author: {
          name: authStore.user?.username || "Вы",
          avatar: authStore.userAvatar || "/src/assets/img/mask-avatar.png",
        },
        text: newComment.value.trim(),
        createdAt: new Date().toISOString(),
        replyTo: parentId ? replyTo.value?.userName : null,
        replies: [],
      };
      if (!video.comments) video.comments = [];
      if (parentId) {
        const findParent = (comments, id) => {
          for (const c of comments) {
            if (c.id === id) return c;
            if (c.replies?.length) {
              const found = findParent(c.replies, id);
              if (found) return found;
            }
          }
          return null;
        };
        const parent = findParent(video.comments, parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(newItem);
        } else {
          video.comments.push(newItem);
        }
        replyTo.value = null;
      } else {
        video.comments.push(newItem);
      }

      newComment.value = "";
      notify(parentId ? "Ответ добавлен" : "Комментарий добавлен");
    } catch (e) {
      notify("Ошибка отправки комментария", "error");
    }
  });
};

const startReply = (comment) => {
  const currentUserName = authStore.user?.username || "Вы";
  if (comment.author?.name === currentUserName) {
    notify("Нельзя ответить на своё сообщение");
    return;
  }
  replyTo.value = {
    commentId: comment.id,
    userName: comment.author?.name || "Пользователь",
  };
  nextTick(() => {
    document.querySelector(".footer-input input")?.focus();
  });
};

const cancelReply = () => {
  replyTo.value = null;
  newComment.value = "";
};

// ===== VIDEO REFS =====
const setVideoRef = (el) => {
  if (el && !videoRefs.value.includes(el)) videoRefs.value.push(el);
};

// ===== KEYBOARD =====
const handleKeyDown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    scrollNext();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    scrollPrev();
  }
};

// ===== SCROLL =====
const scrollNext = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
  }
};

const scrollPrev = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      top: -window.innerHeight,
      behavior: "smooth",
    });
  }
};

const scrollToVideo = (id) => {
  const el = videoRefs.value.find((v) => v.dataset.id === id);
  if (el) el.scrollIntoView();
};

// ===== OBSERVER =====
const initObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play();
          router.replace({
            name: "shorts",
            params: { id: entry.target.dataset.id },
          });
        } else {
          entry.target.pause();
          entry.target.currentTime = 0;
        }
      });
    },
    { threshold: 0.6 },
  );
  videoRefs.value.forEach((v) => observer.observe(v));
};
const isOwnComment = (comment) => {
  const currentUserName = authStore.user?.username || "Вы";
  if (comment.author?.name === currentUserName) return true;
  if (comment.author?.id && authStore.user?.id) {
    return String(comment.author.id) === String(authStore.user.id);
  }
  
  return false;
};
// ===== CLOSE =====
const closeShorts = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

// ===== SHARE =====
const isShareModalOpen = ref(false);
const shareLink = ref("");

const openShareModal = (video) => {
  const baseUrl = window.location.origin;
  shareLink.value = `${baseUrl}/shorts/${video.id}`;
  isShareModalOpen.value = true;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard?.writeText(shareLink.value);
    isCopied.value = true;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => isCopied.value = false, 2000);
  } catch {
    notify("Ошибка копирования", "error");
  }
};
// Если нужен fallback для HTTP:
// const copyToClipboard = async () => {
//   try {
//     const text = shareLink.value;
//     if (navigator.clipboard && window.isSecureContext) {
//       await navigator.clipboard.writeText(text);
//     } else {
//       // Fallback
//       const el = document.createElement("textarea");
//       el.value = text;
//       el.style.cssText = 'position:fixed;left:-9999px;';
//       document.body.appendChild(el);
//       el.select();
//       document.execCommand('copy');
//       document.body.removeChild(el);
//     }
//     isCopied.value = true;
//     setTimeout(() => isCopied.value = false, 2000);
//   } catch {
//     notify("Ошибка копирования", "error");
//   }
// };
const isOwnVideo = (video) => {
  return String(video.author?.id) === String(authStore.user?.id);
};
// ===== LIFECYCLE =====
onMounted(async () => {
  if (videos.value.length === 0) {
    await authStore.fetchVideos();
  }
  window.addEventListener("keydown", handleKeyDown);
  nextTick(() => {
    initObserver();
    if (route.params.id) {
      scrollToVideo(route.params.id);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  clearTimeout(copyTimeout);
});
</script>
<template>
  <div class="shorts-page-overlay">
    <div v-if="isLoading" class="loader">Загрузка роликов...</div>
    <div v-else class="shorts-main-container" ref="scrollContainer">
      <div v-for="video in videos" :key="video.id" class="short-snap-item">
        <div class="short-content-wrapper">
          <!-- ВИДЕО (Левая часть) -->
          <div class="video-side">
            <button class="close-btn" @click="closeShorts">
              <img src="/src/assets/img/icons/close-white.svg" alt="close" />
            </button>
            <video :src="video.cdnUrl || video.url" :ref="setVideoRef" :data-id="video.id" loop playsinline muted></video>
            <div class="video-actions">
              <div class="v-action">
                <button class="action-btn" @click.stop="onLikeClick(video)">
                  <img :src="favStore.isFavorite(video.id) ? heartFilled : heart" class="like-icon"/>
                </button>
              </div>
              <div v-if="!isOwnVideo(video)" class="v-action">
                <button class="action-btn" @click="onWriteClick(video)">
                  <img src="/src/assets/img/mes.svg" />
                </button>
              </div>
              <div class="v-action">
                <button class="action-btn" @click="openShareModal(video)">
                  <img src="/src/assets/img/icons/lin.svg" alt="share" />
                </button>
              </div>
              <div class="v-divider"></div>
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
              <div class="info-scroll-area_block">
                <div class="video-header-info">
                  <h2 class="video-title">
                    {{ video.fileName || "Без названия" }}
                  </h2>
                  <div class="video-stats-row">
                    <span>{{ video.likesCount || "0" }} лайков</span>
                    <span class="dot">.</span>
                    <span>{{ video.viewsCount || "0" }} просмотров</span>
                    <span class="dot">.</span>
                    <span>{{ formatDate(video.publishedAt) }}</span>
                  </div>
                </div>
                <!-- Автор -->
                 <div class="shorts-block_avt">
                  <!-- <div class="product-card-shorts">
                    <div class="p-flex">
                      <img src="/public/img/products/img-prod2.jpg" />
                      <div class="p-text">
                        <p class="p-name">аппвавпавап</p>
                        <p class="p-price">354435435 ₽</p>
                        <p class="p-city">комментарий</p>
                      </div>
                    </div>
                    <button class="btn-primary" @click="onWriteClick(video)">
                      Написать
                    </button>
                  </div> -->
                  <div v-if="video.product" class="product-card-shorts">
                    <div class="p-flex">
                      <img :src="video.product.image" />
                      <div class="p-text">
                        <p class="p-name">{{ video.product.name }}</p>
                        <p class="p-price">{{ video.product.price }} ₽</p>
                        <p class="p-city">{{ video.product.city }}</p>
                      </div>
                    </div>
                    <button class="btn-primary" @click="onWriteClick(video)">
                      Написать
                    </button>
                  </div>
                  <div class="author-card">
                    <router-link 
                      :to="{ name: 'SellerPage', params: { id: video.author?.id } }"
                      class="author-link">
                      <div class="author-main">
                        <img :src="video.author?.avatar" class="author-ava" />
                        <div class="author-details">
                          <p class="name">{{ video.author?.name || 'Загрузка...' }}</p>
                        </div>
                      </div>
                    </router-link>
                    <div class="rating-badge">
                      <span class="rating-num">{{ video.author.rating}}</span>
                      <span class="stars">★★★★★</span>
                      <button class="btn-primary" :class="{'is-active': subStore.isSubscribed(video.author?.id,),}"@click="onSubscribeClick(video.author?.id)">
                        {{subStore.isSubscribed(video.author?.id)? "Отписаться": "Подписаться"}}
                      </button>
                    </div>
                    <div class="author-meta">
                      <p class="response">Отвечает быстро</p>
                      <p class="deals-count">
                        Кол-во сделок: {{ video.author?.deals || 0 }}
                      </p>
                    </div>
                  </div>
                 </div>
              </div>
              <!-- КОММЕНТАРИИ -->
              <div class="comments-block">
                <p class="section-title">
                  <img src="/src/assets/img/icons/comment.svg" alt="" />
                  Комментарии
                </p>
                <div v-if="video.commentsDisabled" class="comments-locked">
                  <p>Комментарии не доступны</p>
                </div>
                <div v-else-if="!video.comments?.length" class="comments-empty">
                  <p>Комментариев нет</p>
                </div>
                <div v-else class="comments-list">
                  <div v-for="comment in video.comments" :key="comment.id" class="comment-item">
                    <router-link 
                      :to="{ name: 'SellerPage', params: { id: comment.author?.id } }"
                      class="author-link">
                      <img :src="comment.author?.avatar || '/src/assets/img/mask-avatar.png'"/>
                    </router-link>
                    <div class="c-body">
                      <div class="c-header">
                        <router-link 
                          :to="{ name: 'SellerPage', params: { id: comment.author?.id } }"
                          class="c-user author-name">
                          {{ comment.author?.name || "Пользователь" }}
                        </router-link>
                         <p class="c-text">{{ comment.text }}</p>
                      </div>
                      <div class="c-header_footer">
                        <span class="c-date">{{formatDate(comment.createdAt)}}</span>
                        <span v-if="!isOwnComment(comment)" class="c-reply" @click="startReply(comment)">
                          Ответить</span>
                      </div>
                      <!-- Ответы на комментарий -->
                      <div v-if="comment.replies?.length" class="replies-list">
                        <div v-for="reply in comment.replies" :key="reply.id" class="comment-item is-reply">
                          <router-link 
                            :to="{ name: 'SellerPage', params: { id: reply.author?.id } }"
                            class="author-link">
                            <img :src="reply.author?.avatar || '/src/assets/img/mask-avatar.png'"/>
                          </router-link>
                          <div class="c-body">
                            <div class="c-header">
                              <router-link 
                                :to="{ name: 'SellerPage', params: { id: reply.author?.id } }"
                                class="c-user author-name">
                                {{ reply.author?.name }}
                              </router-link>
                              <span class="c-date">{{formatDate(reply.createdAt)}}</span>
                            </div>
                            <p class="c-text">
                              <span class="reply-to">@{{ reply.replyTo }}</span>
                              {{ reply.text }}
                            </p>
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
                <input type="text" v-model="newComment" :placeholder="replyTo ? `Ответ ${replyTo.userName}...` : 'Сообщение' " :disabled="video.commentsDisabled" @keyup.enter="postComment(video, replyTo?.commentId)"/>
                <button class="send-btn" @click="postComment(video, replyTo?.commentId)">
                  <img src="/src/assets/img/icons/send-plane.svg" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    <div v-if="isShareModalOpen" class="modal-overlay" @click.self="isShareModalOpen = false">
      <div class="share-modal">
        <header class="modal-header">
          <h3>Поделиться</h3>
          <button class="close-modal" @click="isShareModalOpen = false">
            ✕
          </button>
        </header>
        <div class="social-icons">
          <a href="#" class="social-btn whatsapp"
            ><img src="/src/assets/img/icons/whatsapp.svg"
          /></a>
          <a href="#" class="social-btn telegram"
            ><img src="/src/assets/img/icons/telegram.svg"
          /></a>
          <a href="#" class="social-btn vk"
            ><img src="/src/assets/img/icons/vk.svg"
          /></a>
          <a href="#" class="social-btn_block download"
            ><img src="/src/assets/img/icons/download.svg"
          /></a>
        </div>
        <div class="link-section">
          <label>Ссылка на мини-видео</label>
          <div class="input-wrapper">
            <input type="text" :value="shareLink" readonly />
          </div>
          <button class="copy-btn" :class="{ 'copied': isCopied }"@click="copyToClipboard">
            {{ isCopied ? 'Скопировано!' : 'Копировать ссылку' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* ===== BASE ===== */
.shorts-page-overlay {
  position: fixed;
  inset: 0;
  background: #f5f5f5;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ===== CLOSE BTN ===== */
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
.shorts-main-container::-webkit-scrollbar {
  display: none;
}

.short-snap-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
}

/* ===== WRAPPER ===== */
.short-content-wrapper {
  display: grid;
  width: 100%;
  max-width: 65.75rem;
  height: 47rem;
  gap: 0.75rem;
  overflow: hidden;
  grid-template-columns: 1fr 1fr;
}

/* ===== VIDEO SIDE ===== */
.video-side {
  flex: 1.3;
  position: relative;
  background: white;
  min-width: 0;
  padding: 2.438rem 3.75rem 1rem 1.563rem;
  border-radius: 0.625rem;
  width: 32rem;
}
.video-side video {
  width: 99%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.625rem;
}

/* ===== VIDEO ACTIONS ===== */
.video-actions {
  position: absolute;
  right: 0.5rem;
  top: 30%;
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
.action-btn:hover {
  background: #fff;
  transform: scale(1.05);
}
.action-btn img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}
.like-icon {
  width: 1.5rem;
  height: 1.375rem;
}
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

.info-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.info-scroll-area {
  /* flex: 1; */
  /* overflow-y: auto; */
  /* padding: 1.5rem; */
  margin-top: 2.063rem;
  /* scrollbar-width: thin;
  scrollbar-color: #ddd transparent; */
  display: grid;
  align-content: space-between;
  height: 100%;
}
.info-scroll-area::-webkit-scrollbar {
  width: 0.25rem;
}
.info-scroll-area::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 0.25rem;
}

/* ===== HEADER ===== */
.video-header-info {
  margin-bottom: 1.25rem;
  background: white;
  border-radius: 0.625rem;
  padding: 0.563rem 0.688rem;
}
.video-title {
  font-size: 1.25rem;
  font-weight: 400;
  color: #000000;
  line-height: 1;
  margin: 0;
}
.video-stats-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #999;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
.dot {
  width: 0.1875rem;
  height: 0.1875rem;
  background: #ccc;
  border-radius: 50%;
}

/* ===== AUTHOR CARD ===== */
.author-card {
  background: white;
  border-radius: 1rem;
  padding: 0.688rem 1rem;
  height: fit-content;
  width: 100%;
}
.author-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.author-ava {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.author-details {
  display: grid;
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}
.rating-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* flex-wrap: wrap; */
}
.rating-num {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  width: auto;
}

.stars {
  letter-spacing: 0px;
  font-size: 1.35rem;
}
.star.filled {
  color: #1a1a1a;
}

/* ===== SUBSCRIBE BUTTON ===== */
.sub-btn-green {
  background: #6aaa7d;
  color: white;
  border: none;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.sub-btn-green:hover {
  background: #5a9669;
}
.sub-btn-green.is-active {
  background: #fff;
  color: #6aaa7d;
  border: 0.0625rem solid #6aaa7d;
}
.sub-btn-green.is-active:hover {
  background: #f0f7f2;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-top: 0.563rem;
}
.response {
  font-size: 0.875rem;
  color: #8E8C8C;
  margin: 0;
}
.deals-count {
  font-size: 0.875rem;
  color: #8E8C8C;
  margin: 0;
}

/* ===== PRODUCT CARD ===== */
.product-card-shorts {
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 0.75rem 0.625rem;
  height: auto;
  width: 12.563rem;
}
.p-flex {
  display: grid;
  gap: 0.625rem;
  margin-bottom: 0.813rem;
}
.p-flex img {
  width: 100%;
  height: 8.125rem;
  border-radius: 0.75rem;
  object-fit: cover;
  flex-shrink: 0;
}
.product-card-shorts .btn-primary{
  width: 100%;
  margin-left: 0;
}
.p-text {
  flex: 1;
  min-width: 0;
}
.p-name {
  font-size: 0.75rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 0.313rem 0;
  /* line-height: 1.3; */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.p-price {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.375rem 0;
}
.p-city {
  font-size: 0.75rem;
  /* color: #999; */
  margin: 0;
}
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
.contact-btn:hover {
  background: #5a9669;
}

/* ===== COMMENTS ===== */
.comments-block {
  /* margin-bottom: 1rem; */
  padding: 0.625rem 0.875rem;
  height: 19.125rem;
  background: white;
  border-radius: 0.625rem 0.625rem 0 0;
}

.comments-block::-webkit-scrollbar {
  width: 0.25rem;
}

.comments-block::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 0.25rem;
}

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
.section-title img {
  width: 1.5rem;
  height: 1.5rem;
}
.comments-empty {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  font-size: 0.875rem;
}
.comments-locked {
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
.comments-list
.comment-item {
  display: flex;
  gap: 0.75rem;
}
.comment-item.is-reply {
  background: #F6F6F6;
  padding: 0.313rem;
  border-radius: 0.625rem;
}
.comment-item > img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.c-body {
  flex: 1;
  min-width: 0;
}
.c-user {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
}
.c-date {
  font-size: 0.638rem;
  color: #959595;
}
.c-text {
  font-size: 0.875rem;
  color: #444;
  margin: 0 0 0.438rem 0;
}
.c-reply {
  font-size: 0.75rem;
  color: #6aaa7d;
  cursor: pointer;
}
.c-header {
  display: grid;
}
.c-header_footer{
  display: flex;
  gap: 5rem;
}
.reply-to {
  color: #6aaa7d;
  font-weight: 500;
  margin-right: 0.25rem;
}
.c-reply {
  font-size: 0.75rem;
  color: #828282;
  cursor: pointer;
  transition: color 0.2s;
}
.c-reply:hover {
  color: #6aaa7d;
}
.replies-list {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.replies-list .c-header{
  display: flex; gap: .5rem;
}
/* ===== FOOTER INPUT ===== */
.footer-input {
  padding: 0.333rem 0.5rem 0.467rem 0.5rem;
  border-top: 0.0625rem solid #eee;
  background: #fff;
  border-radius: 0 0 0.625rem 0.625rem;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
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
.footer-input input:focus {
  background: #e8e8e8;
}
.footer-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
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
.send-btn:hover {
  background: #5a9669;
}
.send-btn img {
  width: 0.938rem;
  height: 0.938rem;
}

/* ===== SHARE MODAL ===== */
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
  color: #1a1a1a;
}

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

.close-modal:hover {
  color: #1a1a1a;
}

/* ===== SOCIAL ICONS ===== */
.social-icons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  border: 0.0625rem solid #e0e0e0;
  background: #fff;
}

.social-btn:hover {
  transform: scale(1.05);
}

.social-btn img {
  width: 1.25rem;
  height: 1.25rem;
}

/* WhatsApp — зелёная обводка */
.social-btn.whatsapp {
  border-color: #25d366;
}

/* Telegram — голубая обводка */
.social-btn.telegram {
  border-color: #0088cc;
}

/* VK — синяя обводка */
.social-btn.vk {
  border-color: #4a76a8;
}

/* Download — серая обводка */
.social-btn.download {
  border-color: #ccc;
}

/* ===== LINK SECTION ===== */
.link-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-section label {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

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
}

.copy-btn:hover {
  background: #5a9669;
}
.shorts-block_avt{
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.reply-banner{
  display: flex;
  gap: 2rem;
  margin-bottom: .5rem;
  justify-content: space-between;
}
.reply-banner button{
  font-size: 1rem;
  width: 1.3rem;
}
</style>
