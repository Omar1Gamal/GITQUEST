/**
 * ProgressBar — XP progress bar with level indicator.
 */


import useLessonStore from '../../store/useLessonStore.js';
import './ProgressBar.css';

export default function ProgressBar() {
  const { xp, level, getXpForNextLevel, completedLessons } = useLessonStore();
  const xpForNext = getXpForNextLevel();
  const xpInLevel = xp % (level * 200);
  const progress = Math.min((xpInLevel / xpForNext) * 100, 100);

  return (
    <div className="progress-bar-container">
      <div className="progress-level">
        <span className="progress-level-badge">Lvl {level}</span>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-xp-text">{xp} XP</span>
      </div>
      <div className="progress-lessons-count">
        {completedLessons.length} ✓
      </div>
    </div>
  );
}
