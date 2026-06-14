/**
 * Auth Component — Login / Sign-up form.
 * Glassmorphism design with animated background.
 */

import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore.js';
import './Auth.css';

export default function Auth() {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'register') {
        result = await register(name, email, password);
      } else {
        result = await login(email, password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'register' ? 'login' : 'register');
    setError('');
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
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
            <span className="auth-feature-text">18 Lessons</span>
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
