// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

// Firebase 설정 (Firebase 콘솔에서 제공되는 설정 정보 사용)
const firebaseConfig = {
    apiKey: "AIzaSyChMxGdodYE5AIx1jQ8cB1kcsbbdDWp2Y4",
    authDomain: "uml-constructor.firebaseapp.com",
    projectId: "uml-constructor",
    storageBucket: "uml-constructor.firebasestorage.app",
    messagingSenderId: "224568927059",
    appId: "1:224568927059:web:d3cfd8d756b7cc3d3d77a6",
    measurementId: "G-DB715YLYVX"
};


// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firestore 인스턴스 가져오기
const db = getFirestore(app);
const auth = getAuth(app);

export { db , auth };
