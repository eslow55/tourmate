import { auth, db } from "../firebase/config"; // Ajusta la ruta según tu config
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const authService = {
  /**
   * Registra un nuevo usuario y guarda su perfil en Firestore
   */
  register: async (email, password, displayName, role) => {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar el perfil básico de Auth
      await updateProfile(user, { displayName });

      // 3. Guardar datos extendidos en Firestore (Colección 'users')
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        role, // 'tourist' o 'guide'
        createdAt: new Date().toISOString(),
        photoURL: null
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene la información extendida del usuario desde Firestore
   */
  getUserProfile: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
};