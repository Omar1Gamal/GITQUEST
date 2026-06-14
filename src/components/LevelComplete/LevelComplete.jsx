/**
 * LevelComplete — Celebration modal shown when a lesson is completed.
 */

import React from 'react';
import ReactConfetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { getNextLesson } from '../../lessons/lessonData.js';
import './LevelComplete.css';

export default function LevelComplete({ 
  isVisible, 
  lesson, 
  xpEarned = 0, 
  achievement = null,
  onNextLesson, 
  onBackToMenu,
  onDismiss 
}) {
  if (!isVisible || !lesson) return null;

  const nextLesson = getNextLesson(lesson.id);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.1}
            colors={['#58a6ff', '#f778ba', '#3fb950', '#d29922', '#bc8cff', '#ffa657']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 999 }}
          />
          <motion.div 
            className="level-complete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDismiss}
          >
            <motion.div 
              className="level-complete-modal"
              initial={{ scale: 0.6, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25,
                delay: 0.1 
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="level-complete-icon">🎉</div>
              <h2 className="level-complete-title">Level Complete!</h2>
              <p className="level-complete-lesson">{lesson.title}</p>

              <div className="level-complete-rewards">
                <motion.div 
                  className="reward-item"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                >
                  <span className="reward-icon">⭐</span>
                  <span className="reward-value">+{xpEarned} XP</span>
                </motion.div>

                {achievement && (
                  <motion.div 
                    className="reward-item achievement-reward"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
                  >
                    <span className="reward-icon">🏆</span>
                    <span className="reward-value">Achievement Unlocked!</span>
                    <span className="achievement-name">{achievement}</span>
                  </motion.div>
                )}
              </div>

              <div className="level-complete-actions">
                {nextLesson && (
                  <button className="btn btn-primary btn-lg" onClick={onNextLesson}>
                    Next Lesson →
                  </button>
                )}
                <button className="btn btn-secondary" onClick={onBackToMenu}>
                  Back to Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
