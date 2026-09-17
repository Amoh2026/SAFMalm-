'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  approved: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let role = 'MEMBER';
        let isAdminUser = false;
        let approved = false;
        let displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '';

        // 1. Check admins/{uid} (matches Firestore rules)
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            role = 'ADMIN';
            isAdminUser = true;
            approved = true;
          }
        } catch (error) {
          console.log('Admin check failed:', error);
        }

        // 2. Check users/{uid} for member role + approved status
        if (!isAdminUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              role = data.role || 'MEMBER';
              approved = data.approved === true;
              if (data.name) displayName = data.name;
            } else {
              // SECURITY: no user doc → not approved
              approved = false;
            }
          } catch (error) {
            console.log('User doc check failed:', error);
            // SECURITY: on error → not approved
            approved = false;
          }
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: displayName,
          role: role,
          approved: approved,
        });
        setIsAdmin(isAdminUser);
        setIsApproved(approved);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsApproved(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      if (error.code === 'auth/user-not-found') errorMessage = 'User not found. Please register first.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Invalid password.';
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      if (error.code === 'auth/too-many-requests') errorMessage = 'Too many attempts. Please try again later.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: name,
          email: email,
          role: 'MEMBER',
          approved: true,                             // ONE-APPROVAL: admin already approved the application
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: 'admin-via-application',
          rejected: false,
        });
      } catch (docError) {
        console.warn('Could not create users doc:', docError);
      }

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Email already in use';
      if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak';
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      if (error.code === 'auth/operation-not-allowed') errorMessage = 'Registration is not enabled';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isApproved, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}