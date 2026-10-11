import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import './LoginModal.css'

export default function LoginModal({ user, onClose, t }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      onClose()
    } catch (err) {
      setError(err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="modal-title">{t('Clerk Login', 'क्लर्क लॉगिन')}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {user ? (
          <div className="modal-logged-in">
            <div className="clerk-badge">
              <div className="clerk-avatar">{user.email[0].toUpperCase()}</div>
              <div>
                <div className="clerk-email">{user.email}</div>
                <div className="clerk-role">{t('Logged in as Clerk', 'क्लर्क के रूप में लॉग इन')}</div>
              </div>
            </div>
            <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
              {t('Sign Out', 'साइन आउट')}
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="field">
              <label>{t('Email', 'ईमेल')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="clerk@bmc.gov.in"
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>{t('Password', 'पासवर्ड')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {t('Sign In', 'साइन इन')}
            </button>
            <p className="login-note">{t('Only authorised BMC clerks can log in.', 'केवल अधिकृत BMC क्लर्क लॉग इन कर सकते हैं।')}</p>
          </form>
        )}
      </div>
    </div>
  )
}
