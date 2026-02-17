<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <a href="">Помощь</a>
        <a href="">О компании</a>
        <a href="">Наш Блог</a>
        <a href="">Реклама на сайте</a>
        <a href="">Проводник</a>
        <a href="">Правила</a>
      </div>

      <div class="footer__bottom">
        <div class="footer__bottom-left">
          <p>
            Матрёшка — сайт объявлений России.
            <a href="https://www.avito.ru/legal/">Правила</a> Матрёшки. <br />
            <a href="https://www.avito.ru/legal/rules/privacy-policy"
              >Политика конфиденциальности</a
            >. Оплачивая услуги на Матрёшка, вы принимаете
            <a href="https://www.avito.ru/legal/rules/services-agreement"
              >оферту</a
            >. <br />Матрёшка использует
            <a href="https://www.avito.ru/legal/rules/rec-technologies/"
              >рекомендательные технологии</a
            >.
          </p>
        </div>
        <div class="footer__bottom-right">
          <a href="http://">
            <img src="/src/assets/img/ok.svg" alt="" />
          </a>
          <a href="http://">
            <img src="/src/assets/img/vk.svg" alt="" />
          </a>
          <a href="http://">
            <img src="/src/assets/img/tg.svg" alt="" />
          </a>
        </div>
      </div>
      <p>© 2025 Матрёшка.</p>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background-color: #262626;
  color: white;
  padding: 2rem 0 1rem 0;
}
.footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer__top a {
  transition: all 0.3s;
}
.footer__top a:hover {
  text-decoration: underline;
}
.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 2.625rem;
  margin-bottom: 1.25rem;
}
.footer__bottom-left a {
  text-decoration: underline;
}
.footer__bottom-left p {
  width: 54.875rem;
}
.footer__bottom-right {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.footer__bottom-right img {
  position: relative;
  width: 5.313rem;
  height: 5.313rem;
  overflow: hidden;
  z-index: 1;
}
.footer__bottom-right a {
  position: relative;
}
.footer__bottom-right a::after {
  position: absolute;
  content: "";
  background-color: white;
  top: 0.5rem;
  left: 0.5rem;
  border-radius: 50%;
  overflow: hidden;
  width: 4.13rem;
  height: 4.13rem;
  z-index: 0;
}
</style>
