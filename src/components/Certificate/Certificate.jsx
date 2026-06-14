/**
 * Certificate Component — Shows a live preview of the certificate at all times.
 * - Before completion: sample preview with blurred name + progress overlay
 * - After completion: full certificate with user's name + PDF download
 */

import React, { useRef, useState } from 'react';
import useAuthStore from '../../store/useAuthStore.js';
import useLessonStore from '../../store/useLessonStore.js';
import { lessons } from '../../lessons/lessonData.js';
import './Certificate.css';

export default function Certificate({ onBack }) {
  const { currentUser } = useAuthStore();
  const { completedLessons, xp, level } = useLessonStore();
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const requiredLessons = lessons.filter(l => !l.isOptional);
  const totalLessons = requiredLessons.length;
  const completedRequired = completedLessons.filter(id => requiredLessons.some(rl => rl.id === id));
  
  const completionPercentage = Math.round((completedRequired.length / totalLessons) * 100);
  const isComplete = completedRequired.length >= totalLessons;
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate a certificate ID from user email + date
  const certId = currentUser
    ? `GQ-${btoa(currentUser.email).substring(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    : 'GQ-000000';

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !isComplete) return;
    setDownloading(true);

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#0f1923',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`GitQuest-Certificate-${currentUser?.name?.replace(/\s+/g, '_') || 'Student'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate certificate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Corner ornament SVG
  const CornerOrnament = () => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0L60 0L60 4L4 4L4 60L0 60Z" fill="#58a6ff" opacity="0.5" />
      <path d="M8 8L40 8L40 10L10 10L10 40L8 40Z" fill="#58a6ff" opacity="0.3" />
      <circle cx="4" cy="4" r="2" fill="#58a6ff" opacity="0.6" />
    </svg>
  );

  return (
    <div className="certificate-page">
      {/* Header */}
      <div className="certificate-header">
        {isComplete ? (
          <>
            <h1>🎉 <span className="text-gradient">Congratulations!</span></h1>
            <p>You&apos;ve mastered Git! Download your certificate below.</p>
          </>
        ) : (
          <>
            <h1>📜 <span className="text-gradient">Your Certificate</span></h1>
            <p>Here&apos;s a preview of the certificate you&apos;ll earn upon completing all lessons.</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="certificate-actions">
        {isComplete ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? '⏳ Generating...' : '📄 Download as PDF'}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={onBack}>
            ← Continue Learning
          </button>
        )}
        <button className="btn btn-secondary btn-lg" onClick={onBack}>
          Back to Menu
        </button>
      </div>

      {/* Progress bar (only when not complete) */}
      {!isComplete && (
        <div className="certificate-progress-inline">
          <div className="certificate-progress-bar-container">
            <div className="certificate-progress-bar-track">
              <div
                className="certificate-progress-bar-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="certificate-progress-text">
              {completedRequired.length} of {totalLessons} lessons completed — {completionPercentage}%
            </div>
          </div>
        </div>
      )}

      {/* The Certificate (always visible) */}
      <div className="certificate-wrapper">
        <div className={`certificate ${!isComplete ? 'certificate-sample' : ''}`} ref={certificateRef}>
          {/* Decorative elements */}
          <div className="cert-bg-pattern" />
          <div className="cert-glow-top" />
          <div className="cert-glow-bottom" />

          {/* Corner ornaments */}
          <div className="cert-corner cert-corner-tl"><CornerOrnament /></div>
          <div className="cert-corner cert-corner-tr"><CornerOrnament /></div>
          <div className="cert-corner cert-corner-bl"><CornerOrnament /></div>
          <div className="cert-corner cert-corner-br"><CornerOrnament /></div>

          {/* Content */}
          <div className="cert-icon">🏆</div>
          <div className="cert-title-label">Certificate of Completion</div>
          <h2 className="cert-title">GitQuest Mastery Program</h2>
          <div className="cert-presented-to">This certifies that</div>

          {/* Name — real or placeholder */}
          {isComplete ? (
            <div className="cert-name">{currentUser?.name || 'Student'}</div>
          ) : (
            <div className="cert-name cert-name-sample">
              <span className="cert-name-placeholder">Your Name Here</span>
            </div>
          )}

          <p className="cert-description">
            has successfully completed all {totalLessons} interactive lessons in the GitQuest Mastery Program,
            demonstrating proficiency in Git version control — from fundamentals through advanced
            history rewriting techniques.
          </p>

          <div className="cert-stats">
            <div className="cert-stat">
              <span className="cert-stat-value">{totalLessons}</span>
              <span className="cert-stat-label">Lessons</span>
            </div>
            <div className="cert-stat">
              <span className="cert-stat-value">{isComplete ? xp : '—'}</span>
              <span className="cert-stat-label">XP Earned</span>
            </div>
            <div className="cert-stat">
              <span className="cert-stat-value">{isComplete ? `Level ${level}` : '—'}</span>
              <span className="cert-stat-label">Achieved</span>
            </div>
          </div>

          <div className="cert-footer">
            <div className="cert-date">{isComplete ? completionDate : '—'}</div>
            <div className="cert-logo">
              <span className="text-gradient">GitQuest</span>
            </div>
            <div className="cert-id">{isComplete ? certId : 'GQ-XXXXXX'}</div>
          </div>
        </div>

        {/* Sample overlay badge (only when not complete) */}
        {!isComplete && (
          <div className="cert-sample-badge">SAMPLE PREVIEW</div>
        )}
      </div>
    </div>
  );
}
