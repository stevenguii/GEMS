// Firebase SDK Integration for NBA Legends GOAT Edition
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";

// Web app's Firebase configuration
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
export const googleProvider = new GoogleAuthProvider();

// Authentication Helpers
export async function loginWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

export async function loginWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function logoutUser() {
  return await signOut(auth);
}

// Helper for saving player progress to Cloud Firestore
export async function savePlayerToCloud(uid, gameState, username = "Player") {
  if (!uid || !db) return false;
  try {
    const userRef = doc(db, "players", uid);
    await setDoc(userRef, {
      ...gameState,
      displayName: username,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // Live Leaderboard entry
    const leaderRef = doc(db, "leaderboard", uid);
    await setDoc(leaderRef, {
      uid: uid,
      username: username,
      highScore: gameState.stats?.highScore || 0,
      totalPoints: gameState.stats?.totalPoints || 0,
      wins: gameState.stats?.totalWins || 0,
      losses: gameState.stats?.totalLosses || 0,
      dunks: gameState.stats?.totalDunks || 0,
      cash: gameState.cash || 0,
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

// Leaderboard query helper
export async function fetchLeaderboardFromCloud(sortBy = "highScore", maxRecords = 50) {
  if (!db) return [];
  try {
    const q = query(collection(db, "leaderboard"), orderBy(sortBy, "desc"), limit(maxRecords));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.error("Firebase Leaderboard Load Error:", error);
    return [];
  }
}

