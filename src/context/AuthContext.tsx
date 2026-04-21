import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  calorieGoal: number;
  height: number;
  weight: number;
  activityLevel: string;
  fitnessGoal?: 'lose' | 'gain' | 'maintain' | 'physique';
  memberSince?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Setup snapshot listener for real-time profile updates
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Initialize user profile if it doesn't exist
            const initialProfile = {
              uid: user.uid,
              name: user.displayName || 'Guest',
              email: user.email || '',
              photoURL: user.photoURL || '',
              calorieGoal: 2000,
              height: 170,
              weight: 70,
              activityLevel: 'moderate',
              fitnessGoal: 'maintain',
              memberSince: new Date().toISOString(),
            };
            setDoc(userDocRef, initialProfile);
            setProfile(initialProfile as UserProfile);
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
