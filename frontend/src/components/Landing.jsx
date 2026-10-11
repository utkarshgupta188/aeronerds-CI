import { useEffect, useRef, useState } from 'react'
import './Landing.css'

const RULEBOOK_EN = 'https://mptownplan.gov.in/NewsPDF/bvn06032025E.pdf'
const RULEBOOK_HI = 'https://mptownplan.gov.in/NewsPDF/bvn06032025H.pdf'
const AMENDMENT_URL = 'https://teamleaseregtech.com/updates/article/59469/government-of-madhya-pradesh-amendment-to-land-development-rules'
const REPO_URL = 'https://github.com/utkarshgupta188/aeronerds-CI'
const PROBLEM_URL = 'https://github.com/Laaaaksh/bhopal-impact-lab-2026'

const Emblem = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#1c1b3a"/>
    <circle cx="20" cy="20" r="16" fill="#d9381e"/>
    <circle cx="20" cy="20" r="11" fill="#1c1b3a"/>
    <circle cx="20" cy="20" r="7" fill="#d9381e"/>
    <circle cx="20" cy="20" r="3" fill="#fff"/>
    <path d="M20 4 L21.5 8 L20 7 L18.5 8 Z" fill="#fff"/>
    <path d="M36 20 L32 21.5 L33 20 L32 18.5 Z" fill="#fff"/>
    <path d="M20 36 L18.5 32 L20 33 L21.5 32 Z" fill="#fff"/>
    <path d="M4 20 L8 18.5 L7 20 L8 21.5 Z" fill="#fff"/>
  </svg>
)

