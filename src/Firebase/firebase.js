import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAclhKgLAX-AugbWvX1fXJ3XbYmq1FhSJs',
  authDomain: 'a1-cc8b7.firebaseapp.com',
  projectId: 'a1-cc8b7',
  storageBucket: 'a1-cc8b7.firebasestorage.app',
  messagingSenderId: '845469988035',
  appId: '1:845469988035:web:0e6f2de92f3ac5cbf81e76',
  measurementId: 'G-V4QLEL311N',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
