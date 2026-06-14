/**
 * Lesson state store — manages curriculum progression, XP, and achievements.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLessonStore = create(
  persist(
    (set, get) => ({
      // ─── Progress State ──────────────────────
      currentModule: 'beginner',       // 'beginner' | 'intermediate' | 'advanced'
      currentLessonIndex: 0,
      completedLessons: [],            // array of lesson IDs
      
      // ─── Gamification ────────────────────────
      xp: 0,
      level: 1,
      achievements: [],

      // ─── Computed ────────────────────────────
      getXpForNextLevel: () => {
        const { level } = get();
        return level * 200; // 200, 400, 600, etc.
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

      isModuleUnlocked: (module) => {
        // Unlock all modules by default so users can jump to their skill level
        return true;
      },

      resetProgress: () => set({
        currentModule: 'beginner',
        currentLessonIndex: 0,
        completedLessons: [],
        xp: 0,
        level: 1,
        achievements: [],
      }),
    }),
    {
      name: 'gitquest-lesson-store',
    }
  )
);

export default useLessonStore;
