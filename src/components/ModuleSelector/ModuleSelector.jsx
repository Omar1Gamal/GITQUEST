/**
 * ModuleSelector — Landing page / curriculum overview with three module cards.
 */

import React from 'react';
import { MODULES, getLessonsByModule } from '../../lessons/lessonData.js';
import useLessonStore from '../../store/useLessonStore.js';
import './ModuleSelector.css';

export default function ModuleSelector({ onSelectLesson, onSelectSandbox }) {
  const { completedLessons, isModuleUnlocked, xp, level } = useLessonStore();
  const moduleOrder = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="module-selector">
      {/* Hero Section */}
      <div className="module-hero">
        <div className="module-hero-badge">🚀 Interactive Learning Platform</div>
        <h1 className="module-hero-title">
          <span className="text-gradient">GitQuest</span>
        </h1>
        <p className="module-hero-subtitle">
          Master Git through hands-on practice. Type real commands, see instant visual feedback, and level up your skills from beginner to advanced.
        </p>
        <div className="module-hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{completedLessons.length}</span>
            <span className="hero-stat-label">Lessons Done</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">{xp}</span>
            <span className="hero-stat-label">Total XP</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">Lvl {level}</span>
            <span className="hero-stat-label">Current Level</span>
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={onSelectSandbox} style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            🧪 Enter Sandbox Mode
          </button>
        </div>
      </div>

      {/* Module Cards */}
      <div className="module-grid">
        {moduleOrder.map((moduleId, i) => {
          const mod = MODULES[moduleId];
          const moduleLessons = getLessonsByModule(moduleId);
          const nonAssessmentLessons = moduleLessons.filter(l => !l.isAssessment);
          const standardLessons = nonAssessmentLessons.filter(l => !l.isOptional);
          const assessmentLesson = moduleLessons.find(l => l.isAssessment);
          const unlocked = isModuleUnlocked(moduleId);
          const completedStandard = standardLessons.filter(l => completedLessons.includes(l.id));
          const progress = standardLessons.length > 0 ? (completedStandard.length / standardLessons.length) * 100 : 0;
          const allStandardCompleted = standardLessons.length > 0 && completedStandard.length === standardLessons.length;
          const assessmentCompleted = assessmentLesson ? completedLessons.includes(assessmentLesson.id) : false;

          return (
            <div 
              key={moduleId} 
              className={`module-card ${!unlocked ? 'locked' : ''}`}
              style={{ 
                '--module-color': mod.color,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="module-card-header">
                <span className="module-card-icon">{mod.icon}</span>
                <div className="module-card-level">
                  {!unlocked && <span className="module-lock-icon">🔒</span>}
                  <span className={`badge ${moduleId === 'beginner' ? 'badge-emerald' : moduleId === 'intermediate' ? 'badge-cyan' : 'badge-magenta'}`}>
                    {moduleId === 'beginner' ? 'Beginner' : moduleId === 'intermediate' ? 'Intermediate' : 'Advanced'}
                  </span>
                </div>
              </div>

              <h3 className="module-card-title">{mod.title}</h3>
              <p className="module-card-subtitle">{mod.description}</p>

              {/* Progress bar */}
              <div className="module-progress">
                <div className="module-progress-bar">
                  <div 
                    className="module-progress-fill" 
                    style={{ width: `${progress}%`, backgroundColor: mod.color }}
                  />
                </div>
                <span className="module-progress-text">
                  {completedStandard.length}/{standardLessons.length} lessons
                </span>
              </div>

              {/* Lesson list */}
              <div className="module-lessons">
                {nonAssessmentLessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      className={`module-lesson-item ${isCompleted ? 'completed' : ''}`}
                      onClick={() => unlocked && onSelectLesson(lesson)}
                      disabled={!unlocked}
                    >
                      <span className={`module-lesson-check ${isCompleted ? 'done' : ''}`}>
                        {isCompleted ? '✓' : '○'}
                      </span>
                      <span className="module-lesson-title">
                        {lesson.title}
                        {lesson.isOptional && <span style={{marginLeft: '8px', fontSize: '0.8em', color: 'var(--accent-amber)'}}>⭐ Bonus</span>}
                      </span>
                      <span className="module-lesson-xp">+{lesson.xpReward} XP</span>
                    </button>
                  );
                })}
              </div>

              {/* Assessment Button */}
              {assessmentLesson && (
                <div className="module-assessment-container">
                  <button
                    className={`btn btn-block ${assessmentCompleted ? 'btn-success' : allStandardCompleted ? 'btn-primary' : 'btn-secondary'} assessment-btn`}
                    onClick={() => allStandardCompleted && onSelectLesson(assessmentLesson)}
                    disabled={!allStandardCompleted && !assessmentCompleted}
                    style={{ marginTop: 'var(--space-4)', opacity: (!allStandardCompleted && !assessmentCompleted) ? 0.5 : 1 }}
                  >
                    {assessmentCompleted ? '🏆 Assessment Passed' : allStandardCompleted ? '🚀 Take Assessment' : '🔒 Assessment Locked'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
