import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import { useAuth } from '@/components/composables/auth'
import ScoreView from '../views/ScoreView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: {
      requiresAuth: true,
      roles: ['As_patient', 'As_hcp'],
    },
  },
  {
    path: '/scoreSystem',
    name: 'Score',
    component: ScoreView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const { isAuthenticated, userRole } = useAuth()
  if (to.meta?.requiresAuth && !isAuthenticated.value) {
    alert('please login first')
    return '/'
  }
  if (to.meta?.roles && !to.meta.roles.includes(userRole.value)) {
    alert('wrong account please try again')
    return '/'
  }

  return true
})

export default router
