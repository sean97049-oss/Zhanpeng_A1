import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ScoreView from '@/views/ScoreView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AdminLoginView from '@/views/AdminLoginView.vue'
import { auth } from '@/Firebase/firebase.js'
import GlucoseTableView from '@/views/GlucoseTableView.vue'
import MapView from '@/views/MapView.vue'
import ManageAccount from '@/views/ManageAccount.vue'
import OpenAIView from '@/views/OpenAIView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About diabetes', component: AboutView, meta: { requiresAuth: true } },
  {
    path: '/score',
    name: 'Score',
    component: ScoreView,
    meta: { requiresAuth: true, hideForAdmin: true },
  },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/admin-login', name: 'Admin Login', component: AdminLoginView },
  {
    path: '/glucose',
    name: 'Glucose',
    component: GlucoseTableView,
    meta: { requiresAuth: true, hideForAdmin: true },
  },
  { path: '/map', name: 'Map', component: MapView },
  {
    path: '/manage-account',
    name: 'Manage Account',
    component: ManageAccount,
    meta: { requiresAuth: true, onlyAdmin: true },
  },
  { path: '/openai', name: 'AI Assistant', component: OpenAIView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta?.requiresAuth) {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe()

        if (!user) {
          alert('Please login first')
          resolve({ path: '/login', query: { redirect: to.fullPath } })
          return
        }

        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const { db } = await import('@/Firebase/firebase.js')

          const userRef = doc(db, 'users', user.uid)
          const userSnap = await getDoc(userRef)

          let userRole = 'As_patient'
          if (userSnap.exists()) {
            userRole = userSnap.data().role || 'As_patient'
          }

          const isAdmin = userRole === 'As_hcp'

          if (to.meta?.onlyAdmin && !isAdmin) {
            alert('Access denied. Admin privileges required.')
            resolve({ path: '/' })
            return
          }

          if (isAdmin && to.meta?.hideForAdmin) {
            resolve({ path: '/' })
            return
          }

          resolve(true)
        } catch (error) {
          console.error('Error checking user role:', error)
          resolve(true)
        }
      })
    })
  }

  return true
})

export default router
