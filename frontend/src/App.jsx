import { useState } from 'react'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import Calculator from './components/Calculator.jsx'
import Assistant from './components/Assistant.jsx'
import Benchmark from './components/Benchmark.jsx'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('assistant')
  const [lang, setLang] = useState('en')

  const t = (en, hi) => lang === 'hi' ? hi : en

  return (
    <div className="app">
      <Header lang={lang} setLang={setLang} t={t} />
      <TabBar tab={tab} setTab={setTab} t={t} />
      <main className="main-content">
        {tab === 'assistant' && <Assistant lang={lang} t={t} />}
        {tab === 'calculator' && <Calculator lang={lang} t={t} />}
        {tab === 'benchmark' && <Benchmark lang={lang} t={t} />}
      </main>
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
