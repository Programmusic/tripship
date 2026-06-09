import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { isDemoMode } from './api/client.js'
import { demoUser } from './demo/mockData.js'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

if (isDemoMode) {
  localStorage.setItem('tripship_token', 'demo-token')
  localStorage.setItem('tripship_user', JSON.stringify(demoUser))
}

app.mount('#app')
