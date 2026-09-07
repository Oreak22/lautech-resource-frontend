import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id(_id: any): unknown;
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // Saves to localStorage automatically
    }
  )
);