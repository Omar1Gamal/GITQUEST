/**
 * App.jsx — Main GitQuest application layout.
 * Routes between Auth → ModuleSelector → LessonView → Certificate.
 */

import { useState, useRef, useEffect } from 'react';
import useGitStore from './store/useGitStore.js';
import useLessonStore from './store/useLessonStore.js';
import useAuthStore from './store/useAuthStore.js';
import Auth from './components/Auth/Auth.jsx';
import ModuleSelector from './components/ModuleSelector/ModuleSelector.jsx';
import LessonPanel from './components/LessonPanel/LessonPanel.jsx';
import Sandbox from './components/Sandbox/Sandbox.jsx';
import Terminal from './components/Terminal/Terminal.jsx';
import GitGraph from './components/GitGraph/GitGraph.jsx';
import DiffViewer from './components/DiffViewer/DiffViewer.jsx';
import ProgressBar from './components/ProgressBar/ProgressBar.jsx';
import LevelComplete from './components/LevelComplete/LevelComplete.jsx';
import Certificate from './components/Certificate/Certificate.jsx';
import Footer from './components/Footer/Footer.jsx';
import { ACHIEVEMENTS, getNextLesson } from './lessons/lessonData.js';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'lesson' | 'certificate'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [earnedAchievement, setEarnedAchievement] = useState(null);
  const [suggestedCommand, setSuggestedCommand] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCommitDiff, setSelectedCommitDiff] = useState(null);
  const lessonValidatedRef = useRef(false);

  const { repositoryState, executeCommand, resetRepository, bindToUser: bindGitToUser, unbindUser: unbindGitUser } = useGitStore();
  const { completeLesson, unlockAchievement, bindToUser: bindLessonToUser, unbindUser: unbindLessonUser } = useLessonStore();
  const { isAuthenticated, currentUser, logout, isLoading, initAuthListener } = useAuthStore();

  // ─── Firebase Auth Listener ─────────────────────────
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // ─── Bind/Unbind stores when user changes ───────────
  useEffect(() => {
    if (currentUser?.uid) {
      bindLessonToUser(currentUser.uid);
      bindGitToUser(currentUser.uid);
    }
  }, [currentUser?.uid, bindLessonToUser, bindGitToUser]);

  // Get current branch from repository state
  const currentBranch = repositoryState.detachedHead
    ? repositoryState.head?.substring(0, 7)
    : repositoryState.head || 'main';

  // ─── Auth Gate ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700 }}>GitQuest</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  // Start a lesson
  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentView('lesson');
    setCurrentStep(0);
    setCompletedSteps(0);
    setShowLevelComplete(false);
    setSuggestedCommand(null);
    lessonValidatedRef.current = false;

    // Reset repository to lesson's initial state
    if (lesson.initialState) {
      resetRepository(lesson.initialState);
    } else {
      resetRepository();
    }

    // Set the first suggested command
    if (lesson.instructions[0]?.command) {
      setSuggestedCommand(lesson.instructions[0].command);
    }
  };

  // Start sandbox
  const handleSelectSandbox = () => {
    setCurrentView('sandbox');
    setCurrentLesson(null);
    setCurrentStep(0);
    setCompletedSteps(0);
    setShowLevelComplete(false);
    setSuggestedCommand(null);
    lessonValidatedRef.current = false;
    resetRepository(); // Empty repo
  };

  // Handle command execution
  const handleCommand = (rawInput) => {
    const result = executeCommand(rawInput);

    // After command, check lesson progress
    if (currentLesson && !lessonValidatedRef.current) {
      // Advance the step counter
      const nextStep = Math.min(currentStep + 1, currentLesson.instructions.length - 1);
      setCurrentStep(nextStep);

      // Update suggested command
      if (nextStep < currentLesson.instructions.length && currentLesson.instructions[nextStep]?.command) {
        setSuggestedCommand(currentLesson.instructions[nextStep].command);
      } else {
        setSuggestedCommand(null);
      }

      // Update completed objectives based on step progress
      const objectiveProgress = Math.min(
        Math.floor((nextStep / currentLesson.instructions.length) * currentLesson.objectives.length),
        currentLesson.objectives.length
      );
      setCompletedSteps(Math.max(completedSteps, objectiveProgress));

      // Get the fresh state after command
      const freshState = useGitStore.getState().repositoryState;

      // Validate lesson completion
      if (currentLesson.validator && currentLesson.validator(freshState)) {
        lessonValidatedRef.current = true;
        setCompletedSteps(currentLesson.objectives.length);

        // Delay the modal to let the user see the result
        setTimeout(() => {
          completeLesson(currentLesson.id, currentLesson.xpReward);

          // Check for achievements
          if (currentLesson.achievement) {
            const achDef = ACHIEVEMENTS.find(a => a.id === currentLesson.achievement);
            if (achDef) {
              unlockAchievement(currentLesson.achievement);
              setEarnedAchievement(achDef.title);
            }
          }

          setShowLevelComplete(true);
        }, 800);
      }
    }

    return result;
  };

  // Navigate back to menu
  const handleBackToMenu = () => {
    setCurrentView('menu');
    setCurrentLesson(null);
    setShowLevelComplete(false);
    setEarnedAchievement(null);
    setSelectedCommitDiff(null);
  };

  // Go to next lesson
  const handleNextLesson = () => {
    if (!currentLesson) return;
    const next = getNextLesson(currentLesson.id);
    if (next) {
      setShowLevelComplete(false);
      setEarnedAchievement(null);
      handleSelectLesson(next);
    } else {
      handleBackToMenu();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    // Save & unbind user-specific stores before signing out
    unbindLessonUser();
    unbindGitUser();
    await logout();
    setShowUserMenu(false);
    setCurrentView('menu');
    setCurrentLesson(null);
    setSelectedCommitDiff(null);
  };

  // Node click for Diff Viewer
  const handleNodeClick = (hash) => {
    const commits = repositoryState.commits || [];
    const commit = commits.find(c => c.hash === hash);
    if (commit) {
      const parentHash = commit.parentHash?.[0];
      const parentCommit = parentHash ? commits.find(c => c.hash === parentHash) : null;
      setSelectedCommitDiff({ commit, parentCommit });
    }
  };

  // Get user initials for avatar
  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="app-topbar">
        <div className="app-topbar-left">
          <div className="app-logo" onClick={handleBackToMenu}>
            <span className="text-gradient">GitQuest</span>
          </div>
          {currentView === 'lesson' && currentLesson && (
            <span className="app-topbar-lesson-title">
              {currentLesson.title}
            </span>
          )}
          {currentView === 'certificate' && (
            <span className="app-topbar-lesson-title">Certificate</span>
          )}
        </div>
        <div className="app-topbar-right">
          <ProgressBar />

          {/* Certificate button */}
          <button
            className="btn btn-ghost topbar-cert-btn"
            onClick={() => setCurrentView('certificate')}
            title="View Certificate"
          >
            📜
          </button>

          {/* User avatar & menu */}
          <div className="user-menu-container">
            <button
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={currentUser?.name}
            >
              {userInitials}
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{currentUser?.name}</div>
                  <div className="user-dropdown-email">{currentUser?.email}</div>
                </div>
                <div className="user-dropdown-divider" />
                <button
                  className="user-dropdown-item"
                  onClick={() => { setCurrentView('certificate'); setShowUserMenu(false); }}
                >
                  📜 My Certificate
                </button>
                <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Click-away for user menu */}
      {showUserMenu && (
        <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
      )}

      {/* Main Content */}
      {currentView === 'menu' && (
        <>
          <ModuleSelector onSelectLesson={handleSelectLesson} onSelectSandbox={handleSelectSandbox} />
          <Footer />
        </>
      )}

      {currentView === 'certificate' && (
        <>
          <Certificate onBack={handleBackToMenu} />
          <Footer />
        </>
      )}

      {currentView === 'lesson' && (
        <div className="lesson-view">
          {/* Left Panel: Instructions + Terminal */}
          <div className="lesson-left-panel">
            <div className="lesson-left-top">
              <LessonPanel
                lesson={currentLesson}
                completedSteps={completedSteps}
                currentStep={currentStep}
                onBack={handleBackToMenu}
              />
            </div>
            <div className="lesson-left-bottom">
              <Terminal
                onCommand={handleCommand}
                currentBranch={currentBranch}
                suggestedCommand={suggestedCommand}
              />
            </div>
          </div>

          {/* Right Panel: Git Graph */}
          <div className="lesson-right-panel">
            <GitGraph
              commits={repositoryState.commits || []}
              branches={repositoryState.branches || {}}
              head={repositoryState.head || 'main'}
              detachedHead={repositoryState.detachedHead || false}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
      )}

      {currentView === 'sandbox' && (
        <div className="lesson-view">
          {/* Left Panel: Sandbox + Terminal */}
          <div className="lesson-left-panel">
            <div className="lesson-left-top">
              <Sandbox onBack={handleBackToMenu} />
            </div>
            <div className="lesson-left-bottom">
              <Terminal
                onCommand={handleCommand}
                currentBranch={currentBranch}
                suggestedCommand={null}
              />
            </div>
          </div>

          {/* Right Panel: Git Graph */}
          <div className="lesson-right-panel">
            <GitGraph
              commits={repositoryState.commits || []}
              branches={repositoryState.branches || {}}
              head={repositoryState.head || 'main'}
              detachedHead={repositoryState.detachedHead || false}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      <LevelComplete
        isVisible={showLevelComplete}
        lesson={currentLesson}
        xpEarned={currentLesson?.xpReward || 0}
        achievement={earnedAchievement}
        onNextLesson={handleNextLesson}
        onBackToMenu={handleBackToMenu}
        onDismiss={() => setShowLevelComplete(false)}
      />

      {/* Diff Viewer Modal */}
      {selectedCommitDiff && (
        <DiffViewer
          commit={selectedCommitDiff.commit}
          parentCommit={selectedCommitDiff.parentCommit}
          onClose={() => setSelectedCommitDiff(null)}
        />
      )}
    </div>
  );
}
