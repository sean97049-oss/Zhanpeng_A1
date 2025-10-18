import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from './firebase.js'

const userAuthenticated = ref(false)
const errorMsg = ref('')
const userState = ref(null)
const isAdmin = ref(false)
const LOCAL_ROLES_KEY = 'userEmailToRole'
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

function readLocalRoles() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ROLES_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeLocalRoles(map) {
  localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(map))
}

export async function setUserRoleOnRegister(email, role) {
  const map = readLocalRoles()
  map[email] = role
  writeLocalRoles(map)

  try {
    const db = getFirestore()
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await setDoc(
        userRef,
        {
          email: email,
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }
  } catch (error) {
    console.error('Error saving role to Firestore:', error)
  }
}

function checkIsAdminByEmail(email) {
  const map = readLocalRoles()
  return map[email] === 'As_hcp'
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userAuthenticated.value = false
    userState.value = null
    isAdmin.value = false
    return
  }

  userAuthenticated.value = true
  userState.value = user.email || null

  try {
    const db = getFirestore()
    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      const map = readLocalRoles()
      const role = map[user.email] || 'As_patient'

      await setDoc(
        userRef,
        {
          email: user.email || '',
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      isAdmin.value = role === 'As_hcp'
    } else {
      const role = snap.data().role || 'As_patient'
      isAdmin.value = role === 'As_hcp'
    }
  } catch (error) {
    console.error('Error checking user role:', error)
    isAdmin.value = false
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

  return { userAuthenticated, userState, errorMsg, isAdmin, login, logout, register }
}
