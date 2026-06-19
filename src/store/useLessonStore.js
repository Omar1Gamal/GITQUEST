/**
 * Lesson state store — manages curriculum progression, XP, and achievements.
 * State is namespaced per user UID so each user has isolated progress.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Default state for a fresh user
const defaultState = {
  currentModule: 'beginner',
  currentLessonIndex: 0,
  completedLessons: [],
  xp: 0,
  level: 1,
  achievements: [],
};

const useLessonStore = create(
  persist(
    (set, get) => ({
      // ─── Progress State ──────────────────────
      ...defaultState,

      // ─── User Binding ─────────────────────────
      _boundUid: null,  // tracks which user this state belongs to

      // ─── Computed ────────────────────────────
      getXpForNextLevel: () => {
        const { level } = get();
        return level * 200;
      },

      getXpProgress: () => {
        const { xp, level } = get();
        const xpForLevel = level * 200;
        const xpInCurrentLevel = xp % xpForLevel;
        return xpInCurrentLevel / xpForLevel;
      },

      // ─── Actions ─────────────────────────────
      setCurrentLesson: (module, index) => set({
        currentModule: module,
        currentLessonIndex: index,
      }),

      completeLesson: (lessonId, xpReward) => {
        const state = get();
        if (state.completedLessons.includes(lessonId)) return;

        const newXp = state.xp + xpReward;
        const xpForNextLevel = state.level * 200;
        const newLevel = newXp >= xpForNextLevel ? state.level + 1 : state.level;

        set({
          completedLessons: [...state.completedLessons, lessonId],
          xp: newXp,
          level: newLevel,
        });
      },

      unlockAchievement: (achievementId) => {
        const state = get();
        if (state.achievements.includes(achievementId)) return;
        set({ achievements: [...state.achievements, achievementId] });
      },

      isLessonCompleted: (lessonId) => {
        return get().completedLessons.includes(lessonId);
      },

      isModuleUnlocked: () => {
        // Unlock all modules by default so users can jump to their skill level
        return true;
      },

      resetProgress: () => set({ ...defaultState }),

      /**
       * Bind this store to a specific user.
       * Loads that user's saved progress from localStorage, or resets to defaults.
       */
      bindToUser: async (uid) => {
        if (!uid) return;

        const storageKey = `gitquest-lesson-${uid}`;

        // 1. Fast local load
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            set({
              ...defaultState,
              ...parsed.state,
              _boundUid: uid,
            });
          } catch {
            set({ ...defaultState, _boundUid: uid });
          }
        } else {
          set({ ...defaultState, _boundUid: uid });
        }

        // 2. Fetch from Firestore for cross-device sync
        try {
          const docRef = doc(db, 'users', uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cloudData = docSnap.data().lessonState;
            if (cloudData) {
              set({
                ...defaultState,
                ...cloudData,
                _boundUid: uid,
              });
            }
          }
        } catch (error) {
          console.error('Failed to sync from Firestore:', error);
        }
      },

      /**
       * Unbind from current user (on logout).
       * Saves current state first, then resets in-memory.
       */
      unbindUser: () => {
        const state = get();
        if (state._boundUid) {
          // Save before clearing
          const storageKey = `gitquest-lesson-${state._boundUid}`;
          const toSave = {
            state: {
              currentModule: state.currentModule,
              currentLessonIndex: state.currentLessonIndex,
              completedLessons: state.completedLessons,
              xp: state.xp,
              level: state.level,
              achievements: state.achievements,
            },
          };
          localStorage.setItem(storageKey, JSON.stringify(toSave));
        }
        set({ ...defaultState, _boundUid: null });
      },
    }),
    {
      name: 'gitquest-lesson-store',
      // Custom storage that routes to the user-specific key
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        },
        setItem: (name, value) => {
          // Save to the generic key for Zustand persist
          localStorage.setItem(name, JSON.stringify(value));

          // Also save to the user-specific key if bound
          const uid = value?.state?._boundUid;
          if (uid) {
            const userKey = `gitquest-lesson-${uid}`;
            const stateToSave = {
              currentModule: value.state.currentModule,
              currentLessonIndex: value.state.currentLessonIndex,
              completedLessons: value.state.completedLessons,
              xp: value.state.xp,
              level: value.state.level,
              achievements: value.state.achievements,
            };

            const toSave = { state: stateToSave };
            localStorage.setItem(userKey, JSON.stringify(toSave));

            // Sync to Firestore
            setDoc(doc(db, 'users', uid), { lessonState: stateToSave }, { merge: true })
              .catch(err => console.error('Firestore sync error:', err));
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useLessonStore;
