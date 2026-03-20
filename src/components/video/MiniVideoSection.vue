<template>
  <section class="mini-video">
    <div class="container">
      <div class="mini-video-section">
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
        <a href="">
          <img
            src="/src/assets/img/video/fs.jpg"
            alt=""
            class="mini-video_img"
          />
        </a>
      </div>
      <div class="block-link">
        <a href=""
          >Мини-видео
          <img src="/src/assets/img/video/arrow.svg" alt="" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.mini-video {
  overflow: hidden;
  background-color: white;
}

.mini-video-section {
  padding: 1rem 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow: hidden;
  gap: 0.938rem;
}
.mini-video .container {
  height: 17.5rem;
  width: 100rem;
  position: relative;
  overflow: hidden;
}
.block-link {
  /* opacity: 50%; */
  z-index: 0;
  width: 24.875rem;
  position: absolute;
  right: 0;
  top: 0.688rem;
  height: 16rem;
  background-color: #ffffff8a;
  transition: width .8s;
}

.block-link a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.413rem 1.313rem 0.413rem 0.938rem;
  color: white;
  background-color: var(--btn-bg);
  box-shadow: 0px 4px 4px 0px #00000040;
  border-radius: 0.625rem;
  width: fit-content;
  width: 13.25rem;
  z-index: 1;
  right: 1.4rem;
}
.block-link a img {
  width: 1.125rem;
  transition: all 0.3s;
}
.block-link a:hover img {
  transform: translateX(25%);
}
.mini-video_img {
  width: 11.688rem;
  height: 15.438rem;
  border-radius: 0.625rem;
}
@media (max-width:77rem) {
  .block-link{
    width: 37%;
  }
}
</style>
