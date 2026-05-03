<template>
  <div class="general-container ads-page">
    <div class="header-row">
      <h2 class="page-title">Мои объявления</h2>
      <button class="btn promo-btn">Продвижение</button>
    </div>
    <div class="tabs-nav">
      <button :class="{ active: activeTab === 'drafts' }" @click="activeTab = 'drafts'">
        Черновики <span class="tab-count">{{ counts.drafts }}</span>
      </button>
      <button :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
        Действующие <span class="tab-count">{{ counts.active }}</span>
      </button>
      <button :class="{ active: activeTab === 'archive' }" @click="activeTab = 'archive'">
        Архив <span class="tab-count">{{ counts.archive }}</span>
      </button>
    </div>
    <div class="tab-content">
      <div v-if="isLoading" class="loading-state">Загрузка объявлений...</div>
      <div v-else-if="currentAds.length > 0" class="ads-list">
        <div v-for="ad in currentAds" :key="ad.id" class="ad-card-horizontal">
            <div class="ad-image-block">
                <img :src="ad.image || '/src/assets/img/placeholder.png'" alt="product" />
            </div>
            <div class="ad-main-info">
                <div class="ad-title-row">
                <h3 class="ad-title">{{ ad.title }}</h3>
                <button class="menu-dots-btn" @click.stop="toggleMenu(ad.id)"><span></span><span></span><span></span></button>
                <div v-if="activeMenuId === ad.id" class="video-dropdown-menu">
                    <button @click="editAd(ad.id)">Редактировать</button>
                    <button v-if="activeTab !== 'archive'" @click="handleStatusChange(ad.id, 'archive')">В архив</button>
                    <button v-else @click="handleStatusChange(ad.id, 'active')">Опубликовать заново</button>
                    <button class="delete-btn" @click="handleDelete(ad.id)">Удалить</button>
                </div>
                </div>
                <div v-if="activeTab === 'archive'" class="archive-reason">Продал / Другая причина</div>
                <div class="ad-price">{{ ad.price.toLocaleString() }} ₽</div>
                <div class="ad-stock">{{ ad.stock }} шт. в наличии</div>
                <div class="ad-auto-pub">Автопубликация: осталось {{ ad.daysLeft }} дней</div>
                <p class="ad-description">{{ ad.description }}</p>
                <div class="ad-location">{{ ad.city }}</div>
            </div>
            <div class="ad-stats-block">
                <div class="mini-preview-stats">
                <img :src="ad.image" class="preview-img-mini" />
                <div class="stats-column">
                    <div class="stat-item"><img src="/src/assets/img/icons/eye.svg" /> {{ ad.views }}</div>
                    <div class="stat-item"><img src="/src/assets/img/icons/heart.svg" /> {{ ad.likes }}</div>
                    <div class="stat-item"><img src="/src/assets/img/icons/comment.svg" /> {{ ad.comments }}</div>
                    <div class="stat-item"><img src="/src/assets/img/icons/share.svg" /> {{ ad.shares }}</div>
                </div>
                </div>
                <button v-if="activeTab === 'active'" class="btn boost-btn">Увеличить продажи</button>
            </div>
        </div>
      </div>
      <!-- Пустое состояние -->
      <div v-else class="empty-messages">
        <div class="empty-icon">📦</div>
        <h3>
          {{ activeTab === 'active' ? 'У вас нет активных объявлений' : 
             activeTab === 'drafts' ? 'Черновики пусты' : 'Архив пуст' }}
        </h3>
        <p>Вы можете создать новое объявление в разделе "Создать".</p>
        <router-link to="/profile/create" class="btn go-to-ads-btn">К созданию</router-link>
      </div></div></div></template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";
