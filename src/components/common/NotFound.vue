<template>
  <div class="error-page">
    <!-- <div class="error-header">
      <h1>Ошибка 404</h1>
    </div>
     -->
    <div class="error-content">
      <div class="error-visual">
        <div class="error-icon">
          <img src="/src/assets/img/404/vjl;t-404.png" alt="" />
        </div>
        <span class="error-number"></span>
      </div>

      <p class="error-text">К сожалению, такой страницы нет</p>

      <router-link to="/" class="back-btn"> Перейти на главную </router-link>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fff;
  align-items: center;
}

.error-header {
  width: 100%;
  background-color: #2d2d2d; /* Темная плашка как на скрине */
  padding: 40px 0;
  text-align: center;
}

.error-header h1 {
  color: #fff;
  font-size: 3rem;
  font-weight: 500;
}

.error-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.error-visual {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.error-number {
  width: 24.875rem;
  height: 11.375rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='330' height='155' viewBox='0 0 330 155' fill='none'%3E %3Cg filter='url(%23filter0_g_779_339)'%3E %3Cpath d='M66.1094 147.75V113.473H4V97.3594L69.332 4.58594H83.6875V97.3594H103.023V113.473H83.6875V147.75H66.1094ZM66.1094 97.3594V32.8086L21.2852 97.3594H66.1094ZM121.09 77.1445C121.09 60.2174 122.815 46.6107 126.266 36.3242C129.781 25.9727 134.957 17.9974 141.793 12.3984C148.694 6.79948 157.353 4 167.77 4C175.452 4 182.19 5.5625 187.984 8.6875C193.779 11.7474 198.564 16.207 202.34 22.0664C206.116 27.8607 209.078 34.957 211.227 43.3555C213.375 51.6888 214.449 62.9518 214.449 77.1445C214.449 93.9414 212.724 107.516 209.273 117.867C205.823 128.154 200.647 136.129 193.746 141.793C186.91 147.392 178.251 150.191 167.77 150.191C153.967 150.191 143.128 145.243 135.25 135.348C125.81 123.434 121.09 104.033 121.09 77.1445ZM139.156 77.1445C139.156 100.647 141.891 116.305 147.359 124.117C152.893 131.865 159.697 135.738 167.77 135.738C175.842 135.738 182.613 131.832 188.082 124.02C193.616 116.207 196.383 100.582 196.383 77.1445C196.383 53.5768 193.616 37.9193 188.082 30.1719C182.613 22.4245 175.777 18.5508 167.574 18.5508C159.501 18.5508 153.056 21.9688 148.238 28.8047C142.184 37.5286 139.156 53.6419 139.156 77.1445ZM288.766 147.75V113.473H226.656V97.3594L291.988 4.58594H306.344V97.3594H325.68V113.473H306.344V147.75H288.766ZM288.766 97.3594V32.8086L243.941 97.3594H288.766Z' fill='%2364A07A'/%3E %3C/g%3E %3Cdefs%3E %3Cfilter id='filter0_g_779_339' x='0' y='0' width='329.68' height='154.191' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E %3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E %3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E %3CfeTurbulence type='fractalNoise' baseFrequency='0.25 0.25' numOctaves='3' seed='7713'/%3E %3CfeDisplacementMap in='shape' scale='8' xChannelSelector='R' yChannelSelector='G' result='displacedImage' width='100%25' height='100%25'/%3E %3CfeMerge result='effect1_texture_779_339'%3E %3CfeMergeNode in='displacedImage'/%3E %3C/feMerge%3E %3C/filter%3E %3C/defs%3E %3C/svg%3E");
  background-repeat: no-repeat;
  background-size: 25rem;
}
.error-icon img{
  width: 8.61rem;
  height: 8.55rem;
}
.error-text {
  font-size: 1.2rem;
  color: #2d2d2d;
  margin-bottom: 40px;
}

.back-btn {
  background-color: #76a084;
  color: white;
  padding: 12px 35px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.back-btn:hover {
  opacity: 0.9;
}
</style>
