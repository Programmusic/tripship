import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/ship', name: 'ship', component: () => import('@/views/ShipExploreView.vue'), meta: { immersive: true } },
  { path: '/memories', name: 'memories', component: () => import('@/views/MemoriesView.vue') },
  { path: '/mixes', name: 'mixes', component: () => import('@/views/MixesView.vue') },
  { path: '/aaaarrifacts', name: 'aaaarrifacts', component: () => import('@/views/AaaarrifactsView.vue') },
  { path: '/captains-cabin', name: 'captains-cabin', component: () => import('@/views/CaptainsCabinView.vue') },
  { path: '/captains-cabin/:slug', name: 'captains-cabin-post', component: () => import('@/views/CaptainsCabinView.vue') },
  { path: '/the-list', name: 'invites', component: () => import('@/views/InvitesView.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
