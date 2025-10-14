import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDV5FvHOlfUzp2l1_A4dw1aogo4iSHlb3s',
  authDomain: 'week7-zhanpeng.firebaseapp.com',
  projectId: 'week7-zhanpeng',
  storageBucket: 'week7-zhanpeng.firebasestorage.app',
  messagingSenderId: '696843346909',
  appId: '1:696843346909:web:940cc312d691e243a8cc34',
  measurementId: 'G-K4P5Z7KSGG',
}

// 添加错误处理
try {
  const app = initializeApp(firebaseConfig)
  export const auth = getAuth(app)
  export const db = getFirestore(app)
  export default app
} catch (error) {
  console.error('Firebase initialization error:', error)
  // 提供备用配置或禁用 Firebase 功能
}
