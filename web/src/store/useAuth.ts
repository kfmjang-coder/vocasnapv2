import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  setUser: (u: AuthUser | null) => void;
  setReady: (b: boolean) => void;
  signUp: (name: string, email: string, pw: string) => Promise<void>;
  signIn: (email: string, pw: string) => Promise<void>;
  google: () => Promise<void>;
  logout: () => Promise<void>;
}

function ensure() {
  if (!auth) throw new Error('Firebase가 설정되지 않았어요');
  return auth;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),

  signUp: async (name, email, pw) => {
    const cred = await createUserWithEmailAndPassword(ensure(), email, pw);
    if (name) await updateProfile(cred.user, { displayName: name });
  },
  signIn: async (email, pw) => {
    await signInWithEmailAndPassword(ensure(), email, pw);
  },
  google: async () => {
    if (!googleProvider) throw new Error('Firebase가 설정되지 않았어요');
    await signInWithPopup(ensure(), googleProvider);
  },
  logout: async () => {
    if (auth) await signOut(auth);
  },
}));
