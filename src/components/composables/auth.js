import { ref } from 'vue'

const isAuthenticated = ref(false)
const userRole = ref(null)
const currentUser = ref(null)

const USERS = [
  { username: 'patient@gmail.com', password: '123456ABCa.', role: 'As_patient' },
  { username: 'hcp@gmail.com', password: '123456ABCa.', role: 'As_hcp' },
]

export function useAuth() {
  const login = (username, password) => {
    const u = USERS.find((x) => x.username === username && x.password === password)
    if (u) {
      isAuthenticated.value = true
      userRole.value = u.role
      currentUser.value = u.username
      return { ok: true }
    }
    isAuthenticated.value = false
    userRole.value = null
    currentUser.value = null
    return { ok: false, msg: 'Invalid credentials' }
  }
  const logout = () => {
    isAuthenticated.value = false
    userRole.value = null
    currentUser.value = null
  }
  return { isAuthenticated, userRole, currentUser, login, logout }
}
