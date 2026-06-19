/**
 * Certificate Component — Shows a live preview of the certificate at all times.
 * - Before completion: sample preview with blurred name + progress overlay
 * - After completion: full certificate with user's name + PDF download
 */

import { useRef, useState } from 'react';
import useAuthStore from '../../store/useAuthStore.js';
import useLessonStore from '../../store/useLessonStore.js';
import { lessons } from '../../lessons/lessonData.js';
import './Certificate.css';

// Corner ornament SVG
const CornerOrnament = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0L60 0L60 4L4 4L4 60L0 60Z" fill="#58a6ff" opacity="0.5" />
    <path d="M8 8L40 8L40 10L10 10L10 40L8 40Z" fill="#58a6ff" opacity="0.3" />
    <circle cx="4" cy="4" r="2" fill="#58a6ff" opacity="0.6" />
  </svg>
);

export default function Certificate({ onBack }) {
  const { currentUser } = useAuthStore();
  const { completedLessons } = useLessonStore();
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

  // Generate a certificate ID from Firebase UID
  const certId = currentUser?.uid
    ? `GQ-${currentUser.uid.substring(0, 16).toUpperCase()}`
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

  const handleShareLinkedIn = () => {
    // LinkedIn "Add to Profile" certification URL
    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: 'GitQuest Mastery Program — Git Version Control',
      organizationName: 'GitQuest',
      issueYear: new Date().getFullYear().toString(),
      issueMonth: (new Date().getMonth() + 1).toString(),
      certId: certId,
      certUrl: window.location.origin,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, '_blank');
  };

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
        {isComplete && (
          <button className="btn btn-linkedin btn-lg" onClick={handleShareLinkedIn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Add to LinkedIn
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
