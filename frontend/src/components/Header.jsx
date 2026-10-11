import './Header.css'

const BMCEmblem = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#1A3560"/>
    <circle cx="20" cy="20" r="16" fill="#E8620A"/>
    <circle cx="20" cy="20" r="11" fill="#1A3560"/>
    <circle cx="20" cy="20" r="7" fill="#E8620A"/>
    <circle cx="20" cy="20" r="3" fill="#fff"/>
    <path d="M20 4 L21.5 8 L20 7 L18.5 8 Z" fill="#fff"/>
    <path d="M36 20 L32 21.5 L33 20 L32 18.5 Z" fill="#fff"/>
    <path d="M20 36 L18.5 32 L20 33 L21.5 32 Z" fill="#fff"/>
    <path d="M4 20 L8 18.5 L7 20 L8 21.5 Z" fill="#fff"/>
  </svg>
)

export default function Header({ lang, setLang, t, user, onLoginClick, onHome }) {
  return (
    <header className="header">
      <div className="header-stripe" />
      <div className="header-inner">
        <div
          className="header-brand"
          onClick={onHome}
          onKeyDown={e => { if (onHome && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onHome() } }}
          role={onHome ? 'link' : undefined}
          tabIndex={onHome ? 0 : undefined}
          style={onHome ? { cursor: 'pointer' } : undefined}
          title={onHome ? t('Back to home', 'होम पर वापस') : undefined}
        >
          <BMCEmblem />
          <div className="header-titles">
            <div className="header-title-hi">भूमि विकास सहायक</div>
            <div className="header-title-en">Bhumi Vikas Sahayak</div>
            <div className="header-sub">{t('Bhopal Municipal Corporation · Building Permission Counter', 'भोपाल नगर पालिका निगम · भवन अनुमति काउंटर')}</div>
          </div>
        </div>
        <div className="header-controls">
          <div className="header-tag">
            <span className="live-dot" />
            {t('MP Bhumi Vikas Rules 2012', 'एमपी भूमि विकास नियम 2012')}
          </div>
          <button
            className="lang-toggle"
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button className="clerk-login-btn" onClick={onLoginClick} title={user ? user.email : t('Clerk Login', 'क्लर्क लॉगिन')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {user ? (
              <span className="clerk-dot" />
            ) : (
              <span>{t('Clerk', 'क्लर्क')}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
