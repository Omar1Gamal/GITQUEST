/**
 * Main Zustand store for GitQuest.
 * Manages the virtual Git repository, terminal history, and UI state.
 * State is namespaced per user UID for isolation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitEngine } from '../engine/GitEngine.js';

// Create a singleton engine
let engineInstance = new GitEngine();

const defaultGitState = {
  repositoryState: engineInstance.getState(),
};

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
      currentView: 'menu',

      // ─── User Binding ─────────────────────────
      _boundUid: null,
      
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

      /**
       * Bind store to a specific user UID.
       */
      bindToUser: (uid) => {
        if (!uid) return;
        
        const storageKey = `gitquest-git-${uid}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.state?.repositoryState) {
              engineInstance.loadState(parsed.state.repositoryState);
              set({
                repositoryState: parsed.state.repositoryState,
                _boundUid: uid,
                terminalHistory: [],
              });
            } else {
              engineInstance.reset();
              set({ ...defaultGitState, _boundUid: uid, terminalHistory: [] });
            }
          } catch {
            engineInstance.reset();
            set({ ...defaultGitState, _boundUid: uid, terminalHistory: [] });
          }
        } else {
          engineInstance.reset();
          set({ ...defaultGitState, _boundUid: uid, terminalHistory: [] });
        }
      },

      /**
       * Unbind from current user (on logout).
       */
      unbindUser: () => {
        const state = get();
        if (state._boundUid) {
          const storageKey = `gitquest-git-${state._boundUid}`;
          const toSave = {
            state: {
              repositoryState: state.repositoryState,
            },
          };
          localStorage.setItem(storageKey, JSON.stringify(toSave));
        }
        engineInstance.reset();
        set({ ...defaultGitState, _boundUid: null, terminalHistory: [] });
      },
    }),
    {
      name: 'gitquest-git-store',
      partialize: (state) => ({
        repositoryState: state.repositoryState,
        _boundUid: state._boundUid,
      }),
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
          const uid = value?.state?._boundUid;
          if (uid) {
            const userKey = `gitquest-git-${uid}`;
            const toSave = {
              state: {
                repositoryState: value.state.repositoryState,
              },
            };
            localStorage.setItem(userKey, JSON.stringify(toSave));
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useGitStore;
