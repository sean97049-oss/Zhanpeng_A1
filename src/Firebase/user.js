// src/Firebase/user.js
import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase.js'

const userAuthenticated = ref(false)
const userState = ref(null)

onAuthStateChanged(auth, (user) => {
  if (user) {
    userAuthenticated.value = true
    userState.value = user.email
  } else {
    userAuthenticated.value = false
    userState.value = null
  }
})

export function useUser() {
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true, message: 'login success' }
    } catch (error) {
      return { success: false, message: 'login failed' }
    }
  }

  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, message: 'register success' }
    } catch (error) {
      return { success: false, message: 'register failed' }
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

  return { userAuthenticated, userState, login, logout, register }
}
