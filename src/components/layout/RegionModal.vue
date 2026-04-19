<script setup>
import { ref, watch } from "vue";
import { useRegionModalStore } from "/src/stores/regionModal.js";

const modal = useRegionModalStore();
const raw = modal.coordinates || [37.6173, 55.7558];
const markerCoords = ref([raw[1], raw[0]]); 
const searchQuery = ref(modal.selectedRegion || "");

let map = null;
let placemark = null;
let searchTimeout = null;

function initMap() {
  ymaps.ready(() => {
    map = new ymaps.Map("map-container", {
      center: markerCoords.value,
      zoom: 12,
      controls: [],
      suppressMapOpenBlock: true,
    }, {
      copyrightLogoVisible: false,
      copyrightProvidersVisible: false,
      copyrightUaVisible: false,
      balloonAutoPan: false,
      suppressMapOpenBlock: true
    });

    placemark = new ymaps.Placemark(markerCoords.value, {}, {
      preset: "islands#redIcon",
    });

    map.geoObjects.add(placemark);
  });
}

// Автопоиск
let isTyping = false;
watch(searchQuery, (value) => {
  isTyping = true;
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    isTyping = false;
    handleSearch(value);
  }, 900);
});

// Поиск
async function handleSearch(query) {
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=ab3a562f-41f9-4eb0-94ab-b982e13c7742&format=json&geocode=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const feature = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (!feature) return;

    const [lon, lat] = feature.Point.pos.split(" ").map(Number);
    const coords = [lat, lon];
    markerCoords.value = coords;
    const cityName = feature.name;
    searchQuery.value = cityName;

    if (placemark && map) {
      placemark.geometry.setCoordinates(coords);
      map.setCenter(coords, 12, { duration: 300 });
    }
  } catch (e) {
    console.error("Ошибка геокодера:", e);
  }
}

function confirmSelection() {
  const [lat, lon] = markerCoords.value;
  modal.setRegion(searchQuery.value, [lon, lat]);
}

watch(
  () => modal.isOpen,
  (open) => {
    if (open) {
      setTimeout(() => {
        initMap();
        if (searchQuery.value.trim()) {
          handleSearch(searchQuery.value);
        }
      }, 50);
    }
  }
);
watch(
  () => modal.selectedRegion,
  (newRegion) => {
    if (!newRegion) {
      searchQuery.value = "";
      markerCoords.value = [55.7558, 37.6173]; 
      if (placemark && map) {
        placemark.geometry.setCoordinates([55.7558, 37.6173]);
        map.setCenter([55.7558, 37.6173], 12);
      }
    }
  }
);
</script>
<template>
  <div v-if="modal.isOpen" class="modal-overlay" @click="modal.close()">
    <div class="region-card" @click.stop>
      <h3 class="title">Город или регион</h3>

      <div class="input-wrapper">
        <input
          v-model="searchQuery"
          placeholder="Поиск города..."
          @keyup.enter="handleSearch"
        />
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

.region-card {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 2.5rem;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.input-wrapper {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}
.input-wrapper input {
  flex: 1;
  padding: 12px 16px;
  background: #f2f2f2;
  border: 1px solid transparent;
  border-radius: 12px;
  outline: none;
}
.input-wrapper input:focus {
  border-color: #76a58f;
}
.btn-search {
  padding: 0 20px;
  background: #eee;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}
.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}
.map-container {
  width: 100%;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eee;
  display: block;
  position: relative;
}
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}
.radius-block {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}
.radius-block input {
  width: 60px;
  background: #f2f2f2;
  border: none;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
}
.btn-confirm {
  background: #76a58f;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
.my-marker { font-size: 30px; position: absolute; transform: translate(-50%, -100%); }

</style>
