import { ref } from 'vue'
import { EmailAndPassword, signOut, StateChanged } from 'firebase/auth'
import { auth } from '../../Firebase/firebase.js'

// 响应式状态
const userAuthenticated = ref(false)
const userState = ref(null)
