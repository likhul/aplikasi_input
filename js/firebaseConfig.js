// /js/firebaseConfig.js

// Import library Firebase versi 9 modular dari CDN (wajib untuk file .js modul)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  // Kredensial yang SUDAH Anda masukkan:
  apiKey: "AIzaSyDM_9G09-2UkZnayStk62ILtvlLD2kdHBc",
  authDomain: "aplikasi-input-nilai-mah-17427.firebaseapp.com",
  projectId: "aplikasi-input-nilai-mah-17427",
  storageBucket: "aplikasi-input-nilai-mah-17427.firebasestorage.app",
  messagingSenderId: "465203677701",
  appId: "1:465203677701:web:661643994091af3551ea6c"
};

// Initialize Firebase (Inisialisasi Firebase - HANYA SEKALI)
const app = initializeApp(firebaseConfig);

// Ekspor instance Firestore untuk digunakan di dataService.js
export const db = getFirestore(app);