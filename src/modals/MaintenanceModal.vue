<template>
  <Teleport to="body">
    <div v-if="isOpen" class="maintenance-overlay" @click.self="close">
      <div class="maintenance-card">
        <button class="close-x" @click="close">✕</button>

        <div class="maintenance-content">
          <div class="gears-wrapper">
            <!-- Можно вставить SVG или IMG -->
            <img
              src="/src/assets/img/maintenance-gears.svg"
              alt="Техработы"
              class="gears-img"
            />
          </div>

          <h2 class="maintenance-title">
            Этот раздел пока недоступен, ведутся технические работы
          </h2>
          <p class="maintenance-footer">С уважением, команда "Матрёшка"</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
const open = () => (isOpen.value = true);
const close = () => (isOpen.value = false);

defineExpose({ open, close });
</script>

<style scoped>
.maintenance-overlay {
  position: fixed;
  inset: 0;
  background: #D9D9D966;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(0.25rem);

}
.maintenance-content {
  display: grid;
  justify-items: center;
}
.maintenance-card {
  background: #ffffff;
  width: 100%;
  max-width: 33.571rem;
  border-radius: 1.25rem;
  padding: 1.25rem;
  position: relative;
  text-align: center;
  box-shadow: 0 0.625rem 1.875rem rgba(0, 0, 0, 0.1);
}

.close-x {
  position: absolute;
  top: 0.938rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #333;
}

.gears-wrapper {
  margin-bottom: 1.875rem;
}

.gears-img {
  width: 11.618rem;
  height: 13.375rem;
}

.maintenance-title {
  font-size: 1.111rem;
  line-height: 1;
  color: #262626;
  font-weight: 400;
  margin-bottom: 1.438rem;
  text-align: left;
}

.maintenance-footer {
  color: #262626;
  font-weight: 400;
  line-height: 1;
  font-size: 1.111rem;
  text-align: right;
  width: 100%;
}
</style>
