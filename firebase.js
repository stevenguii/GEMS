// Firebase SDK Integration for NBA Legends GOAT Edition
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyB--iECEd0qz8wrIg_VtCLAGCd81R7Vhx4",
  authDomain: "nba-legends-goat-edition.firebaseapp.com",
  projectId: "nba-legends-goat-edition",
  storageBucket: "nba-legends-goat-edition.firebasestorage.app",
  messagingSenderId: "118161744370",
  appId: "1:118161744370:web:1652a284bbc86db1f2cb6b"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper for saving player progress to Cloud Firestore
export async function savePlayerToCloud(uid, gameState) {
  if (!uid || !db) return false;
  try {
    const userRef = doc(db, "players", uid);
    await setDoc(userRef, {
      ...gameState,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Firebase Cloud Save Error:", error);
    return false;
  }
}

// Helper for loading player progress from Cloud Firestore
export async function loadPlayerFromCloud(uid) {
  if (!uid || !db) return null;
  try {
    const userRef = doc(db, "players", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Firebase Cloud Load Error:", error);
    return null;
  }
}
