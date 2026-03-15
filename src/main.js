import { createApp } from 'vue'
import './style.css'
import { createYmaps } from 'vue-yandex-maps';
// import './assets/arial/arial.css'
import App from './App.vue'
import {router} from './router'
import { createPinia } from "pinia"
import VueTheMask from 'vue-the-mask'

const app = createApp(App)
const pinia = createPinia()
app.use(createYmaps({
  apikey: 'ab3a562f-41f9-4eb0-94ab-b982e13c7742',
}));
app.use(pinia)
app.use(router)
app.use(VueTheMask);

app.mount("#app")
