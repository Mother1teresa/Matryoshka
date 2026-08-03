<script setup>
import { ref, watch, nextTick } from "vue";
import { useRegionModalStore } from "/src/stores/regionModal.js";
import { geocodeByQuery, geocodeByCoords } from "/src/utils/geocode.js";

const modal = useRegionModalStore();
const raw = modal.coordinates || [37.6173, 55.7558];
const markerCoords = ref([raw[1], raw[0]]); 
const searchQuery = ref(modal.selectedRegion || "");

const isClient = typeof window !== 'undefined';
let map = null;
let placemark = null;
let searchTimeout = null;
const suggestions = ref([]);

function initMap() {
  if (!isClient || !window.ymaps) {
    console.warn('Yandex Maps API не загружен');
    return;
  }
  
  if (map) {
    try { map.destroy(); } catch (e) {}
    map = null;
    placemark = null;
  }
  
  const container = document.getElementById('map-container');
  if (!container) return;
  container.innerHTML = '';

  window.ymaps.ready(() => {
    try {
      map = new window.ymaps.Map("map-container", {
        center: markerCoords.value,
        zoom: 12,
        controls: [],
      }, {
        copyrightLogoVisible: false,
        copyrightProvidersVisible: false,
        copyrightUaVisible: false,
        suppressMapOpenBlock: true
      });

      placemark = new window.ymaps.Placemark(markerCoords.value, {}, {
        preset: "islands#redIcon",
        draggable: true,
      });
      placemark.events.add('dragend', async () => {
        const coords = placemark.geometry.getCoordinates();
        markerCoords.value = coords;
        const cityName = await geocodeByCoords(coords[1], coords[0]);
        if (cityName) searchQuery.value = cityName;
      });

      map.geoObjects.add(placemark);
    } catch (e) {
      console.error('Ошибка создания карты:', e);
    }
  });
}
function handleSearch() {
  if (!searchQuery.value.trim()) return;
  geocodeByQuery(searchQuery.value).then(result => {
    if (result && map && placemark) {
      const [lon, lat] = result.coordinates;
      const coords = [lat, lon];
      markerCoords.value = coords;
      placemark.geometry.setCoordinates(coords);
      map.setCenter(coords, 12);
    }
  });
}
// Автопоиск с debounce
watch(searchQuery, (value) => {
  if (!isClient || !value.trim()) {
    suggestions.value = [];
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (window.ymaps && window.ymaps.suggest) {
      try {
        const res = await window.ymaps.suggest(value);
        suggestions.value = res.slice(0, 5);
      } catch (e) {
        suggestions.value = [];
      }
    }
    const result = await geocodeByQuery(value);
    if (result && map && placemark) {
      const [lon, lat] = result.coordinates;
      const coords = [lat, lon];
      markerCoords.value = coords;
      placemark.geometry.setCoordinates(coords);
      map.setCenter(coords, 12, { duration: 300 });
    }
  }, 400);
});
function selectSuggestion(suggestion) {
  searchQuery.value = suggestion.displayName || suggestion.value;
  suggestions.value = [];
  handleSearch();
}

function confirmSelection() {
  const [lat, lon] = markerCoords.value;
  modal.setRegion(searchQuery.value, [lon, lat]);
  modal.close();
}

watch(() => modal.isOpen, (open) => {
  if (!isClient) return;
  
  if (open) {
    nextTick(() => {
      setTimeout(() => {
        initMap();
        if (searchQuery.value.trim()) {
          geocodeByQuery(searchQuery.value).then(result => {
            if (result && map && placemark) {
              const [lon, lat] = result.coordinates;
              const coords = [lat, lon];
              markerCoords.value = coords;
              placemark.geometry.setCoordinates(coords);
              map.setCenter(coords, 12);
            }
          });
        }
      }, 300);
    });
  } else {
    if (map) {
      try { map.destroy(); } catch (e) {}
      map = null;
      placemark = null;
    }
  }
}, { immediate: true });
</script>
<template>
  <div v-if="modal.isOpen" class="modal-overlay" @click="modal.close()">
    <div class="region-card" @click.stop>
      <h3 class="title">Город или регион</h3>

      <div class="input-wrapper">
        <div style="position: relative; flex: 1;">
          <input
            v-model="searchQuery"
            placeholder="Поиск города..."
            @keyup.enter="handleSearch"
          />
          <ul v-if="suggestions.length" class="suggestions-list">
            <li
              v-for="(s, i) in suggestions"
              :key="i"
              @mousedown.prevent="selectSuggestion(s)"
            >
              {{ s.displayName || s.value }}
            </li>
          </ul>
        </div>
      </div>
      <p class="subtitle">Укажите своё местоположение</p>
      <div id="map-container" class="map-container"></div>
      <div class="footer-row">
        <div class="radius-block">
          <span>Радиус поиска:</span>
          <input type="number" placeholder="0" min="0" />
          <span>км</span>
        </div>

        <button class="btn-confirm" @click="confirmSelection">
          Показать объявления
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.region-card { background: white; width: 90%; max-width: 37.5rem; border-radius: 2.5rem; padding: 2.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);}
.input-wrapper { display: flex; gap: 0.625rem; margin: 1rem 0;}
.input-wrapper input { text-transform: capitalize; flex: 1; width: 100%; padding: 0.75rem 1rem; background: #f2f2f2; border: 1px solid transparent; border-radius: 0.75rem; outline: none;}
.input-wrapper input:focus { border-color: #76a58f;}
.btn-search { padding: 0 20px; background: #eee; border: none; border-radius: 0.75rem; cursor: pointer;}
.subtitle { font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;}
.map-container { width: 100%; height: 250px; border-radius: 1rem; overflow: hidden; border: 1px solid #eee; display: block; position: relative;}
.footer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;}
.radius-block { display: flex; align-items: center; gap: 0.5rem; color: #666;}
.radius-block input { width: 60px; background: #f2f2f2; border: none; padding: 0.5rem; border-radius: 0.5rem;text-align: center;}
.btn-confirm { background: #76a58f; color: white; border: none; padding: 0.75rem 1.875rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer;}
.my-marker { font-size: 30px; position: absolute; transform: translate(-50%, -100%); }
.suggestions-list { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: white; border: 1px solid #e0e0e0; border-radius: 0.75rem; z-index: 100; list-style: none; padding: 6px 0; margin: 0; max-height: 220px; overflow-y: auto; box-shadow: 0 4px 16px rgba(0,0,0,0.08);}
.suggestions-list li { padding: 0.625rem 1rem; cursor: pointer; font-size: 0.95rem; color: #333; transition: background 0.15s;}
.suggestions-list li:hover {background: #f5f5f5;}
</style>
