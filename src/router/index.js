import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import { useUser } from '@/Firebase/user'
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
  const { userAuthenticated } = useUser()

  if (to.meta?.requiresAuth && !userAuthenticated.value) {
    alert('please login first')
    return false
  }

  return true
})

export default router
