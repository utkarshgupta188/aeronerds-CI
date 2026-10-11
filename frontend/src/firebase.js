import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA8T7_g1Ieu5QmpD-GySBHRsXBnvOzQPD8",
  authDomain: "bhumi-sahayak.firebaseapp.com",
  projectId: "bhumi-sahayak",
  storageBucket: "bhumi-sahayak.firebasestorage.app",
  messagingSenderId: "906212739809",
  appId: "1:906212739809:web:930be2e8e813e86ec845a0",
  measurementId: "G-S9V27JQWN6"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
