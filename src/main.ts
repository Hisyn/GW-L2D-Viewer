import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/characterStore'
import { applyUrlParams } from '@/utils/urlSync'
import App from './App.vue'
import { primeLive2D } from '@/utils/live2dPrime'

const pinia = createPinia()
const store = useCharacterStore(pinia)
applyUrlParams(store, window.location.search)

const app = createApp(App)
app.use(pinia)
// Prefetch Live2D runtime and module to reduce latency when opening the viewer
void primeLive2D()
app.mount('#app')
