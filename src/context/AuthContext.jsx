import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchador de estado de autenticación
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Al recargar la página, recuperamos el perfil de Firestore
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /**
   * Inicia sesión y retorna el perfil completo
   */
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    // Obtenemos el perfil inmediatamente para que el componente pueda redirigir
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const profileData = snap.exists() ? snap.data() : null;
    
    setProfile(profileData);
    return { user: cred.user, profile: profileData };
  };

  /**
   * Registra un usuario y crea su documento en Firestore
   */
  const register = async (email, password, displayName, role = "tourist") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    const newProfile = {
      uid: cred.user.uid,
      email,
      displayName,
      role,
      photoURL: "",
      createdAt: serverTimestamp(),
    };

    // Guardamos en Firestore
    await setDoc(doc(db, "users", cred.user.uid), newProfile);
    
    // Actualizamos el estado global
    setProfile(newProfile);
    
    return { user: cred.user, profile: newProfile };
  };

  /**
   * Cierra la sesión
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  /**
   * Recuperación de contraseña
   */
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  /**
   * Forzar recarga del perfil manual
   */
  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setProfile(snap.data());
      return snap.data();
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        profile, 
        loading, 
        login, 
        register, 
        logout, 
        resetPassword, 
        refreshProfile 
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}