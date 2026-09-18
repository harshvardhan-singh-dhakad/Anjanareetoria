"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';

export interface CustomerUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatar?: string | null;
  role?: string | null;
  provider?: string | null;
  hasPassword?: boolean;
}

interface AuthContextType {
  user: CustomerUser | null;
  firebaseUser: FirebaseUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUser: (user: CustomerUser | null) => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => Promise<CustomerUser>;
  loginWithEmail: (email: string, password: string) => Promise<CustomerUser>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<CustomerUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const syncFirebaseUserWithServer = useCallback(async (fbUser: FirebaseUser, overrideName?: string): Promise<CustomerUser | null> => {
    try {
      const res = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email,
          name: overrideName || fbUser.displayName || null,
          avatar: fbUser.photoURL || null,
          firebaseUid: fbUser.uid,
          provider: fbUser.providerData?.[0]?.providerId || 'firebase',
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('[AuthContext] syncFirebaseUserWithServer error:', err);
    }
    return null;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthContext] refreshUser error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        await syncFirebaseUserWithServer(fbUser);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUser, syncFirebaseUserWithServer]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Google Login
  const loginWithGoogle = async (): Promise<CustomerUser> => {
    const cred = await signInWithPopup(auth, googleProvider);
    const synced = await syncFirebaseUserWithServer(cred.user);
    if (!synced) {
      throw new Error('Could not synchronize session with server.');
    }
    return synced;
  };

  // Email/Password Login
  const loginWithEmail = async (email: string, password: string): Promise<CustomerUser> => {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const synced = await syncFirebaseUserWithServer(cred.user);
    if (!synced) {
      throw new Error('Could not synchronize session with server.');
    }
    return synced;
  };

  // Email/Password Register
  const registerWithEmail = async (email: string, password: string, name?: string): Promise<CustomerUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (name && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (err) {
        console.warn('[AuthContext] Failed to update profile displayName:', err);
      }
    }
    const synced = await syncFirebaseUserWithServer(cred.user, name);
    if (!synced) {
      throw new Error('Could not synchronize session with server.');
    }
    return synced;
  };

  // Forgot Password / Reset Email
  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setFirebaseUser(null);
      window.location.reload();
    } catch (err) {
      console.error('[AuthContext] logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoggedIn: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        setUser,
        refreshUser,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};