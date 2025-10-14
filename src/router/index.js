import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ScoreView from '@/views/ScoreView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { auth } from '@/Firebase/firebase.js'
import { useUser } from '@/Firebase/user'
import sgMail from '@sendgrid/mail'
import GlucoseTableView from '@/views/GlucoseTableView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView, meta: { requiresAuth: true } },
  { path: '/score', name: 'Score', component: ScoreView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/glucose', name: 'Glucose', component: GlucoseTableView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const { userAuthenticated } = useUser()
  if (to.meta?.requiresAuth && !userAuthenticated.value) {
    alert('please login first')
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
