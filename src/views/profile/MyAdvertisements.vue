<template>
  <div class="general-container ads-page">
    <div class="header-row">
      <h2 class="page-title">Мои объявления
        <router-link to="/profile/create-ad" class="btn go-to-ads-btn">Создать объявления</router-link>
      </h2>
    </div>
    <div class="tabs-nav">
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
            <router-link :to="productLink(ad)">
              <img 
                :src="ad.image" 
                alt="product" 
                @error="ad.image = '/src/assets/img/placeholder.png'"
              />
            </router-link>
          </div>
          <div class="ad-main-info">
            <div class="ad-title-row">
              <h3 class="ad-title">
                <router-link :to="productLink(ad)" class="ad-title-link">
                  {{ ad.title }}
                </router-link>
              </h3>
              <button class="menu-gear-btn" :class="{ active: activeMenuId === ad.id }" @click.stop="toggleMenu(ad.id)">
                <img src="/src/assets/img/settings-gear3.svg" alt="menu" />
              </button>
              <div v-if="activeMenuId === ad.id" class="video-dropdown-menu">
                <button @click="editAd(ad.id)">Редактировать</button>
                <!-- <button v-if="activeTab !== 'archive'" @click="handleStatusChange(ad.id, 'archive')">
                  В архив
                </button> 
                <button v-else @click="handleStatusChange(ad.id, 'active')">
                  Опубликовать заново
                </button>-->
                <button class="delete-btn" @click="openConfirmDelete(ad)">Удалить</button>
              </div>
            </div>
            <div class="ad-location"><img src="/src/assets/img/location_on.svg" />{{ ad.city }}</div>
            <p class="ad-description">{{ ad.description }}</p>
            <!-- <div v-if="activeTab === 'archive'" class="archive-reason">Продал / Другая причина</div> -->
            <div class="ad-price">{{ ad.price.toLocaleString() }} ₽</div>
            <!-- <div class="ad-stock">{{ ad.stock }} шт. в наличии</div> -->
            <!-- <div class="ad-auto-pub">Автопубликация: осталось {{ ad.daysLeft }} дней</div> -->
          </div>
          <div class="ad-stats-block">
            <!-- <div class="mini-preview-stats">
              <img :src="ad.image" class="preview-img-mini" @error="$event.target.style.display='none'" />
              <div class="stats-column">
                <div class="stat-item">
                  <img src="/src/assets/img/icons/eye.svg" /> {{ ad.views }}
                </div>
                <div class="stat-item">
                  <img src="/src/assets/img/icons/heart.svg" /> {{ ad.likes }}
                </div>
                <div class="stat-item">
                  <img src="/src/assets/img/icons/comment.svg" /> {{ ad.comments }}
                </div>
                <div class="stat-item">
                  <img src="/src/assets/img/icons/share.svg" /> {{ ad.shares }}
                </div>
              </div>
            </div> -->
            <div class="creat-akk">{{ "Опубликовано " + formatDate(ad.createdAt) }}</div>
            <!-- <button v-if="activeTab === 'active'" class="btn boost-btn">Увеличить продажи</button> -->
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
        <router-link to="/profile/create-ad" class="btn go-to-ads-btn">К созданию</router-link>
      </div>
    </div>
  </div>
  <transition name="fade">
      <div v-if="isConfirmOpen" class="modal-overlay" @click.self="closeConfirm">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-modal__content">
            <h2>Вы действительно хотите удалить объявление?</h2>
          </div>
          <div class="confirm-modal__actions">
            <button type="button" class="btn go-to-ads-btn" @click="confirmDelete">Да, удалить</button>
            <button class="btn btn-close" @click="closeConfirm">Нет, я ошибся</button>
          </div>
        </div>
      </div>
    </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter,useRoute } from "vue-router";
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "/src/utils/notify";
import { formatDate } from "/src/utils/formatters.js"

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const activeMenuId = ref(null);
const activeTab = ref("active");
const isLoading = ref(false);
const myAds = ref([]);
const isConfirmOpen = ref(false);
const selectedAdId = ref(null);
const selectedAdS3Key = ref(null);


const openConfirmDelete = (ad) => {
  selectedAdId.value = ad.id;
  selectedAdS3Key.value = ad.s3Key || null;
  isConfirmOpen.value = true;
  activeMenuId.value = null;
};

const closeConfirm = () => {
  isConfirmOpen.value = false;
  selectedAdId.value = null;
  selectedAdS3Key.value = null;
};

