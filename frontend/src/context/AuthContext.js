import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth, 
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  async function signup(email, password, firstName, lastName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with first name and last name
      await firebaseUpdateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Send verification email
      await sendEmailVerification(user);

      return userCredential; // Return the full userCredential object
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many sign-up attempts. Please try again later or contact support if this persists.');
      }
      throw error; // Re-throw the original error for more specific handling in the component
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in.');
      }
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  async function resendVerificationEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await signOut(auth);
        return "Verification email resent. Please check your inbox.";
      } else {
        return "Your email is already verified. You can log in.";
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else {
        throw error;
      }
    }
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateEmail(email) {
    return updateFirebaseEmail(currentUser, email);
  }

  function updatePassword(password) {
    return updateFirebasePassword(currentUser, password);
  }

  function updateProfile(profileData) {
    return firebaseUpdateProfile(auth.currentUser, profileData)
      .then(() => {
        setCurrentUser(prevUser => ({ ...prevUser, ...profileData }));
      });
  }

  async function changePassword(oldPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Change the password
      await updateFirebasePassword(user, newPassword);
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  async function getIdToken() {
    if (currentUser) {
      try {
        return await currentUser.getIdToken(true);
      } catch (error) {
        console.error("Error getting ID token:", error);
        throw new Error(`Failed to get ID token: ${error.message}`);
      }
    }
    throw new Error('No user logged in');
  }

  async function checkUserExists(email) {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    loginWithGoogle,
    getIdToken,
    checkUserExists,
    updateProfile,
    changePassword,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