const I = ({ d, size = 16, stroke = 2 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const ICON = {
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  access: <><circle cx="12" cy="5" r="2"/><path d="M12 7v10M8 11h8M9 21l3-4 3 4"/></>,
  reader: <><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>,
  calc: <><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></>,
  print: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  check: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  pause: <><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></>,
  play: <><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></>,
  menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  code: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
  scale: <><path d="M12 3v18M3 7h18M5 7l-3 7a3.5 3.5 0 0 0 7 0L6 7M19 7l-3 7a3.5 3.5 0 0 0 7 0l-3-7"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
}

const FAQ = [
  { en: 'My house faces a 10 m wide street and will be 9 m tall. How much open space do I leave at the front?', hi: 'मेरा मकान 10 मीटर चौड़ी सड़क पर है और 9 मीटर ऊंचा होगा। आगे कितनी जगह खाली छोड़नी होगी?' },
  { en: 'What is the minimum rear open space for a 150 sq m residential plot?', hi: '150 वर्ग मीटर के आवासीय प्लॉट में पीछे कम से कम कितनी जगह छोड़नी होगी?' },
  { en: 'What is the fee for building permission for a residential house?', hi: 'बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?' },
  { en: 'What documents go with an application for building permission?', hi: 'भवन अनुमति के आवेदन के साथ कौन से दस्तावेज़ लगते हैं?' },
  { en: 'Do I need separate development permission for a 300 sq m plot that matches the Development Plan?', hi: 'क्या विकास योजना के अनुरूप 300 वर्ग मीटर के प्लॉट के लिए अलग विकास अनुमति चाहिए?' },
  { en: 'What are the rules for lifts in a building taller than 15 m?', hi: '15 मीटर से ऊंची इमारत में लिफ्ट के क्या नियम हैं?' },
]

const RULE_UPDATES = [
  { date: '28 Aug 2026', en: 'Amendment to Rule 2(5)(c): plots up to 500 sq m conforming to the Development Plan exempt from separate development permission', hi: 'नियम 2(5)(ग) में संशोधन: विकास योजना के अनुरूप 500 वर्ग मीटर तक के भूखंड अलग विकास अनुमति से मुक्त', href: AMENDMENT_URL },
  { date: '06 Mar 2025', en: 'Consolidated edition of the M.P. Bhumi Vikas Rules, 2012 published by the T&CP Department (Rules 52 and 103 inserted/substituted by notification of the same date)', hi: 'म.प्र. भूमि विकास नियम, 2012 का समेकित संस्करण नगर तथा ग्राम निवेश विभाग द्वारा प्रकाशित (नियम 52 और 103 उसी तिथि की अधिसूचना से)', href: RULEBOOK_EN },
  { date: '20 Jun 2024', en: 'Rule 12-A: instant/deemed building approval extended to residential plots up to 186 sq m', hi: 'नियम 12-क: 186 वर्ग मीटर तक के आवासीय भूखंडों के लिए तत्काल/मानित भवन अनुमति', href: RULEBOOK_EN },
]

function PlotDiagram({ t }) {
  return (
    <svg viewBox="0 0 320 230" className="pt-plot" aria-hidden="true">
      <rect x="0" y="0" width="320" height="230" fill="none"/>
      <rect x="40" y="18" width="240" height="150" fill="#fff" stroke="#1c1b3a" strokeWidth="2"/>
      <rect x="86" y="54" width="148" height="80" fill="#fde9e4" stroke="#d9381e" strokeWidth="2"/>
      <text x="160" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1c1b3a">{t('Building', 'भवन')}</text>
      <rect x="40" y="186" width="240" height="26" fill="#e2e8f0"/>
      <text x="160" y="203" textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">{t('Road 9.0 m', 'सड़क 9.0 मी.')}</text>
      <line x1="160" y1="134" x2="160" y2="168" stroke="#184e68" strokeWidth="1.5" markerEnd="url(#a)" markerStart="url(#a)"/>
      <text x="168" y="156" fontSize="11" fontWeight="700" fill="#184e68">3.0 m</text>
      <line x1="160" y1="18" x2="160" y2="54" stroke="#184e68" strokeWidth="1.5"/>
      <text x="168" y="40" fontSize="11" fontWeight="700" fill="#184e68">2.5 m</text>
      <line x1="40" y1="94" x2="86" y2="94" stroke="#184e68" strokeWidth="1.5"/>
      <text x="46" y="88" fontSize="10" fontWeight="700" fill="#184e68">3 m</text>
      <line x1="234" y1="94" x2="280" y2="94" stroke="#184e68" strokeWidth="1.5"/>
      <text x="246" y="88" fontSize="10" fontWeight="700" fill="#184e68">3 m</text>
      <text x="40" y="226" fontSize="10" fill="#64748b">{t('200 sq m plot · Rule 56(1)(a), 56(2)(a), 56(3)', '200 वर्ग मी. भूखंड · नियम 56(1)(a), 56(2)(a), 56(3)')}</text>
    </svg>
  )
}

export default function Landing({ lang, setLang, t, onOpen, onAsk, updates = [] }) {
  const [q, setQ] = useState('')
  const [fontCls, setFontCls] = useState('normal')
  const [contrast, setContrast] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tab, setTab] = useState('rules')
  const timer = useRef(null)

  const SLIDES = 3
  useEffect(() => {
    if (paused) return
    timer.current = setInterval(() => setSlide(s => (s + 1) % SLIDES), 6000)
    return () => clearInterval(timer.current)
  }, [paused])

  function submit(e) {
    e.preventDefault()
    if (q.trim()) onAsk(q.trim())
  }
  const go = id => { setNavOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const open = (tabName) => { setNavOpen(false); onOpen(tabName) }

  const NAV = [
    { label: t('Services', 'सेवाएं'), cols: [
      { h: t('Counter tools', 'काउंटर उपकरण'), items: [
        [t('Rules Assistant', 'नियम सहायक'), () => open('assistant')],
        [t('Counter Calculator', 'काउंटर कैलकुलेटर'), () => open('calculator')],
        [t('Citizen Guidance Slip', 'नागरिक मार्गदर्शन पर्ची'), () => open('assistant')],
      ] },
      { h: t('Updates', 'अपडेट'), items: [
        [t('Latest rule updates', 'नवीनतम नियम अपडेट'), () => go('pt-updates')],
        [t('Clerk login & amendments', 'क्लर्क लॉगिन व संशोधन'), () => open('assistant')],
      ] },
    ] },
    { label: t('About', 'परिचय'), cols: [
      { h: t('The service', 'सेवा'), items: [
        [t('About this service', 'इस सेवा के बारे में'), () => go('pt-about')],
        [t('How an answer is produced', 'उत्तर कैसे तैयार होता है'), () => go('pt-how')],
        [t('Accuracy and limits', 'सटीकता और सीमाएं'), () => go('pt-faq')],
      ] },
    ] },
    { label: t('Rulebook', 'नियमावली'), cols: [
      { h: t('Official documents', 'आधिकारिक दस्तावेज़'), items: [
        [t('M.P. Bhumi Vikas Rules 2012 — English PDF', 'म.प्र. भूमि विकास नियम 2012 — अंग्रेज़ी PDF'), RULEBOOK_EN],
        [t('M.P. Bhumi Vikas Rules 2012 — Hindi PDF', 'म.प्र. भूमि विकास नियम 2012 — हिन्दी PDF'), RULEBOOK_HI],
        [t('Amendment of 28 August 2026', '28 अगस्त 2026 का संशोधन'), AMENDMENT_URL],
      ] },
      { h: t('Testing', 'परीक्षण'), items: [
        [t('Frequently asked at the counter', 'काउंटर पर अक्सर पूछे जाने वाले प्रश्न'), () => go('pt-faq')],
        [t('Problem statement and sample questions', 'समस्या विवरण व नमूना प्रश्न'), PROBLEM_URL],
      ] },
    ] },
    { label: t('Help', 'सहायता'), cols: [
      { h: t('Support', 'सहयोग'), items: [
        [t('Questions about the tool', 'टूल के बारे में प्रश्न'), () => go('pt-faq')],
        [t('Disclaimer', 'अस्वीकरण'), () => go('pt-disclaimer')],
        [t('Source code on GitHub', 'GitHub पर स्रोत कोड'), REPO_URL],
      ] },
    ] },
  ]

  const renderItem = ([label, target], i) => typeof target === 'string'
    ? <a key={i} href={target} target="_blank" rel="noopener noreferrer">{label}</a>
    : <button key={i} type="button" onClick={target}>{label}</button>

  return (
    <div className={`pt pt-font-${fontCls} ${contrast ? 'pt-contrast' : ''}`} lang={lang === 'hi' ? 'hi' : 'en'}>
      <a className="pt-skip" href="#pt-main">{t('Skip to Main Content', 'मुख्य सामग्री पर जाएं')}</a>

      {/* 1. TOP UTILITY BAR */}
      <div className="pt-topbar">
        <div className="pt-wrap pt-topbar-inner">
          <div className="pt-topbar-left">
            <a href="#pt-main" className="pt-topbar-skip">{t('Skip to Main Content', 'मुख्य सामग्री पर जाएं')}</a>
          </div>
          <div className="pt-topbar-right">
            <a className="pt-topbar-btn" href="#pt-main"><I d={ICON.reader} size={14}/><span>{t('Screen Reader', 'स्क्रीन रीडर')}</span></a>
            <button type="button" className="pt-topbar-btn" onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}>
              <I d={ICON.globe} size={14}/><span>{lang === 'en' ? 'English' : 'हिन्दी'}</span><span className="pt-carat">&#9662;</span>
            </button>
            <div className="pt-dd-wrap">
              <button type="button" className="pt-topbar-btn" aria-haspopup="true"><I d={ICON.access} size={14}/><span>{t('More', 'अधिक')}</span><span className="pt-carat">&#9662;</span></button>
              <div className="pt-access-pop">
                <div className="pt-font-resizer" aria-label={t('Text sizing', 'अक्षर आकार')}>
                  <button type="button" className={fontCls === 'sm' ? 'active' : ''} onClick={() => setFontCls('sm')}>A-</button>
                  <button type="button" className={fontCls === 'normal' ? 'active' : ''} onClick={() => setFontCls('normal')}>A</button>
                  <button type="button" className={fontCls === 'lg' ? 'active' : ''} onClick={() => setFontCls('lg')}>A+</button>
                </div>
                <button type="button" className="pt-contrast-btn" onClick={() => setContrast(c => !c)}>&#9681; {t('Contrast', 'कंट्रास्ट')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="pt-header">
        <div className="pt-wrap pt-header-inner">
          <button type="button" className="pt-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Bhumi Vikas Sahayak">
            <Emblem size={48}/>
            <div className="pt-tagline">
              <span className="pt-tag-a">भूमि विकास</span>
              <span className="pt-tag-b">सहायक</span>
            </div>
            <div className="pt-vsep"/>
            <div className="pt-authority">
              <div className="pt-auth-hi">{t('Bhopal Municipal Corporation · Building Permission Counter', 'भोपाल नगर पालिका निगम · भवन अनुमति काउंटर')}</div>
              <div className="pt-auth-en">{t('Bhumi Vikas Sahayak — Assistant for the M.P. Bhumi Vikas Rules, 2012 · AeroNerds', 'भूमि विकास सहायक — म.प्र. भूमि विकास नियम, 2012 के लिए सहायक · AeroNerds')}</div>
            </div>
          </button>

          <form className="pt-search" onSubmit={submit}>
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={t('Ask a question about the building rules', 'भवन नियमों के बारे में प्रश्न पूछें')}
              aria-label={t('Ask a question', 'प्रश्न पूछें')}
              autoComplete="off"
            />
            <button type="submit" aria-label={t('Ask', 'पूछें')}><I d={ICON.search} size={18}/></button>
          </form>

          <button className="pt-nav-toggle" type="button" aria-label="Toggle Menu" aria-expanded={navOpen} onClick={() => setNavOpen(o => !o)}><I d={ICON.menu} size={18}/></button>
        </div>
      </header>

      {/* 3. PRIMARY NAV STRIP */}
      <nav className="pt-nav" aria-label={t('Main navigation', 'मुख्य नेविगेशन')}>
        <div className="pt-wrap pt-nav-inner">
          <div className={`pt-nav-list ${navOpen ? 'open' : ''}`}>
            <button type="button" className="pt-nav-home" onClick={() => { setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <I d={ICON.home} size={16}/><span>{t('Home', 'मुख्य पृष्ठ')}</span>
            </button>
            {NAV.map((n, i) => (
              <div key={i} className="pt-nav-item">
                <button type="button" className="pt-nav-link"><span>{n.label}</span> <span className="pt-nav-carat">&#9662;</span></button>
                <div className="pt-dd">
                  {n.cols.map((c, j) => (
                    <div key={j} className="pt-dd-col">
                      <h4>{c.h}</h4>
                      {c.items.map(renderItem)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-nav-cta">
            <button type="button" className="pt-launch" onClick={() => open('assistant')}>
              <span className="pt-live"/><span>{t('Open the Tool', 'टूल खोलें')} &rarr;</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="pt-main">
        {/* 4. HERO CAROUSEL */}
        <section className="pt-hero">
          <div className="pt-wrap pt-hero-wrap">
            <div className="pt-stage">
              <div className="pt-peek" aria-hidden="true">
                <div className="pt-peek-card">
                  <Emblem size={64}/>
                  <div className="pt-peek-title">भूमि विकास सहायक</div>
                  <div className="pt-peek-sub">AeroNerds · Bhopal</div>
                </div>
              </div>

              <div className="pt-banner" role="region" aria-roledescription="carousel" aria-label={t('Highlights', 'मुख्य बातें')}>
                <div className="pt-ribbon pt-ribbon-top" aria-hidden="true"/>
                <div className="pt-ribbon pt-ribbon-bottom" aria-hidden="true"/>

                {slide === 0 && (
                  <div className="pt-slide">
                    <div className="pt-slide-copy">
                      <div className="pt-slide-title"><span className="a">भूमि विकास</span> <span className="b">सहायक</span></div>
                      <div className="pt-slide-sub">{t('Ask the Bhopal building rulebook and get an answer you can trust', 'भोपाल की भवन नियमावली से पूछिए और भरोसेमंद उत्तर पाइए')}</div>
                      <div className="pt-slide-desc">{t('For the clerk at the building-permission counter. Every answer carries the rule number and the rule text.', 'भवन अनुमति काउंटर के क्लर्क के लिए। हर उत्तर में नियम संख्या और नियम पाठ।')}</div>
                      <div className="pt-slide-chips">
                        <span><I d={ICON.scale} size={14}/>{t('Setbacks', 'सेटबैक')}</span>
                        <span><I d={ICON.calc} size={14}/>{t('Fees', 'शुल्क')}</span>
                        <span><I d={ICON.book} size={14}/>{t('FAR', 'FAR')}</span>
                        <span><I d={ICON.check} size={14}/>{t('Lifts', 'लिफ्ट')}</span>
                      </div>
                    </div>
                    <div className="pt-slide-art"><PlotDiagram t={t}/></div>
                  </div>
                )}
                {slide === 1 && (
                  <div className="pt-slide">
                    <div className="pt-slide-copy">
                      <div className="pt-slide-title"><span className="a">{t('Counter', 'काउंटर')}</span> <span className="b">{t('Calculator', 'कैलकुलेटर')}</span></div>
                      <div className="pt-slide-sub">{t('Setbacks, fee and FAR calculated from the rule tables, in code', 'सेटबैक, शुल्क और FAR की गणना नियम तालिकाओं से, कोड में')}</div>
                      <div className="pt-slide-desc">{t('Example: 200 sq m residential plot, 9 m road, height up to 12.5 m.', 'उदाहरण: 200 वर्ग मी. आवासीय भूखंड, 9 मी. सड़क, ऊंचाई 12.5 मी. तक।')}</div>
                    </div>
                    <div className="pt-slide-art">
                      <table className="pt-mini-table">
                        <tbody>
                          <tr><td>{t('Front open space', 'आगे का खुला स्थान')}</td><td>3.0 m</td><td>56(1)(a)</td></tr>
                          <tr><td>{t('Rear open space', 'पीछे का खुला स्थान')}</td><td>2.5 m</td><td>56(2)(a)</td></tr>
                          <tr><td>{t('Permission fee (est. 250 sq m built-up)', 'अनुमति शुल्क (अनु. 250 वर्ग मी. निर्मित)')}</td><td>₹3,250</td><td>21(2)(ii), 21(3)(b)</td></tr>
                          <tr><td>{t('Max floor area, FAR 1.25', 'अधिकतम फर्श क्षेत्र, FAR 1.25')}</td><td>250 sq m</td><td>61</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {slide === 2 && (
                  <div className="pt-slide">
                    <div className="pt-slide-copy">
                      <div className="pt-slide-title"><span className="a">{t('Notice', 'सूचना')}</span> <span className="b">28.08.2026</span></div>
                      <div className="pt-slide-sub">{t('Amendment to Rule 2(5)(c)', 'नियम 2(5)(ग) में संशोधन')}</div>
                      <div className="pt-slide-desc">{t('Plots up to 500 sq m that conform to the Development Plan no longer need a separate development permission before building sanction. The consolidated rulebook (6 March 2025) does not include this; the service applies it.', 'विकास योजना के अनुरूप 500 वर्ग मीटर तक के भूखंडों को भवन स्वीकृति से पहले अलग विकास अनुमति की आवश्यकता नहीं। समेकित नियमावली (6 मार्च 2025) में यह शामिल नहीं; सेवा इसे लागू करती है।')}</div>
                    </div>
                    <div className="pt-slide-art pt-slide-notice"><I d={ICON.bell} size={64} stroke={1.5}/></div>
                  </div>
                )}
              </div>

              <div className="pt-peek" aria-hidden="true">
                <div className="pt-peek-poster">
                  <div className="pt-poster-ico"><I d={ICON.calc} size={28}/></div>
                  <div className="pt-poster-title">{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</div>
                  <div className="pt-poster-sub">{t('Rules 21, 56, 61, 83', 'नियम 21, 56, 61, 83')}</div>
                  <button type="button" className="pt-poster-cta" onClick={() => open('calculator')}>{t('Open', 'खोलें')} &rarr;</button>
                </div>
              </div>
            </div>

            <div className="pt-dots" aria-label={t('Carousel pagination', 'कैरोसेल')}>
              {[0, 1, 2].map(i => <button key={i} type="button" className={`pt-dot ${slide === i ? 'active' : ''}`} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)}/>)}
              <button type="button" className="pt-pause" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play' : 'Pause'}><I d={paused ? ICON.play : ICON.pause} size={10}/></button>
            </div>
          </div>
        </section>

        {/* 5. ACCESS SERVICES */}
        <section className="pt-services" id="pt-services">
          <div className="pt-wrap">
            <div className="pt-services-card">
              <div className="pt-services-top">
                <div>
                  <h2 className="pt-services-title">{t('Access Bhumi Vikas Sahayak Services', 'भूमि विकास सहायक सेवाएं')}</h2>
                  <p>{t('Select a service for the building-permission counter', 'भवन अनुमति काउंटर के लिए सेवा चुनें')}</p>
                </div>
                <button type="button" className="pt-btn-all" onClick={() => open('assistant')}><span>{t('Open the Tool', 'टूल खोलें')}</span><I d={ICON.arrow} size={14} stroke={2.5}/></button>
              </div>

              <div className="pt-grid4">
                <button type="button" className="pt-action" onClick={() => open('assistant')}>
                  <div className="pt-action-ico"><I d={ICON.search} size={22}/></div>
                  <div className="pt-action-info"><h3>{t('Rules Assistant', 'नियम सहायक')}</h3><p>{t('Ask in English, Hindi or Hinglish; get the rule number and source text', 'हिन्दी, अंग्रेज़ी या हिंग्लिश में पूछें; नियम संख्या और स्रोत पाठ पाएं')}</p></div>
                </button>
                <button type="button" className="pt-action" onClick={() => open('calculator')}>
                  <div className="pt-action-ico"><I d={ICON.calc} size={22}/></div>
                  <div className="pt-action-info"><h3>{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</h3><span className="pt-fee-badge">{t('Rule 21 fee', 'नियम 21 शुल्क')}</span><p>{t('Front and rear open space, permission fee, FAR and lift requirement', 'आगे-पीछे का खुला स्थान, अनुमति शुल्क, FAR और लिफ्ट')}</p></div>
                </button>
                <button type="button" className="pt-action" onClick={() => open('assistant')}>
                  <div className="pt-action-ico"><I d={ICON.print} size={22}/></div>
                  <div className="pt-action-info"><h3>{t('Citizen Guidance Slip', 'नागरिक मार्गदर्शन पर्ची')}</h3><p>{t('Print the answer with its rule reference for the citizen to take away', 'उत्तर को नियम संदर्भ सहित पर्ची के रूप में प्रिंट करें')}</p></div>
                </button>
                <button type="button" className="pt-action" onClick={() => go('pt-updates')}>
                  <div className="pt-action-ico"><I d={ICON.bell} size={22}/></div>
                  <div className="pt-action-info"><h3>{t('Latest Updates', 'नवीनतम अपडेट')}</h3><p>{t('Amendments applied to answers, including 28 August 2026', 'उत्तरों में लागू संशोधन, 28 अगस्त 2026 सहित')}</p></div>
                </button>
              </div>

              <div className="pt-grid3">
                <div className="pt-wide">
                  <h3>{t('Documents for building permission', 'भवन अनुमति के लिए दस्तावेज़')}</h3>
                  <p>{t('Application form, key plan, site plan, building plans, ownership proof, parking plan, supervision certificate (Rules 14 and 16)', 'आवेदन पत्र, की-प्लान, साइट प्लान, भवन नक्शे, स्वामित्व प्रमाण, पार्किंग योजना, पर्यवेक्षण प्रमाणपत्र (नियम 14 और 16)')}</p>
                  <button type="button" className="pt-wide-link" onClick={() => onAsk(lang === 'hi' ? FAQ[3].hi : FAQ[3].en)}>{t('Ask for the full list', 'पूरी सूची पूछें')} &rarr;</button>
                </div>
                <div className="pt-wide">
                  <h3>{t('Official rulebook', 'आधिकारिक नियमावली')}</h3>
                  <p>{t('M.P. Bhumi Vikas Rules, 2012, consolidated up to 6 March 2025, published by the Town and Country Planning Department, Government of Madhya Pradesh', 'म.प्र. भूमि विकास नियम, 2012, 6 मार्च 2025 तक समेकित, नगर तथा ग्राम निवेश विभाग, मध्यप्रदेश शासन द्वारा प्रकाशित')}</p>
                  <div className="pt-wide-links">
                    <a className="pt-wide-link" href={RULEBOOK_EN} target="_blank" rel="noopener noreferrer">English PDF &rarr;</a>
                    <a className="pt-wide-link" href={RULEBOOK_HI} target="_blank" rel="noopener noreferrer">हिन्दी PDF &rarr;</a>
                  </div>
                </div>
                <div className="pt-wide pt-wide-help">
                  <div className="pt-whc-top">
                    <h3>{t('Not in the rules?', 'नियमों में नहीं?')}</h3>
                    <div className="pt-whc-mark"><I d={ICON.check} size={26}/></div>
                  </div>
                  <p>{t('When the rules are silent, the assistant says "Not found" instead of inventing a rule. The clerk decides.', 'नियम मौन हों तो सहायक नियम गढ़ने के बजाय "नहीं मिला" बताता है। निर्णय क्लर्क का।')}</p>
                  <button type="button" className="pt-wide-link" onClick={() => go('pt-faq')}>{t('Read how it works', 'जानें कैसे काम करता है')} &rarr;</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. ABOUT + UPDATES */}
        <section className="pt-section pt-about-updates" id="pt-about">
          <div className="pt-wrap pt-about-grid">
            <div className="pt-card">
              <h2>{t('About the Service · Bhumi Vikas Sahayak', 'सेवा के बारे में · भूमि विकास सहायक')}</h2>
              <div className="pt-about-frame"><PlotDiagram t={t}/></div>
              <p className="pt-legal">
                {t(
                  'Every house, shop or additional floor built in Bhopal must comply with the Madhya Pradesh Bhumi Vikas Rules, 2012: 108 pages and 105 numbered rules, with fees, open spaces and floor-area limits spread across tables in different parts. This service is built by Team AeroNerds for the clerk at the Bhopal Municipal Corporation building-permission counter. It locates the relevant rule, answers in the language of the question, and shows the rule number and the rule text so the citizen can be shown the source. Table figures are calculated in code, not estimated by the language model.',
                  'भोपाल में बनने वाले हर मकान, दुकान या अतिरिक्त मंज़िल को मध्यप्रदेश भूमि विकास नियम, 2012 का पालन करना होता है: 108 पृष्ठ और 105 क्रमांकित नियम, जिनमें शुल्क, खुले स्थान और फर्श क्षेत्र की सीमाएं अलग-अलग भागों की तालिकाओं में हैं। यह सेवा टीम AeroNerds ने भोपाल नगर पालिका निगम के भवन अनुमति काउंटर के क्लर्क के लिए बनाई है। यह संबंधित नियम खोजती है, प्रश्न की भाषा में उत्तर देती है, और नियम संख्या तथा नियम पाठ दिखाती है ताकि नागरिक को स्रोत दिखाया जा सके। तालिका के आंकड़े कोड में गणना किए जाते हैं, भाषा मॉडल द्वारा अनुमानित नहीं।'
                )}
              </p>
              <button type="button" className="pt-btn-dark" onClick={() => go('pt-how')}>{t('Know More', 'और जानें')} &rarr;</button>
            </div>

            <div className="pt-card" id="pt-updates">
              <div className="pt-updates-head">
                <h2>{t('Updates', 'अपडेट')}</h2>
                <div className="pt-tabs">
                  <button type="button" className={`pt-tab ${tab === 'rules' ? 'active' : ''}`} onClick={() => setTab('rules')}>{t('Rule changes', 'नियम परिवर्तन')} <span className="pt-count">{RULE_UPDATES.length}</span></button>
                  <button type="button" className={`pt-tab ${tab === 'clerk' ? 'active' : ''}`} onClick={() => setTab('clerk')}>{t('Clerk-recorded amendments', 'क्लर्क द्वारा दर्ज संशोधन')} <span className="pt-count">{updates.length}</span></button>
                </div>
              </div>
              <div className="pt-updates-list">
                {tab === 'rules' && RULE_UPDATES.map((u, i) => (
                  <article key={i} className="pt-update">
                    <div className="pt-update-date"><I d={ICON.calendar} size={12}/> {u.date}</div>
                    <h4><a href={u.href} target="_blank" rel="noopener noreferrer">{lang === 'hi' ? u.hi : u.en}</a></h4>
                  </article>
                ))}
                {tab === 'clerk' && updates.length === 0 && (
                  <p className="pt-muted">{t('No amendments recorded by clerks yet. Signed-in clerks can add gazette amendments from the tool.', 'क्लर्क द्वारा अभी कोई संशोधन दर्ज नहीं। साइन-इन किए क्लर्क टूल से राजपत्र संशोधन जोड़ सकते हैं।')}</p>
                )}
                {tab === 'clerk' && updates.map(a => (
                  <article key={a.id} className="pt-update">
                    <div className="pt-update-date"><I d={ICON.calendar} size={12}/> {a.effective_date || '—'} · {t('Rule', 'नियम')} {a.rule_number}</div>
                    <h4>{a.title}</h4>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. DASHBOARD BANNER */}
        <section className="pt-section pt-dash">
          <div className="pt-wrap">
            <div className="pt-dash-banner">
              <div className="pt-dash-left">
                <div className="pt-dash-head">
                  <h2>{t('Rulebook coverage', 'नियमावली कवरेज')}</h2>
                  <p>{t('What the service indexes and answers from', 'सेवा किस आधार पर उत्तर देती है')}</p>
                </div>
                <div className="pt-metrics">
                  <div className="pt-metric"><span className="pt-val">105</span><span className="pt-unit">+ 26-B</span><span className="pt-lbl">{t('Numbered rules indexed', 'क्रमांकित नियम सूचीबद्ध')}</span></div>
                  <div className="pt-metric"><span className="pt-val">108</span><span className="pt-unit">{t('pages', 'पृष्ठ')}</span><span className="pt-lbl">{t('Official English rulebook', 'आधिकारिक अंग्रेज़ी नियमावली')}</span></div>
                  <div className="pt-metric"><span className="pt-val">17</span><span className="pt-unit">{t('questions', 'प्रश्न')}</span><span className="pt-lbl">{t('Official sample set built in', 'आधिकारिक नमूना प्रश्न शामिल')}</span></div>
                  <div className="pt-metric"><span className="pt-val">3</span><span className="pt-unit">{t('languages', 'भाषाएं')}</span><span className="pt-lbl">{t('English, Hindi, Hinglish', 'अंग्रेज़ी, हिन्दी, हिंग्लिश')}</span></div>
                </div>
              </div>
              <div className="pt-dash-right">
                <button type="button" className="pt-btn-visit" onClick={() => open('assistant')}>{t('Open Rules Assistant', 'नियम सहायक खोलें')} &rarr;</button>
              </div>
            </div>
            <div className="pt-note">
              <p>{t('Answers are based on the rules consolidated up to 6 March 2025 and apply the amendment of 28 August 2026. The service uses public data only, is not connected to any government system and stores no personal data. Answers are not legal advice.', 'उत्तर 6 मार्च 2025 तक समेकित नियमों पर आधारित हैं और 28 अगस्त 2026 का संशोधन लागू करते हैं। सेवा केवल सार्वजनिक डेटा का उपयोग करती है, किसी सरकारी प्रणाली से जुड़ी नहीं है और कोई व्यक्तिगत डेटा संग्रहीत नहीं करती। उत्तर कानूनी सलाह नहीं हैं।')}</p>
            </div>
          </div>
        </section>

        {/* 8. HOW IT WORKS + OPEN SOURCE BANNER */}
        <section className="pt-section pt-eco" id="pt-how">
          <div className="pt-wrap">
            <div className="pt-section-head pt-center">
              <h2>{t('How an answer is produced', 'उत्तर कैसे तैयार होता है')}</h2>
              <p>{t('Retrieval, grounded answer, and calculation in code', 'खोज, नियम-आधारित उत्तर, और कोड में गणना')}</p>
            </div>
            <div className="pt-eco-grid">
              <div className="pt-eco">
                <div className="pt-eco-ico"><I d={ICON.search} size={24}/></div>
                <h3>{t('1. Find the rules', '1. नियम खोजें')}</h3>
                <p>{t('The question is matched against the text of all 105 rules and the most relevant rules are selected.', 'प्रश्न का मिलान सभी 105 नियमों के पाठ से किया जाता है और सबसे संबंधित नियम चुने जाते हैं।')}</p>
              </div>
              <div className="pt-eco">
                <div className="pt-eco-ico"><I d={ICON.file} size={24}/></div>
                <h3>{t('2. Answer from the text', '2. पाठ से उत्तर')}</h3>
                <p>{t('Only the selected rule text is used. The answer must cite the rule number; if the text does not contain the answer, the service reports "Not found".', 'केवल चुने गए नियम पाठ का उपयोग होता है। उत्तर में नियम संख्या अनिवार्य है; यदि पाठ में उत्तर नहीं है, तो "नहीं मिला" बताया जाता है।')}</p>
              </div>
              <div className="pt-eco">
                <div className="pt-eco-ico"><I d={ICON.calc} size={24}/></div>
                <h3>{t('3. Numbers in code', '3. आंकड़े कोड में')}</h3>
                <p>{t('Fee and open-space figures come from the Counter Calculator, which implements the Rule 21 and Rule 56 tables directly.', 'शुल्क और खुले स्थान के आंकड़े काउंटर कैलकुलेटर से आते हैं, जो नियम 21 और 56 की तालिकाएं सीधे लागू करता है।')}</p>
              </div>
            </div>

            <div className="pt-build">
              <div className="pt-build-left">
                <h3>{t('Open source, offered to the Government of Madhya Pradesh', 'ओपन सोर्स, मध्यप्रदेश शासन को प्रस्तावित')}</h3>
                <p>{t('Released under the MIT licence through MPSeDC. Built in one day at Claude Impact Lab × Cerebras Café Compute, Bhopal, 11 October 2026.', 'MPSeDC के माध्यम से MIT लाइसेंस के अंतर्गत जारी। क्लॉड इम्पैक्ट लैब × सेरेब्रास कैफ़े कंप्यूट, भोपाल, 11 अक्टूबर 2026 में एक दिन में निर्मित।')}</p>
                <a className="pt-btn-partner" href={REPO_URL} target="_blank" rel="noopener noreferrer"><I d={ICON.code} size={14}/> {t('View source on GitHub', 'GitHub पर स्रोत देखें')} &rarr;</a>
              </div>
              <div className="pt-build-right"><Emblem size={60}/></div>
            </div>
          </div>
        </section>

        {/* 9. HAVE DOUBTS */}
        <section className="pt-section pt-faq" id="pt-faq">
          <div className="pt-wrap">
            <h2 className="pt-doubts-h">{t('Have Doubts?', 'कोई संदेह?')}</h2>
            <div className="pt-doubts-grid">
              <div>
                <div className="pt-col-head"><h3>{t('Frequently asked at the counter', 'काउंटर पर अक्सर पूछे जाने वाले प्रश्न')}</h3><button type="button" className="pt-view-all" onClick={() => open('assistant')}>{t('Ask your own', 'अपना प्रश्न पूछें')} &rarr;</button></div>
                <div className="pt-qlist">
                  {FAQ.map((f, i) => (
                    <button key={i} type="button" className="pt-qcard" onClick={() => onAsk(lang === 'hi' ? f.hi : f.en)}>
                      <span className="pt-qthumb"><I d={ICON.chat} size={18}/></span>
                      <span className="pt-qtitle">{lang === 'hi' ? f.hi : f.en}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="pt-col-head"><h3>{t('Have Questions?', 'कोई प्रश्न?')}</h3><button type="button" className="pt-view-all" onClick={() => go('pt-disclaimer')}>{t('Disclaimer', 'अस्वीकरण')} &rarr;</button></div>
                <div className="pt-acc">
                  <details open>
                    <summary>{t('Which rulebook does the service use?', 'सेवा कौन सी नियमावली उपयोग करती है?')}</summary>
                    <div>{t('The Madhya Pradesh Bhumi Vikas Rules, 2012, in the consolidated edition published by the Town and Country Planning Department up to 6 March 2025, plus the amendment of 28 August 2026 to Rule 2(5)(c).', 'मध्यप्रदेश भूमि विकास नियम, 2012, नगर तथा ग्राम निवेश विभाग द्वारा 6 मार्च 2025 तक प्रकाशित समेकित संस्करण, तथा नियम 2(5)(ग) का 28 अगस्त 2026 का संशोधन।')}</div>
                  </details>
                  <details>
                    <summary>{t('What happens when the rules do not cover a question?', 'जब नियमों में प्रश्न का उत्तर न हो तो क्या होता है?')}</summary>
                    <div>{t('The assistant replies "Not found in the rules" and does not invent a rule. For example, property tax payment and land market rates are outside these rules.', 'सहायक "नियमों में नहीं मिला" कहता है और नियम नहीं गढ़ता। उदाहरण के लिए संपत्ति कर भुगतान और भूमि का बाजार भाव इन नियमों से बाहर हैं।')}</div>
                  </details>
                  <details>
                    <summary>{t('Can the service decide a building permission?', 'क्या सेवा भवन अनुमति का निर्णय कर सकती है?')}</summary>
                    <div>{t('No. It points to the rule; the decision rests with the clerk and the competent authority. Figures should be verified against the official PDF before acting on them.', 'नहीं। यह नियम की ओर संकेत करती है; निर्णय क्लर्क और सक्षम प्राधिकारी का है। कार्रवाई से पहले आंकड़ों का आधिकारिक PDF से मिलान करें।')}</div>
                  </details>
                  <details>
                    <summary>{t('What does the Counter Calculator not cover?', 'काउंटर कैलकुलेटर क्या कवर नहीं करता?')}</summary>
                    <div>{t('Rule 56 open-space tables apply to residential buildings up to 12.5 m; taller or non-residential buildings are referred to Rule 42 or Rule 57. Fees above 30 m height (high-rise) are not computed. The rules fix FAR, not a floor count.', 'नियम 56 की तालिकाएं 12.5 मी. तक के आवासीय भवनों पर लागू हैं; ऊंचे या गैर-आवासीय भवनों के लिए नियम 42 या 57 देखें। 30 मी. से ऊंचे (हाई-राइज़) भवनों का शुल्क नहीं निकाला जाता। नियम FAR तय करते हैं, मंज़िलों की संख्या नहीं।')}</div>
                  </details>
                  <details>
                    <summary>{t('Is any personal data stored?', 'क्या कोई व्यक्तिगत डेटा संग्रहीत होता है?')}</summary>
                    <div>{t('No. The service uses public data only and is not connected to any government system. Clerk sign-in is used only to record gazette amendments.', 'नहीं। सेवा केवल सार्वजनिक डेटा का उपयोग करती है और किसी सरकारी प्रणाली से जुड़ी नहीं है। क्लर्क साइन-इन केवल राजपत्र संशोधन दर्ज करने के लिए है।')}</div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="pt-footer" id="pt-disclaimer">
        <div className="pt-wrap">
          <div className="pt-dir-grid">
            <div className="pt-dir-col">
              <h4>{t('About', 'परिचय')}</h4>
              <button type="button" onClick={() => go('pt-about')}>{t('About the service', 'सेवा के बारे में')}</button>
              <button type="button" onClick={() => go('pt-how')}>{t('How an answer is produced', 'उत्तर कैसे तैयार होता है')}</button>
              <button type="button" onClick={() => go('pt-faq')}>{t('Questions', 'प्रश्न')}</button>
            </div>
            <div className="pt-dir-col">
              <h4>{t('Services', 'सेवाएं')}</h4>
              <button type="button" onClick={() => open('assistant')}>{t('Rules Assistant', 'नियम सहायक')}</button>
              <button type="button" onClick={() => open('calculator')}>{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</button>
              <button type="button" onClick={() => open('assistant')}>{t('Citizen Guidance Slip', 'नागरिक मार्गदर्शन पर्ची')}</button>
              <button type="button" onClick={() => open('assistant')}>{t('Clerk login', 'क्लर्क लॉगिन')}</button>
            </div>
            <div className="pt-dir-col">
              <h4>{t('Rulebook', 'नियमावली')}</h4>
              <a href={RULEBOOK_EN} target="_blank" rel="noopener noreferrer">{t('English PDF (T&CP Dept.)', 'अंग्रेज़ी PDF (नगर तथा ग्राम निवेश)')}</a>
              <a href={RULEBOOK_HI} target="_blank" rel="noopener noreferrer">{t('Hindi PDF (T&CP Dept.)', 'हिन्दी PDF (नगर तथा ग्राम निवेश)')}</a>
              <a href={AMENDMENT_URL} target="_blank" rel="noopener noreferrer">{t('Amendment of 28 Aug 2026', '28 अगस्त 2026 का संशोधन')}</a>
            </div>
            <div className="pt-dir-col">
              <h4>{t('Updates', 'अपडेट')}</h4>
              <button type="button" onClick={() => go('pt-updates')}>{t('Rule changes', 'नियम परिवर्तन')}</button>
              <button type="button" onClick={() => go('pt-updates')}>{t('Clerk-recorded amendments', 'क्लर्क द्वारा दर्ज संशोधन')}</button>
            </div>
            <div className="pt-dir-col">
              <h4>{t('Project', 'परियोजना')}</h4>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t('Source code (GitHub)', 'स्रोत कोड (GitHub)')}</a>
              <a href={PROBLEM_URL} target="_blank" rel="noopener noreferrer">{t('Problem statement', 'समस्या विवरण')}</a>
              <button type="button" onClick={() => go('pt-disclaimer')}>{t('Disclaimer', 'अस्वीकरण')}</button>
            </div>
          </div>

          <div className="pt-divider"/>

          <div className="pt-office-grid">
            <div className="pt-office">
              <h4>{t('Built for', 'किसके लिए')}</h4>
              <p>{t('Building Permission Counter, Bhopal Municipal Corporation', 'भवन अनुमति काउंटर, भोपाल नगर पालिका निगम')}</p>
              <p>{t('One user, one workflow: the clerk answering a citizen at the counter.', 'एक उपयोगकर्ता, एक कार्यप्रवाह: काउंटर पर नागरिक को उत्तर देता क्लर्क।')}</p>
            </div>
            <div className="pt-office">
              <h4>{t('Source of rules', 'नियमों का स्रोत')}</h4>
              <p>{t('Town and Country Planning Department, Government of Madhya Pradesh', 'नगर तथा ग्राम निवेश विभाग, मध्यप्रदेश शासन')}</p>
              <p>{t('M.P. Bhumi Vikas Rules, 2012 · consolidated up to 6 March 2025', 'म.प्र. भूमि विकास नियम, 2012 · 6 मार्च 2025 तक समेकित')}</p>
            </div>
            <div className="pt-office">
              <h4>{t('Developed by', 'विकासकर्ता')}</h4>
              <p><strong>Team AeroNerds</strong></p>
              <p>{t('Claude Impact Lab × Cerebras Café Compute, Bhopal · 11 October 2026 · Track 1', 'क्लॉड इम्पैक्ट लैब × सेरेब्रास कैफ़े कंप्यूट, भोपाल · 11 अक्टूबर 2026 · ट्रैक 1')}</p>
            </div>
          </div>

          <div className="pt-disclaimer">
            <i>&#9888;</i>
            <p>
              <b>{t('Disclaimer.', 'अस्वीकरण।')}</b> {t(
                'Bhumi Vikas Sahayak is a prototype built at a one-day hackathon and offered to the Government of Madhya Pradesh through MPSeDC. It is not an official website of, and is not endorsed by, the Government of India, the Government of Madhya Pradesh or the Bhopal Municipal Corporation. It does not grant, refuse or alter any permission. Answers point to the rule text for a human to verify; the clerk and the competent authority decide. The rulebook remains the property of its publisher.',
                'भूमि विकास सहायक एक दिवसीय हैकाथॉन में बना प्रोटोटाइप है जो MPSeDC के माध्यम से मध्यप्रदेश शासन को प्रस्तावित है। यह भारत सरकार, मध्यप्रदेश शासन या भोपाल नगर पालिका निगम की आधिकारिक वेबसाइट नहीं है और न ही उनके द्वारा अनुमोदित है। यह कोई अनुमति प्रदान, अस्वीकार या परिवर्तित नहीं करता। उत्तर नियम पाठ की ओर संकेत करते हैं जिसे मनुष्य द्वारा सत्यापित किया जाना है; निर्णय क्लर्क और सक्षम प्राधिकारी का है। नियमावली उसके प्रकाशक की संपत्ति है।'
              )}
            </p>
          </div>

          <div className="pt-meta">
            <p>{t('Content based on the M.P. Bhumi Vikas Rules, 2012 (consolidated up to 6 March 2025) with the amendment of 28 August 2026. Released under the MIT licence.', 'सामग्री म.प्र. भूमि विकास नियम, 2012 (6 मार्च 2025 तक समेकित) तथा 28 अगस्त 2026 के संशोधन पर आधारित। MIT लाइसेंस के अंतर्गत जारी।')}</p>
            <p className="pt-meta-sub">{t('Best viewed in current versions of Chrome, Edge or Firefox.', 'Chrome, Edge या Firefox के वर्तमान संस्करणों में सर्वोत्तम।')}</p>
          </div>
        </div>
      </footer>

      {/* 11. FLOATING ASK BUTTON */}
      <button type="button" className="pt-float" onClick={() => open('assistant')} title={t('Ask the rules', 'नियम पूछें')}>
        <span className="pt-float-circle"><span className="pt-float-ring"/><I d={ICON.chat} size={28}/></span>
        <span className="pt-float-lbl">{t('Ask the Rules', 'नियम पूछें')}</span>
      </button>
    </div>
  )
}
