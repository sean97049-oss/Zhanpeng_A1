import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth } from './firebase.js'

const userAuthenticated = ref(false)
const errorMsg = ref('')
const userState = ref(null)
setPersistence(auth, browserLocalPersistence).catch(() => {})

function mapError(err) {
  const code = err?.code || ''
  if (code.includes('user-not-found')) return 'email not exist'
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'email or password is incorrect'
  if (code.includes('invalid-email')) return 'invalid email'
  if (code.includes('email-already-in-use')) return 'email already in use'
  if (code.includes('weak-password')) return 'password must be at least 6 characters long'
  return 'error'
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    userAuthenticated.value = true
    userState.value = user.email || null
  } else {
    userAuthenticated.value = false
    userState.value = null
  }
})

export function useUser() {
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      errorMsg.value = ''
      return { success: true, message: 'login success' }
    } catch (error) {
      const msg = mapError(error)
      errorMsg.value = msg
      return { success: false, message: msg }
    }
  }

  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      errorMsg.value = ''
      return { success: true, message: 'register success' }
    } catch (error) {
      const msg = mapError(error)
      errorMsg.value = msg
      return { success: false, message: msg }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      return { success: true, message: 'logout success' }
    } catch (error) {
      return { success: false, message: 'logout failed' }
    }
  }

  return { userAuthenticated, userState, errorMsg, login, logout, register }
}
