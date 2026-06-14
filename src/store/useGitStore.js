/**
 * Main Zustand store for GitQuest.
 * Manages the virtual Git repository, terminal history, and UI state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitEngine } from '../engine/GitEngine.js';

// Create a singleton engine
let engineInstance = new GitEngine();

const useGitStore = create(
  persist(
    (set, get) => ({
      // ─── Git State ───────────────────────────
      repositoryState: engineInstance.getState(),
      
      // ─── Terminal State ──────────────────────
      terminalHistory: [],
      
      // ─── UI State ────────────────────────────
      showLevelComplete: false,
      showConfetti: false,
      currentView: 'menu', // 'menu' | 'lesson'
      
      // ─── Actions ─────────────────────────────
      executeCommand: (rawInput) => {
        const state = get();
        engineInstance.loadState(state.repositoryState);
        const result = engineInstance.execute(rawInput);
        
        set({
          repositoryState: engineInstance.getState(),
          terminalHistory: [
            ...state.terminalHistory,
            { type: 'input', content: rawInput },
            { type: 'output', content: result.output, success: result.success },
          ],
        });
        
        return result;
      },

      resetRepository: (initialState = null) => {
        if (initialState) {
          engineInstance.loadState(initialState);
        } else {
          engineInstance.reset();
        }
        set({
          repositoryState: engineInstance.getState(),
          terminalHistory: [],
        });
      },

      initializeFromState: (state) => {
        engineInstance.loadState(state);
        set({ repositoryState: engineInstance.getState() });
      },

      clearTerminal: () => set({ terminalHistory: [] }),

      setView: (view) => set({ currentView: view }),

      triggerLevelComplete: () => set({ showLevelComplete: true, showConfetti: true }),
      
      dismissLevelComplete: () => set({ showLevelComplete: false, showConfetti: false }),

      getEngine: () => {
        const state = get();
        engineInstance.loadState(state.repositoryState);
        return engineInstance;
      },
    }),
    {
      name: 'gitquest-git-store',
      partialize: (state) => ({
        // Only persist essential state, not UI state
        repositoryState: state.repositoryState,
      }),
    }
  )
);

export default useGitStore;
