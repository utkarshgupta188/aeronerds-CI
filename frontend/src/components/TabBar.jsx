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
    id: 'amendments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    en: 'Manage Amendments',
    hi: 'संशोधन प्रबंधन',
    clerkOnly: true,
  },
]

const updatesTab = {
  id: 'updates',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  en: 'Latest Updates',
  hi: 'नवीनतम अपडेट',
}

export default function TabBar({ tab, setTab, t, user, updatesCount }) {
  const visible = [
    ...tabs.slice(0, 2),
    ...(updatesCount > 0 ? [updatesTab] : []),
    ...tabs.slice(2).filter(x => !x.clerkOnly || user),
  ]
  return (
    <nav className="tabbar" aria-label="Navigation">
      <div className="tabbar-inner">
        {visible.map(({ id, icon, en, hi, clerkOnly }) => (
          <button
            key={id}
            className={`tab-btn ${tab === id ? 'active' : ''} ${clerkOnly ? 'tab-clerk' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            {icon}
            <span>{t(en, hi)}</span>
            {id === 'updates' && <span className="tab-count">{updatesCount}</span>}
            {clerkOnly && <span className="tab-clerk-dot" />}
          </button>
        ))}
      </div>
    </nav>
  )
}
