<template>
  <Teleport to="body">
    <div v-if="isOpen" class="maintenance-overlay" @click.self="close">
      <div class="maintenance-card">
        <button class="close-x" @click="close">✕</button>
        <div class="maintenance-content">
          
          <img src="/src/assets/img/maintenance-gears.png" alt="Техработы" class="gears-img" />
          <img src="/src/assets/img/maintenance-gears2.png" alt="Техработы" class="gears-img2">
         
          <h2 class="maintenance-title">
            Этот раздел пока недоступен...<br>
            Ведутся технические работы
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
  width: 38.813rem;
  height: 21.375rem;
  border-radius: 1.25rem;
  padding: 1.25rem;
  position: relative;
  text-align: center;
  box-shadow: 0 0.625rem 1.875rem rgba(0, 0, 0, 0.1);
  display: grid;
  align-items: center;
}

.close-x {
  position: absolute;
  top: -1.5rem;
  right: -1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.gears-wrapper {
  margin-bottom: 1.875rem;
}
.gears-img {
  position: absolute;
  top: 0;
  right: 0;
  width: 87%;
  height: 8.8rem;
}
.gears-img2{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 11.618rem;
  height: 9.4rem;
}
.maintenance-title {
  font-size: 1.25rem;
  line-height: 1.875rem;
  color: #262626;
  font-weight: 700;
  margin-bottom: 1.438rem;
  text-align: left;
  z-index: 1;
}

.maintenance-footer {
  font-weight: 700;
  font-size: 1.25rem;
  text-align: right;
  width: 100%;
  background-color: #8E8C8C;
  width: fit-content;
  padding: 1.125rem 1.25rem;
  color: white;
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 1.25rem 0 1.25rem 0;
}
</style>