const auth = useAuthStore();
const activeMenuId = ref(null);
const activeTab = ref("active");
const isLoading = ref(false);
// В будущем здесь будет запрос к api/profile/my-adverts
const myAds = ref([
  {
    id: 1,
    title: 'Короб 600*400*400 мм Т-23',
    price: 70,
    stock: 29,
    daysLeft: 30,
    description: 'Короб мастер - надёжный поставщик коробок. Предлагаем вам гофроящик 600*400*400 мм марка гофрокартона Т-23. Оптом Предлагаем вам гофроящик 600*400*400 мм марка гофрокартона Т-23. Оптом',
    city: 'г. Москва',
    views: 23645,
    likes: 249,
    comments: 23,
    shares: 11,
    status: 'active',
    image: "/img/roliks/rolik.png"
  }
]);
// Фильтрация по табам
const currentAds = computed(() => {
  return myAds.value.filter(ad => ad.status === activeTab.value);
});
// Счетчики для табов
const counts = computed(() => ({
  drafts: myAds.value.filter(ad => ad.status === 'drafts').length,
  active: myAds.value.filter(ad => ad.status === 'active').length,
  archive: myAds.value.filter(ad => ad.status === 'archive').length,
}));
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};
const closeMenu = (e) => {
  if (!e.target.closest('.video-card')) {
    activeMenuId.value = null;
  }
};
const handleArchive = async (id, status) => {
  notify("Перенесено в архив");
  closeMenu();
};
const handleDelete = async (id) => {
  if (confirm("Вы точно хотите удалить объявление?")) {
    notify("Объявление удалено");
  }
};
const editAd = (id) => {
  console.log("Редактируем:", id);
};
onMounted(() => {
  window.addEventListener("click", closeMenu);
});
onUnmounted(() => {
  window.removeEventListener("click", closeMenu);
});
</script>
<style scoped>
.tabs-nav {
  display: flex;
  gap: 4rem;
  margin-bottom: 1.625rem;
}
.tabs-nav button {
  padding-bottom: 0.625rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #000000;
  cursor: pointer;
  position: relative;
  border-radius: 0;
  border-bottom: 1px solid #020202;
}
.tabs-nav button.active {
  border-bottom: 1px solid #64a07a;
  color: #64a07a;
}
.tabs-nav button.active .tab-count{
    color: #00000094;
}
.tab-count {
  font-size: 1.2rem;
  color: #8E8C8C;
  margin-left: 0.313rem;
  vertical-align: super;
}
.ad-card-horizontal {
  background: white;
  border-radius: 1.25rem;
  padding:  0.625rem 1.25rem ;
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
}
.ad-image-block {
  width: 13rem; 
  height: 9.7rem;
  flex-shrink: 0;
  margin: 1rem;
}
.ad-image-block img{
 border-radius: 1.25rem;
}
.preview-img-mini{
  width: 7rem;
  height: 9.688rem;
  border-radius: 1.25rem;
  object-fit: cover;
}
.ad-image-block img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
.ad-main-info {
  width: 100%;
  position: relative;
  display: grid;
}
.mini-preview-stats {
  display: flex;
  gap: 0.813rem;
}
.ad-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 90%;
}
.ad-title {
  font-size: 1.5rem;
  margin-bottom: 0.563rem;
}
.ad-price {
  font-size: 1.5rem;
  margin-bottom: 0.313rem;
}
.ad-stock, .ad-auto-pub,.archive-reason {
  font-size: 1rem;
  margin-bottom: 0.313rem;
}
.ad-auto-pub {
  color: #aaa;
}
.ad-description {
  margin: 0 0 0.938rem 0;
  line-height: 1.1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 90%;
}
.ad-location {
  margin-top: auto;
}
.ad-stats-block {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.375rem;
}
.mini-preview {
  display: flex;
  gap: 0.813rem;
}
.preview-img {
  width: 5rem;
  height: 6.25rem;
  border-radius: 0.625rem;
  object-fit: cover;
}
.stats-column {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 0.563rem;
  font-size: 1rem;
}
.stat-item img {
  width: 1.563rem;
}
.boost-btn {
  background: #64A07A;
  color: #F5F5F5;
  border: none;
  text-align: center;
  padding: 0.313rem;
  border-radius: 0.625rem;
  font-size: 0.688rem;
  width: 9.125rem;
  cursor: pointer;
  font-size: 0.788rem;
}
.menu-dots-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  display: flex;
  flex-direction: row; 
  align-items: center;
  justify-content: center;
  gap: 0.188rem; 
  cursor: pointer;
  transition: opacity 0.2s;
  position: absolute;
  right: 0.25rem;
  z-index: 10;
}
.menu-dots-btn:hover {
  opacity: 0.7;
}
.menu-dots-btn span {
  width: 0.25rem;
  height: 0.25rem;
  background: #333; 
  border-radius: 50%;
}
/* Выпадашка */
.video-dropdown-menu {
  position: absolute;
  top: 1rem;
  right: 0.8rem;
  background: var(--btn-bg);
  border-radius: 0.438rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;
  max-width: 13.975rem;
  color: #f5f5f5;
  overflow: hidden;
}
.video-dropdown-menu button {
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.955rem;
  cursor: pointer;
  border-radius: 0;
  transition: 0.3s;
}
.video-dropdown-menu button:first-child {
  padding-top: 0.8rem;
}
.video-dropdown-menu button:last-child {
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}
.video-dropdown-menu button:hover {
  background: #388253;
  color: white;
}
.video-dropdown-menu .delete-btn {
  color: #89140e;
  border-top: 1px solid #eee !important;
  border-radius: 0;
}
</style>
