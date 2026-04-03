// ============================================================
// FIREBASE / LOCAL STORAGE ADAPTER — arunav2
// Fallback ke localStorage jika Firebase tidak dikonfigurasi
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";

// ---- Cek apakah Firebase dikonfigurasi ----
const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your_api_key_here" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "your_project_id_here"
  );
};

// ---- Firebase lazy initialization ----
let _db: import("firebase/firestore").Firestore | null = null;

async function getFirestore() {
  if (!isFirebaseConfigured()) return null;
  if (_db) return _db;

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore: _getFirestore } = await import("firebase/firestore");

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app =
      getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
    _db = _getFirestore(app);
    return _db;
  } catch (e) {
    console.warn("Firebase initialization failed, using localStorage:", e);
    return null;
  }
}

// ============================================================
// COMPLETION LOG CRUD
// ============================================================

export async function getCompletionLog(
  dateKey: string
): Promise<CompletionLog | null> {
  const db = await getFirestore();

  if (db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const ref = doc(db, "completion_logs", dateKey);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as CompletionLog) : null;
    } catch (e) {
      console.warn("Firestore read failed:", e);
    }
  }

  // Fallback: localStorage
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`log_${dateKey}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveCompletionLog(
  dateKey: string,
  log: CompletionLog
): Promise<void> {
  const db = await getFirestore();

  if (db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "completion_logs", dateKey), log);
      return;
    } catch (e) {
      console.warn("Firestore write failed:", e);
    }
  }

  // Fallback: localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(`log_${dateKey}`, JSON.stringify(log));
  }
}

// ============================================================
// USER PREFERENCES CRUD
// ============================================================

const DEFAULT_PREFS: UserPreferences = {
  userId: "default",
  name: "Aruna",
  startDate: new Date().toISOString().split("T")[0],
  cycleDay: 1,
  isOutdoor: false,
  notificationsEnabled: false,
};

export async function getUserPreferences(): Promise<UserPreferences> {
  const db = await getFirestore();

  if (db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "user_preferences", "default"));
      if (snap.exists()) return snap.data() as UserPreferences;
    } catch (e) {
      console.warn("Firestore read prefs failed:", e);
    }
  }

  if (typeof window === "undefined") return DEFAULT_PREFS;
  const raw = localStorage.getItem("user_prefs");
  return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
}

export async function saveUserPreferences(
  prefs: Partial<UserPreferences>
): Promise<void> {
  const db = await getFirestore();
  const current = await getUserPreferences();
  const merged = { ...current, ...prefs };

  if (db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "user_preferences", "default"), merged);
      return;
    } catch (e) {
      console.warn("Firestore write prefs failed:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("user_prefs", JSON.stringify(merged));
  }
}

// ============================================================
// STREAK CALCULATION
// ============================================================

export async function getStreak(today: string): Promise<number> {
  if (typeof window === "undefined") return 0;

  let streak = 0;
  const d = new Date(today);

  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().split("T")[0];
    const log = await getCompletionLog(key);
    if (log && log.completedTaskIds.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

// ============================================================
// STORAGE MODE INFO
// ============================================================

export function getStorageMode(): "firebase" | "local" {
  return isFirebaseConfigured() ? "firebase" : "local";
}
