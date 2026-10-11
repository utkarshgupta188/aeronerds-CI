import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import './LoginModal.css'

const ERRORS = {
  'auth/invalid-credential': ['Wrong email or password.', 'ईमेल या पासवर्ड गलत है।'],
  'auth/invalid-email': ['Enter a valid email address.', 'सही ईमेल पता दर्ज करें।'],
  'auth/too-many-requests': ['Too many attempts. Wait a few minutes and try again.', 'बहुत अधिक प्रयास। कुछ मिनट बाद पुनः प्रयास करें।'],
  'auth/network-request-failed': ['No network connection.', 'नेटवर्क कनेक्शन नहीं है।'],
  'auth/user-disabled': ['This account has been disabled.', 'यह खाता बंद कर दिया गया है।'],
}

const Emblem = () => (
  <svg width="56" height="56" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#fff"/>
    <circle cx="20" cy="20" r="16" fill="#E8620A"/>
    <circle cx="20" cy="20" r="11" fill="#1A3560"/>
    <circle cx="20" cy="20" r="7" fill="#E8620A"/>
    <circle cx="20" cy="20" r="3" fill="#fff"/>
  </svg>
)

export default function LoginModal({ user, onClose, t }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const msg = err => {
    const m = ERRORS[err.code]
    return m ? t(m[0], m[1]) : err.message
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      onClose()
    } catch (err) {
      setError(msg(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setError(''); setInfo('')
    if (!email.trim()) { setError(t('Enter your email first, then tap Forgot password.', 'पहले ईमेल दर्ज करें, फिर पासवर्ड भूल गए पर टैप करें।')); return }
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo(t('Password reset link sent. Check your inbox.', 'पासवर्ड रीसेट लिंक भेज दिया गया है। इनबॉक्स देखें।'))
    } catch (err) {
      setError(msg(err))
    }
  }

  async function handleLogout() {
    await signOut(auth)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={t('Clerk Login', 'क्लर्क लॉगिन')} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t('Close', 'बंद करें')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="modal-hero">
          <div className="modal-stripe" />
          <Emblem />
          <div className="modal-hero-title">{t('Clerk Portal', 'क्लर्क पोर्टल')}</div>
          <div className="modal-hero-sub">{t('Bhopal Municipal Corporation · Building Permission', 'भोपाल नगर पालिका निगम · भवन अनुमति')}</div>
        </div>

        {user ? (
          <div className="modal-body">
            <div className="clerk-badge">
              <div className="clerk-avatar">{user.email[0].toUpperCase()}</div>
              <div className="clerk-info">
                <div className="clerk-email">{user.email}</div>
                <div className="clerk-role"><span className="clerk-live" />{t('Signed in as clerk', 'क्लर्क के रूप में साइन इन')}</div>
              </div>
            </div>
            <p className="login-note">{t('You can add, switch on or off, and delete amendments in the Amendments tab.', 'आप संशोधन टैब में संशोधन जोड़, चालू/बंद और हटा सकते हैं।')}</p>
            <button className="btn btn-secondary modal-wide" onClick={handleLogout}>{t('Sign out', 'साइन आउट')}</button>
          </div>
        ) : (
          <form className="modal-body" onSubmit={handleLogin} noValidate>
            <div className="field">
              <label htmlFor="clerk-email">{t('Email', 'ईमेल')}</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
                <input id="clerk-email" className="login-input" type="text" inputMode="email" autoComplete="username" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="clerk@bmc.gov.in" autoFocus />
              </div>
            </div>
            <div className="field">
              <label htmlFor="clerk-pass">{t('Password', 'पासवर्ड')}</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="clerk-pass" className="login-input has-toggle" type={show ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="show-pass" onClick={() => setShow(s => !s)} aria-label={show ? t('Hide password', 'पासवर्ड छुपाएं') : t('Show password', 'पासवर्ड दिखाएं')}>
                  {show ? t('Hide', 'छुपाएं') : t('Show', 'दिखाएं')}
                </button>
              </div>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            {info && <div className="login-info" role="status">{info}</div>}

            <button className="btn btn-primary modal-wide" type="submit" disabled={loading || !email.trim() || !password}>
              {loading && <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.35)' }} />}
              {loading ? t('Signing in…', 'साइन इन हो रहा है…') : t('Sign in', 'साइन इन')}
            </button>
            <div className="login-links">
              <button type="button" className="link-btn" onClick={handleReset}>{t('Forgot password?', 'पासवर्ड भूल गए?')}</button>
            </div>
            <p className="login-note">{t('Only authorised BMC clerks can sign in. Citizens can use the Assistant and Calculator without signing in.', 'केवल अधिकृत BMC क्लर्क साइन इन कर सकते हैं। नागरिक बिना साइन इन के सहायक और कैलकुलेटर उपयोग कर सकते हैं।')}</p>
          </form>
        )}
      </div>
    </div>
  )
}
