import './TabBar.css'

const tabs = [
  {
    id: 'assistant',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    en: 'Rules Assistant',
    hi: 'नियम सहायक',
  },
  {
    id: 'calculator',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>
      </svg>
    ),
    en: 'Counter Calculator',
    hi: 'काउंटर कैलकुलेटर',
  },
  {
    id: 'benchmark',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    en: 'Live Benchmark',
    hi: 'लाइव बेंचमार्क',
  },
]

export default function TabBar({ tab, setTab, t }) {
  return (
    <nav className="tabbar" aria-label="Navigation">
      <div className="tabbar-inner">
        {tabs.map(({ id, icon, en, hi }) => (
          <button
            key={id}
            className={`tab-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            {icon}
            <span>{t(en, hi)}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