const confirmDelete = async () => {
  if (!selectedAdId.value) return;
  const success = await auth.deleteAdvert(selectedAdId.value, selectedAdS3Key.value);
  if (success) {
    myAds.value = myAds.value.filter(a => a.id !== selectedAdId.value);
  }
  closeConfirm();
};
// Ссылка на страницу товара
const productLink = (ad) => ({
  name: 'Product',
  params: {
    type: ad.category || 'tovary',
    section: ad.section || 'default',
    id: ad.id
  }
});

// Загрузка объявлений
const loadAdverts = async () => {
  isLoading.value = true;
  try {
    console.log('Загружаем объявления...');
    const ads = await auth.fetchMyAdverts();
    console.log('Получено объявлений:', ads.length);
    console.log('Первое объявление:', ads[0]);
    myAds.value = ads.map(ad => {
      let status = ad.status || 'active';
      const statusMap = {
        'ACTIVE': 'active',
        'ACTIVE_PUBLISHED': 'active',
        'DRAFT': 'drafts',
        'ARCHIVED': 'archive',
        'DELETED': 'archive'
      };
      if (statusMap[status]) {
        status = statusMap[status];
      }
      return {
        id: String(ad.id),
        title: ad.title,
        price: Number(ad.price) || 0,
        stock: ad.stock || 0,
        daysLeft: ad.daysLeft || 30,
        description: ad.description || '',
        city: ad.address || ad.city || '',
        views: ad.viewsCount || ad.views || 0,
        likes: ad.likesCount || ad.likes || 0,
        comments: ad.commentsCount || ad.comments || 0,
        shares: ad.sharesCount || ad.shares || 0,
        status: status,
        category: ad.category || 'tovary',
        section: ad.subCategory || ad.section || 'default',
        images: ad.pictureUrls || [],
        image: ad.pictureUrls?.[0] || ad.thumbnailUrl || '/src/assets/img/placeholder.png',
        s3Key: ad.pictures?.[0]?.s3Key || ad.s3Key,
        videoId: ad.videoId,
        createdAt: ad.createdAt
      };
    });
  } catch (e) {
    console.error("Ошибка загрузки:", e);
    notify("Не удалось загрузить объявления", "error");
  } finally {
    isLoading.value = false;
  }
};

// Фильтрация по табам
const currentAds = computed(() => {
  return myAds.value.filter(ad => ad.status === activeTab.value);
});

const counts = computed(() => ({
  active: myAds.value.filter(ad => ad.status === 'active').length,
  archive: myAds.value.filter(ad => ad.status === 'archive').length,
}));

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const closeMenu = (e) => {
  if (!e.target.closest('.ad-card-horizontal')) {
    activeMenuId.value = null;
  }
};

const handleStatusChange = async (id, newStatus) => {
  const success = await auth.updateAdvertStatus(id, newStatus);
  if (success) {
    const ad = myAds.value.find(a => a.id === id);
    if (ad) ad.status = newStatus;
  }
  activeMenuId.value = null;
};

const handleDelete = async (ad) => {
  if (!confirm("Вы точно хотите удалить объявление?")) return;
  const success = await auth.deleteAdvert(ad.id, ad.s3Key);
  if (success) {
    myAds.value = myAds.value.filter(a => a.id !== ad.id);
  }
  activeMenuId.value = null;
};

const editAd = (id) => {
  router.push({ name: 'EditAd', params: { id } });
};

onMounted(() => {
  loadAdverts();
  window.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  window.removeEventListener("click", closeMenu);
});
</script>

