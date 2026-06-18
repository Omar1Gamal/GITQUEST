/**
 * Auth Component — Login / Sign-up form with Firebase.
 * Supports Email/Password + Google Sign-In.
 * Glassmorphism design with animated background.
 */

import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore.js';
import './Auth.css';

// Google logo SVG (official colors)
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Auth() {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  const { register, login, loginWithGoogle } = useAuthStore();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#f85149' };
    if (score <= 3) return { score, label: 'Fair', color: '#d29922' };
    if (score <= 4) return { score, label: 'Good', color: '#58a6ff' };
    return { score, label: 'Strong', color: '#3fb950' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'register') {
        result = await register(name, email, password);
        if (result.success && result.needsVerification) {
          setShowVerificationBanner(true);
        }
      } else {
        result = await login(email, password);
      }

      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'register' ? 'login' : 'register');
    setError('');
    setShowVerificationBanner(false);
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🚀</span>
          <div className="auth-logo-text">
            <span className="text-gradient">GitQuest</span>
          </div>
        </div>
        <p className="auth-subtitle">
          {mode === 'register'
            ? 'Create your account and start mastering Git today.'
            : 'Welcome back! Log in to continue your journey.'}
        </p>

        {/* Verification Banner */}
        {showVerificationBanner && (
          <div className="auth-verification-banner">
            <span className="auth-verification-icon">📧</span>
            <div>
              <strong>Verification email sent!</strong>
              <p>Check your inbox and click the link to verify your email address. You can continue using GitQuest in the meantime.</p>
            </div>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          type="button"
        >
          {googleLoading ? (
            <span className="auth-spinner" />
          ) : (
            <GoogleLogo />
          )}
          {mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className="auth-input"
                type="text"
                placeholder="Your full name (for certificate)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className="auth-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
            {/* Password Strength Indicator */}
            {mode === 'register' && password.length > 0 && (
              <div className="auth-password-strength">
                <div className="auth-strength-bar">
                  <div
                    className="auth-strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span className="auth-strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {mode === 'register' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        {/* Toggle */}
        <div className="auth-toggle">
          {mode === 'register' ? (
            <>Already have an account?{' '}
              <button className="auth-toggle-link" onClick={toggleMode} type="button">
                Log in
              </button>
            </>
          ) : (
            <>Don&apos;t have an account?{' '}
              <button className="auth-toggle-link" onClick={toggleMode} type="button">
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Features */}
        <div className="auth-features">
          <div className="auth-feature">
            <span className="auth-feature-icon">🎓</span>
            <span className="auth-feature-text">18+ Lessons</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🏆</span>
            <span className="auth-feature-text">Certificates</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">💻</span>
            <span className="auth-feature-text">Interactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
