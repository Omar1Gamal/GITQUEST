/**
 * Auth store — manages user authentication state.
 * Uses localStorage for 100% client-side, zero-cost persistence.
 * Passwords are hashed with a simple SHA-256 for local security.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple hash function for password storage (client-side only)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────
      currentUser: null,          // { name, email, createdAt }
      registeredUsers: [],        // [{ name, email, passwordHash, createdAt }]
      isAuthenticated: false,

      // ─── Actions ─────────────────────────────
      register: async (name, email, password) => {
        const { registeredUsers } = get();

        // Check if email already exists
        if (registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        // Validate
        if (!name || name.trim().length < 2) {
          return { success: false, error: 'Please enter your full name (at least 2 characters).' };
        }
        if (!email || !email.includes('@')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (!password || password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const passwordHash = await hashPassword(password);
        const user = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          createdAt: new Date().toISOString(),
        };

        set({
          registeredUsers: [...registeredUsers, user],
          currentUser: { name: user.name, email: user.email, createdAt: user.createdAt },
          isAuthenticated: true,
        });

        return { success: true };
      },

      login: async (email, password) => {
        const { registeredUsers } = get();
        const passwordHash = await hashPassword(password);

        const user = registeredUsers.find(
          u => u.email === email.trim().toLowerCase() && u.passwordHash === passwordHash
        );

        if (!user) {
          return { success: false, error: 'Invalid email or password.' };
        }

        set({
          currentUser: { name: user.name, email: user.email, createdAt: user.createdAt },
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      updateName: (newName) => {
        const { currentUser, registeredUsers } = get();
        if (!currentUser) return;

        const updatedUsers = registeredUsers.map(u =>
          u.email === currentUser.email ? { ...u, name: newName.trim() } : u
        );

        set({
          currentUser: { ...currentUser, name: newName.trim() },
          registeredUsers: updatedUsers,
        });
      },
    }),
    {
      name: 'gitquest-auth-store',
    }
  )
);

export default useAuthStore;
