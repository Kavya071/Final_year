import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Check if user exists in Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create or update user profile with role
export const saveUserRole = async (user, selectedRole) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existingUser = await getUserProfile(user.uid);
    
    if (existingUser) {
      // User exists, add the new role to existing roles
      const updatedRoles = {
        ...existingUser.roles,
        [selectedRole]: true
      };
      
      await updateDoc(userDocRef, {
        roles: updatedRoles,
        lastLoginAt: new Date(),
        lastSelectedRole: selectedRole
      });
      
      return { ...existingUser, roles: updatedRoles };
    } else {
      // New user, create profile
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        roles: {
          [selectedRole]: true
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
        lastSelectedRole: selectedRole
      };
      
      await setDoc(userDocRef, newUserData);
      return newUserData;
    }
  } catch (error) {
    console.error('Error saving user role:', error);
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile ? userProfile.roles : {};
  } catch (error) {
    console.error('Error getting user roles:', error);
    return {};
  }
};