<style scoped>
.ad-title-link {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s;
}
.ad-title-link:hover {
  opacity: 0.7;
}
.tabs-nav {
  display: flex;
  gap: 0rem;
  border-radius: 0.625rem;
  margin-bottom: 1.625rem;
  background: var(--bg-defort);
  width: fit-content;
  padding: 0.125rem 0.25rem;
}
.tabs-nav button {
  padding: 1rem 3.188rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: 700;
  color: #858685;
  cursor: pointer;
  position: relative;
  background: var(--bg-defort);
  border-radius: 0.625rem;
}
.tabs-nav button.active {
  color: var(--bg-defort);
  background: var(--btn-bg);
}
.tabs-nav button.active .tab-count{color: var(--bg-defort);}
.tab-count {
  position: absolute;
  font-size: 1.25rem;
  font-weight: 700;
  top: .3rem;
  color: #858685;
  vertical-align: super;
}
.ad-card-horizontal {
  background: white;
  border-radius: 1.25rem;
  padding: 0.625rem;
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
}
.ad-image-block {
  width: 11.75rem; 
  /* height: 12.375rem; */
}
.preview-img-mini{
  width: 7rem;
  height: 9.688rem;
  border-radius: 1.25rem;
  object-fit: cover;
}
.ad-image-block img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.25rem;
}
.ad-main-info {
  width: 31.625rem;
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
  width: 100%;
}
.ad-title{ height: 3.5rem; margin-bottom: .4rem; padding-right: 4.5rem; overflow: hidden;}
.ad-title a{
  font-size: 1.5rem;
  font-weight: 700;
  display: inline-block;
  text-transform: lowercase;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 700;
  border-radius: 0;
}
.ad-title a::first-letter {
  text-transform: uppercase;
}
.ad-price {
  font-size: 1.5rem;
  padding: 0.438rem 1rem;
  background: var(--btn-bg);
  font-weight: 700;
  width: fit-content;
  color: var(--bg-defort);
  border-radius: 0.625rem;
}
.ad-stock, .ad-auto-pub,.archive-reason {
  font-size: 1rem;
  margin-bottom: 0.313rem;
}
.ad-auto-pub {
  color: #aaa;
}
.ad-description {
  margin: 1rem 0 1rem 0;
  font-size: 1rem;
  color: #858685;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 700;
}
.ad-location {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.438rem;
  font-weight: 700;
  font-size: 1rem;
}
.ad-location img{
  width: 1.563rem;
  height: 1.563rem;
}
.ad-stats-block {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.375rem;
  margin-left: 1.25rem;
  width: 36%;
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
  top: 3.688rem;
  right: 0.75rem;
  background: var(--btn-bg);
  border-radius: 0.938rem;
  overflow: hidden;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  box-shadow: 0 0.5rem 1.25rem rgba(0,0,0,0.1);
}
.video-dropdown-menu button {
  background: none;
  border: none;
  color: #F5F5F5;
  padding: 0.813rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  border-radius: 0;
}
.video-dropdown-menu button:first-child {
  padding-top: 0.8rem;
}
.video-dropdown-menu button:last-child {
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}
.video-dropdown-menu button:hover {
  background: rgba(0,0,0,0.08);
}
.video-dropdown-menu button + button {
  border-top: 1px solid #D9D9D9;
}
.page-title .go-to-ads-btn{font-weight: 700;font-size: 1.25rem;padding: 1.125rem 1rem;background: var(--btn-bg);color: #F5F5F5;transition: opacity .3s;border-radius: 1.25rem;}
.menu-gear-btn {position: absolute;top: 0rem;right: 0rem;width: 4.25rem;height: 2.938rem;background: var(--btn-bg);border: none;border-radius: 0 1.25rem 0 1.25rem;display: flex;align-items: center;justify-content: center;cursor: pointer;z-index: 2;transition: all .3s;}
.menu-gear-btn img {width: 2rem;height: 2rem;filter: brightness(0) invert(1);}
.menu-gear-btn.active,
.menu-gear-btn:active {background: var(--bg-defort);box-shadow: 0px 4px 4px 0px #00000040;}
.menu-gear-btn.active img,.menu-gear-btn:active img {filter: none;}
.empty-messages {display: flex;flex-direction: column;align-items: center;justify-content: center;text-align: center;padding: 6.25rem 1.25rem;color: #888;}
.empty-icon {font-size: 7rem; margin-bottom: 0.25rem;opacity: .6;}
.empty-messages h3 {color: #333;margin-bottom: 0.625rem;}
.empty-messages p {max-width: 18.75rem;font-size: 0.875rem;line-height: 1.4;margin-bottom: 1.563rem;}
.creat-akk{font-size: 1rem;color: #858685;text-align: right; width: 100%;}
.confirm-modal{padding: 1.875rem;background: white;border-radius: 2.188rem;}
.confirm-modal__content{display: grid;gap: 1rem;justify-items: center;font-weight: 700;}
.confirm-modal__actions{display: flex;justify-content: center;gap: 1.25rem;margin-top: 2.938rem;font-size: 1.25rem;}
.go-to-ads-btn{ width: fit-content;padding: 0.938rem 1.875rem;border-radius: 1rem;font-size: 1.25rem;}
.btn-close{background: #D8D8D8; border-radius: 1rem; padding: 0.938rem 1.125rem;}
.modal-overlay {pointer-events: auto;}
@media (max-width: 77rem){
  .ad-main-info,.ad-title-row,.ad-description{
    width: 20rem;
  }
}
</style>
