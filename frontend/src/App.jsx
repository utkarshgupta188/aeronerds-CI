import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import LatestUpdates from './components/LatestUpdates.jsx'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import Calculator from './components/Calculator.jsx'
import Assistant from './components/Assistant.jsx'
import AmendmentManager from './components/AmendmentManager.jsx'
import LoginModal from './components/LoginModal.jsx'
import Landing from './components/Landing.jsx'
import './App.css'

const inTool = () => window.location.hash === '#app'

export default function App() {
  const [view, setView] = useState(() => (inTool() ? 'tool' : 'landing'))
  const [tab, setTab] = useState('assistant')
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  const [updates, setUpdates] = useState([])
  const [prefill, setPrefill] = useState('')

  useEffect(() => {
    const sync = () => setView(inTool() ? 'tool' : 'landing')
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [view])

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u))
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'amendments'), orderBy('added_at', 'desc'))
    return onSnapshot(q, snap =>
      setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.active !== false))
    )
  }, [])

  const current =
    (tab === 'amendments' && !user) || (tab === 'updates' && updates.length === 0) ? 'assistant' : tab

  function askAbout(q) { setPrefill(q); setTab('assistant') }

  function openTool(nextTab = 'assistant', question = '') {
    setPrefill(question)
    setTab(nextTab)
    window.location.hash = '#app'
    setView('tool')
  }

  function goHome() {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    setView('landing')
  }

  const t = (en, hi) => lang === 'hi' ? hi : en

  if (view === 'landing') {
    return (
      <Landing
        lang={lang}
        setLang={setLang}
        t={t}
        onOpen={(nextTab = 'assistant') => openTool(nextTab)}
        onAsk={q => openTool('assistant', q)}
        updates={updates}
      />
    )
  }

  return (
    <div className="app">
      <Header lang={lang} setLang={setLang} t={t} user={user} onLoginClick={() => setShowLogin(true)} onHome={goHome} />
      <TabBar tab={current} setTab={setTab} t={t} user={user} updatesCount={updates.length} />
      <main className="main-content">
        {current === 'assistant' && <Assistant lang={lang} t={t} initialQuestion={prefill} />}
        {current === 'calculator' && <Calculator lang={lang} t={t} />}
        {current === 'updates' && updates.length > 0 && <LatestUpdates amendments={updates} t={t} onAsk={askAbout} />}
        {current === 'amendments' && user && <AmendmentManager user={user} t={t} />}
      </main>
      {showLogin && <LoginModal user={user} onClose={() => setShowLogin(false)} t={t} />}
      <footer className="footer">
        <div className="footer-inner">
          <span>{t('Based on MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025.', 'एमपी भूमि विकास नियम 2012 पर आधारित, 6 मार्च 2025 तक।')}</span>
          <span className="footer-sep">·</span>
          <span>{t('Not legal advice. The clerk decides.', 'यह कानूनी सलाह नहीं है। अंतिम निर्णय क्लर्क का है।')}</span>
        </div>
      </footer>
    </div>
  )
}
