/**
 * LessonPanel — Displays lesson instructions, objectives, and progress.
 */

import React, { useState, useMemo } from 'react';
import { MODULES } from '../../lessons/lessonData.js';
import './LessonPanel.css';

export default function LessonPanel({ lesson, completedSteps = 0, currentStep = 0, onBack, onHint }) {
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showConcept, setShowConcept] = useState(true);

  if (!lesson) return null;

  const module = MODULES[lesson.module];

  const handleHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintIndex(0);
    } else if (hintIndex < lesson.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    if (onHint) onHint();
  };

  // Parse text for bold, code, etc.
  const renderText = (text) => {
    // Simple markdown-like rendering
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      if (part === '\n') {
        return <br key={i} />;
      }
      return part;
    });
  };

  return (
    <div className="lesson-panel">
      {/* Header */}
      <div className="lesson-header">
        <div className="lesson-breadcrumb">
          <span 
            style={{ cursor: 'pointer', color: 'var(--text-link)' }}
            onClick={onBack}
          >
            ← Back
          </span>
          <span className="lesson-breadcrumb-divider">/</span>
          <span style={{ color: module?.color }}>{module?.icon} {module?.title}</span>
          <span className="lesson-breadcrumb-divider">/</span>
          <span>{lesson.title}</span>
        </div>
        <h2 className="lesson-title">{lesson.title}</h2>
        <p className="lesson-description">{lesson.description}</p>
      </div>

      {/* Concept/Briefing */}
      {lesson.conceptExplanation && (
        <div className="lesson-concept">
          <button
            className="lesson-concept-toggle"
            onClick={() => setShowConcept(!showConcept)}
          >
            <span className="lesson-concept-icon">{lesson.isAssessment ? '🎯' : '📖'}</span>
            <span className="lesson-concept-label">{lesson.isAssessment ? 'Mission Briefing' : 'Concept Explanation'}</span>
            <span className={`lesson-concept-arrow ${showConcept ? 'open' : ''}`}>▾</span>
          </button>
          {showConcept && (
            <div className="lesson-concept-body">
              {renderText(lesson.conceptExplanation)}
            </div>
          )}
        </div>
      )}

      {/* Objectives */}
      <div className="lesson-objectives">
        <div className="lesson-objectives-title">🎯 Objectives</div>
        {lesson.objectives.map((obj, i) => (
          <div key={i} className={`lesson-objective ${i < completedSteps ? 'completed' : ''}`}>
            <span className={`objective-check ${i < completedSteps ? 'completed' : ''}`} />
            <span>{obj}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="lesson-instructions">
        {!lesson.isAssessment && lesson.instructions.map((step, i) => (
          <div 
            key={i} 
            className={`lesson-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
            style={{ opacity: 1, animationDelay: `${i * 0.05}s` }}
          >
            <div className="lesson-step-number">{i + 1}</div>
            <div className="lesson-step-text">
              {renderText(step.text)}
            </div>
            {step.command && (
              <div className="lesson-step-command" title="Click to type this command">
                {step.command}
              </div>
            )}
          </div>
        ))}

        {/* Hint */}
        {showHint && lesson.hints && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            background: 'rgba(210, 153, 34, 0.08)',
            border: '1px solid rgba(210, 153, 34, 0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--accent-amber)',
          }}>
            💡 {lesson.hints[hintIndex]}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="lesson-footer">
        <button className="lesson-hint-btn" onClick={handleHint}>
          💡 {showHint ? 'Next Hint' : 'Hint'}
        </button>
        <div className="lesson-xp-badge">
          ⭐ {lesson.xpReward} XP
        </div>
      </div>
    </div>
  );
}
