import { db } from "../firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export const userService = {
  /**
   * Actualiza datos específicos del perfil (ej. biografía, teléfono)
   */
  updateProfile: async (uid, data) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }
};