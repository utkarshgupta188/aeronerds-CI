import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import Calculator from './components/Calculator.jsx'
import Assistant from './components/Assistant.jsx'
import Benchmark from './components/Benchmark.jsx'
import AmendmentManager from './components/AmendmentManager.jsx'
import LoginModal from './components/LoginModal.jsx'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('assistant')
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u))
  }, [])

  const t = (en, hi) => lang === 'hi' ? hi : en

  return (
    <div className="app">
      <Header lang={lang} setLang={setLang} t={t} user={user} onLoginClick={() => setShowLogin(true)} />
      <TabBar tab={tab} setTab={setTab} t={t} user={user} />
      <main className="main-content">
        {tab === 'assistant' && <Assistant lang={lang} t={t} />}
        {tab === 'calculator' && <Calculator lang={lang} t={t} />}
        {tab === 'benchmark' && <Benchmark lang={lang} t={t} />}
        {tab === 'amendments' && <AmendmentManager user={user} t={t} />}
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
