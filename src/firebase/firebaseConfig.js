import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Lógica para evitar el error de "duplicate-app"
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;

// --- USUARIOS & PERFILES ---
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUsersByRole = async (role) => {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// --- TOURS ---
export const getAllTours = async () => {
  const q = query(collection(db, "tours"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getToursByGuide = async (guideId) => {
  const q = query(collection(db, "tours"), where("guideId", "==", guideId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createTour = async (tourData) => {
  return await addDoc(collection(db, "tours"), {
    ...tourData,
    active: true,
    currentEnrollments: 0,
    createdAt: serverTimestamp(),
  });
};

export const updateTour = async (tourId, data) => {
  await updateDoc(doc(db, "tours", tourId), data);
};

export const deleteTour = async (tourId) => {
  await updateDoc(doc(db, "tours", tourId), { active: false });
};

export const adminDeleteTour = async (tourId) => {
  await deleteDoc(doc(db, "tours", tourId));
};

// --- RESERVAS (BOOKINGS) ---
export const createBooking = async (bookingData) => {
  const ref = await addDoc(collection(db, "bookings"), {
    ...bookingData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  
  const tourRef = doc(db, "tours", bookingData.tourId);
  const tourSnap = await getDoc(tourRef);
  if (tourSnap.exists()) {
    await updateDoc(tourRef, {
      currentEnrollments: (tourSnap.data().currentEnrollments || 0) + (bookingData.people || 0),
    });
  }
  return ref;
};

export const getBookingsByTourist = async (touristId) => {
  const q = query(
    collection(db, "bookings"),
    where("touristId", "==", touristId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBookingsByGuide = async (guideId) => {
  const q = query(collection(db, "bookings"), where("guideId", "==", guideId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateBookingStatus = async (bookingId, status) => {
  await updateDoc(doc(db, "bookings", bookingId), { status });
};

// --- REVIEWS ---
export const createReview = async (reviewData) => {
  return await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
};

export const getReviewsByTour = async (tourId) => {
  const q = query(collection(db, "reviews"), where("tourId", "==", tourId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// --- CHAT ---
export const getChatId = (uid1, uid2) => [uid1, uid2].sort().join("_");

export const sendMessage = async (chatId, messageData) => {
  await addDoc(collection(db, "messages", chatId, "messages"), {
    ...messageData,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToChat = (chatId, callback) => {
  const q = query(
    collection(db, "messages", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
};

// --- PANEL DE ADMINISTRACIÓN ---
export const approveGuide = async (uid) => {
  await updateDoc(doc(db, "users", uid), { status: "active" });
};

export const rejectGuide = async (uid) => {
  await updateDoc(doc(db, "users", uid), { status: "rejected" });
};

export const approveTourist = async (uid) => {
  await updateDoc(doc(db, "users", uid), { status: "active" });
};

export const suspendTourist = async (uid) => {
  await updateDoc(doc(db, "users", uid), { status: "suspended" });
};

export const deleteUser = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
};

export const getStats = async () => {
  const [users, tours, bookings, reviews] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(query(collection(db, "tours"), where("active", "==", true))),
    getDocs(collection(db, "bookings")),
    getDocs(collection(db, "reviews")),
  ]);

  const allBookings = bookings.docs.map((d) => d.data());
  const totalRevenue = allBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  return {
    totalUsers: users.size,
    totalTours: tours.size,
    totalBookings: bookings.size,
    totalReviews: reviews.size,
    totalRevenue,
  };
};