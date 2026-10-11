import { useEffect, useRef, useState } from 'react'
import './Landing.css'

const Emblem = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
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

const Icon = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal()
  return (
    <Tag ref={ref} className={`lp-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing({ lang, setLang, t, onOpen, onAsk }) {
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const chips = lang === 'hi'
    ? ['बिल्डिंग परमिशन की फीस कितनी है?', '9 मीटर सड़क पर आगे कितनी जगह छोड़ें?', 'फार्म हाउस के लिए न्यूनतम प्लॉट?']
    : ['Front setback for a 9 m road?', 'Fee for building permission?', 'Lift needed above what height?']

  function submit(e) {
    e.preventDefault()
    onAsk(q.trim())
  }

  return (
    <div className="lp">
      <div className="lp-tricolor" />

      <header className={`lp-nav ${scrolled ? 'lp-nav-solid' : ''}`}>
        <div className="lp-nav-inner">
          <button className="lp-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Bhumi Vikas Sahayak">
            <Emblem size={38} />
            <span className="lp-brand-text">
              <span className="lp-brand-hi">भूमि विकास सहायक</span>
              <span className="lp-brand-en">Bhumi Vikas Sahayak</span>
            </span>
          </button>
          <nav className="lp-nav-links" aria-label="Sections">
            <button onClick={() => scrollToId('how')}>{t('How it works', 'कैसे काम करता है')}</button>
            <button onClick={() => scrollToId('features')}>{t('Features', 'सुविधाएं')}</button>
            <button onClick={() => scrollToId('trust')}>{t('Trust', 'भरोसा')}</button>
          </nav>
          <div className="lp-nav-actions">
            <button className="lp-lang" onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))} aria-label="Toggle language">
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button className="lp-btn lp-btn-saffron lp-btn-sm" onClick={() => onOpen()}>
              {t('Open the tool', 'टूल खोलें')}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-bg" aria-hidden="true">
          <span className="lp-orb lp-orb-a" />
          <span className="lp-orb lp-orb-b" />
          <span className="lp-grid" />
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">
              <span className="lp-live" />
              {t('Built for the BMC building-permission counter', 'भोपाल नगर निगम भवन अनुमति काउंटर के लिए')}
            </div>
            <h1 className="lp-h1">
              {t('Ask the building rulebook.', 'भवन नियमावली से पूछिए।')}
              <span className="lp-h1-accent">{t('Get the rule, not a guess.', 'अनुमान नहीं, नियम पाइए।')}</span>
            </h1>
            <p className="lp-lede">
              {t(
                'A citizen at the counter asks about setbacks, fees or lifts. The clerk gets a short answer in English or Hindi, with the rule number and the exact rule text to show them.',
                'काउंटर पर नागरिक सेटबैक, फीस या लिफ्ट के बारे में पूछता है। क्लर्क को हिन्दी या अंग्रेज़ी में छोटा उत्तर मिलता है, नियम संख्या और मूल नियम पाठ के साथ।'
              )}
            </p>

            <form className="lp-ask" onSubmit={submit}>
              <svg className="lp-ask-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t('e.g. My plot is 200 sq m on a 9 m road. Front setback?', 'जैसे: 200 वर्ग मीटर प्लॉट, 9 मीटर सड़क। आगे कितनी जगह छोड़ें?')}
                aria-label={t('Your question', 'आपका प्रश्न')}
                lang={lang === 'hi' ? 'hi' : 'en'}
                autoComplete="off"
              />
              <button type="submit" className="lp-btn lp-btn-saffron">{t('Ask', 'पूछें')}</button>
            </form>

            <div className="lp-chips">
              {chips.map(c => (
                <button key={c} className="lp-chip" onClick={() => onAsk(c)}>{c}</button>
              ))}
            </div>

            <div className="lp-hero-ctas">
              <button className="lp-btn lp-btn-ghost" onClick={() => onOpen('calculator')}>
                <Icon><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></Icon>
                {t('Counter Calculator', 'काउंटर कैलकुलेटर')}
              </button>
              <span className="lp-note">{t('Free · open source · no personal data', 'निःशुल्क · ओपन सोर्स · कोई व्यक्तिगत डेटा नहीं')}</span>
            </div>
          </div>

          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-card lp-card-main">
              <div className="lp-card-top">
                <span className="lp-dot lp-dot-r" /><span className="lp-dot lp-dot-y" /><span className="lp-dot lp-dot-g" />
                <span className="lp-card-tag">{t('Example answer', 'उदाहरण उत्तर')}</span>
              </div>
              <div className="lp-q">{t('My plot is 200 sq m on a 9 m road. How much gap do I leave at the front?', 'मेरा प्लॉट 200 वर्ग मीटर, सड़क 9 मीटर। आगे कितनी जगह छोड़नी होगी?')}</div>
              <div className="lp-a">
                <div className="lp-a-big">3.0 m</div>
                <div className="lp-a-text">{t('Minimum front open space for a street up to 9 m wide.', '9 मीटर तक चौड़ी सड़क के लिए आगे न्यूनतम खुला स्थान।')}</div>
              </div>
              <div className="lp-rule-row">
                <span className="lp-rule">Rule 56(1)(a)</span>
                <span className="lp-rule lp-rule-soft">{t('Residential · up to 12.5 m', 'आवासीय · 12.5 मी. तक')}</span>
              </div>
              <div className="lp-src">
                <div className="lp-src-label">{t('Source text', 'स्रोत पाठ')}</div>
                <div className="lp-src-row"><span>Up to 9.0 meters</span><b>3.0 meters</b></div>
                <div className="lp-src-row lp-dim"><span>More than 9.0 m and up to 12 m</span><b>3.6 meters</b></div>
              </div>
            </div>

            <div className="lp-card lp-card-float lp-float-a">
              <div className="lp-mini-label">{t('Rear open space', 'पीछे का खुला स्थान')}</div>
              <div className="lp-mini-val">2.5 m</div>
              <div className="lp-mini-rule">Rule 56(2)(a)</div>
            </div>
            <div className="lp-card lp-card-float lp-float-b">
              <div className="lp-mini-label">{t('Permission fee (est.)', 'अनुमति शुल्क (अनुमानित)')}</div>
              <div className="lp-mini-val">₹3,250</div>
              <div className="lp-mini-rule">Rule 21</div>
            </div>
            <div className="lp-card lp-card-float lp-float-c">
              <span className="lp-check">✓</span>
              {t('Not in the rules? It says so.', 'नियमों में नहीं? तो साफ़ बताता है।')}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats">
        <Reveal className="lp-stats-inner">
          <div className="lp-stat"><b>105</b><span>{t('numbered rules indexed', 'क्रमांकित नियम सूचीबद्ध')}</span></div>
          <div className="lp-stat"><b>108</b><span>{t('pages of the official rulebook', 'आधिकारिक नियमावली के पृष्ठ')}</span></div>
          <div className="lp-stat"><b>EN · हिं</b><span>{t('questions in either language', 'किसी भी भाषा में प्रश्न')}</span></div>
          <div className="lp-stat"><b>28 Aug 2026</b><span>{t('amendment built in', 'संशोधन शामिल')}</span></div>
        </Reveal>
      </section>

      {/* PROBLEM */}
      <section className="lp-section lp-problem">
        <div className="lp-wrap lp-two">
          <Reveal>
            <div className="lp-kicker">{t('The problem', 'समस्या')}</div>
            <h2 className="lp-h2">{t('108 pages of rules. A queue at the counter.', '108 पृष्ठों के नियम। काउंटर पर कतार।')}</h2>
            <p className="lp-p">
              {t(
                'Fees, setbacks and floor-area limits sit in tables spread across the MP Bhumi Vikas Rules, 2012, and the rules keep being amended. Clerks answer the same questions all day, and a citizen who gets a wrong number pays fees before discovering the plan breaks a rule.',
                'फीस, सेटबैक और फ्लोर एरिया की सीमाएं एमपी भूमि विकास नियम, 2012 की अलग-अलग तालिकाओं में हैं, और नियम बार-बार संशोधित होते हैं। क्लर्क दिनभर वही प्रश्न सुनते हैं, और गलत संख्या मिलने पर नागरिक फीस भरने के बाद जान पाता है कि नक्शा नियम तोड़ रहा है।'
              )}
            </p>
          </Reveal>
          <Reveal delay={120} className="lp-quote">
            <div className="lp-quote-mark">“</div>
            <p>{t('My plot is 200 sq m on a 9 m road. How much gap do I leave at the front, how many floors can I build, and what fee do I pay?', 'मेरा प्लॉट 200 वर्ग मीटर का है और सड़क 9 मीटर चौड़ी है। आगे कितनी जगह छोड़ूं, कितनी मंज़िलें बना सकता हूं, और फीस कितनी लगेगी?')}</p>
            <span>{t('A typical question at the counter', 'काउंटर पर आम प्रश्न')}</span>
          </Reveal>
        </div>
      </section>

      {/* HOW */}
      <section className="lp-section" id="how">
        <div className="lp-wrap">
          <Reveal className="lp-center">
            <div className="lp-kicker">{t('How it works', 'कैसे काम करता है')}</div>
            <h2 className="lp-h2">{t('From question to rule in three steps', 'प्रश्न से नियम तक, तीन कदम')}</h2>
          </Reveal>
          <div className="lp-steps">
            {[
              { n: '1', icon: <Icon><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Icon>, ti: t('Ask in plain words', 'सरल भाषा में पूछें'), d: t('Type the citizen’s question in English, Hindi or Hinglish. No forms, no rule numbers needed.', 'नागरिक का प्रश्न हिन्दी, अंग्रेज़ी या हिंग्लिश में लिखें। किसी फॉर्म या नियम संख्या की ज़रूरत नहीं।') },
              { n: '2', icon: <Icon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Icon>, ti: t('It finds the right rules', 'सही नियम खोजता है'), d: t('The rulebook is searched and only the matching rules are read. Fee and setback maths is done in code, not guessed.', 'नियमावली में खोज कर केवल संबंधित नियम पढ़े जाते हैं। फीस और सेटबैक की गणना कोड से होती है, अनुमान से नहीं।') },
              { n: '3', icon: <Icon><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Icon>, ti: t('Answer with proof', 'प्रमाण सहित उत्तर'), d: t('A short answer in the same language, the rule number, and the exact text it came from, ready to show the citizen or print as a slip.', 'उसी भाषा में छोटा उत्तर, नियम संख्या और मूल पाठ। नागरिक को दिखाएं या पर्ची प्रिंट करें।') },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 110} className="lp-step">
                <div className="lp-step-top"><span className="lp-step-n">{s.n}</span><span className="lp-step-icon">{s.icon}</span></div>
                <h3>{s.ti}</h3>
                <p>{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section lp-features" id="features">
        <div className="lp-wrap">
          <Reveal className="lp-center">
            <div className="lp-kicker">{t('Features', 'सुविधाएं')}</div>
            <h2 className="lp-h2">{t('Everything the counter needs. Nothing it doesn’t.', 'काउंटर को जो चाहिए, बस वही।')}</h2>
          </Reveal>
          <div className="lp-feat-grid">
            {[
              { icon: <Icon><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></Icon>, ti: t('Rules Assistant', 'नियम सहायक'), d: t('Plain-language Q&A over all 105 rules, each answer citing its rule and showing the source text.', 'सभी 105 नियमों पर सरल भाषा में प्रश्नोत्तर, हर उत्तर में नियम संख्या और स्रोत पाठ।') },
              { icon: <Icon><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></Icon>, ti: t('Counter Calculator', 'काउंटर कैलकुलेटर'), d: t('Front and rear setbacks, permission fee, FAR and lift requirement from plot size, road width and height.', 'प्लॉट, सड़क की चौड़ाई और ऊंचाई से आगे-पीछे का खुला स्थान, अनुमति शुल्क, FAR और लिफ्ट।') },
              { icon: <Icon><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>, ti: t('Honest “not found”', 'ईमानदार “नहीं मिला”'), d: t('When the rules are silent, it says so clearly instead of inventing a rule. The tool points; the clerk decides.', 'नियम मौन हों तो साफ़ बताता है, नियम गढ़ता नहीं। टूल संकेत देता है, निर्णय क्लर्क का।') },
              { icon: <Icon><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>, ti: t('Version-aware', 'संस्करण की जानकारी'), d: t('Every answer names the 6 March 2025 consolidation. The 28 Aug 2026 amendment for plots up to 500 sq m is built in, and clerks can record new gazette amendments.', 'हर उत्तर 6 मार्च 2025 के संकलन का उल्लेख करता है। 500 वर्ग मीटर तक के भूखंडों का 28 अगस्त 2026 संशोधन शामिल है, और क्लर्क नए संशोधन दर्ज कर सकते हैं।') },
              { icon: <Icon><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></Icon>, ti: t('Hindi, English, Hinglish', 'हिन्दी, अंग्रेज़ी, हिंग्लिश'), d: t('Ask the way you speak. The answer comes back in the same language.', 'जैसे बोलते हैं वैसे पूछिए। उत्तर उसी भाषा में मिलता है।') },
              { icon: <Icon><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></Icon>, ti: t('Citizen guidance slip', 'नागरिक मार्गदर्शन पर्ची'), d: t('Print the answer with its rule reference as a slip the citizen takes home.', 'उत्तर को नियम संदर्भ सहित पर्ची के रूप में प्रिंट करें, नागरिक साथ ले जाए।') },
            ].map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 90} className="lp-feat">
                <span className="lp-feat-icon">{f.icon}</span>
                <h3>{f.ti}</h3>
                <p>{f.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="lp-section lp-trust" id="trust">
        <div className="lp-wrap lp-two">
          <Reveal>
            <div className="lp-kicker lp-kicker-light">{t('Trust', 'भरोसा')}</div>
            <h2 className="lp-h2 lp-h2-light">{t('It points to the rule. The clerk decides.', 'यह नियम बताता है। निर्णय क्लर्क का।')}</h2>
            <p className="lp-p lp-p-light">
              {t(
                'Built on public data only, with no connection to any government system and no personal data. Not legal advice: every answer carries the rule so it can be checked against the official PDF.',
                'केवल सार्वजनिक डेटा पर आधारित, किसी सरकारी प्रणाली से कोई संपर्क नहीं और कोई व्यक्तिगत डेटा नहीं। यह कानूनी सलाह नहीं है: हर उत्तर में नियम दिया है ताकि आधिकारिक PDF से मिलान हो सके।'
              )}
            </p>
          </Reveal>
          <Reveal delay={120} className="lp-trust-list">
            {[
              t('Source: MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025', 'स्रोत: एमपी भूमि विकास नियम 2012, 6 मार्च 2025 तक संकलित'),
              t('Amendment of 28 August 2026 to Rule 2(5)(c) included', 'नियम 2(5)(ग) का 28 अगस्त 2026 संशोधन शामिल'),
              t('Table numbers computed in code, not by the language model', 'तालिका की संख्याएं कोड से, भाषा मॉडल से नहीं'),
              t('Open source (MIT) and offered to the Government of Madhya Pradesh through MPSeDC', 'ओपन सोर्स (MIT), मध्यप्रदेश शासन को MPSeDC के माध्यम से प्रस्तावित'),
            ].map((x, i) => (
              <div key={i} className="lp-trust-item"><span className="lp-tick">✓</span>{x}</div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <Reveal className="lp-cta-inner">
          <h2>{t('Try it on your next citizen at the counter.', 'अगले नागरिक पर आज़माइए।')}</h2>
          <p>{t('No sign-up. Just ask.', 'साइन-अप नहीं। बस पूछिए।')}</p>
          <div className="lp-cta-btns">
            <button className="lp-btn lp-btn-saffron lp-btn-lg" onClick={() => onOpen()}>{t('Open the Rules Assistant', 'नियम सहायक खोलें')}</button>
            <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => onOpen('calculator')}>{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</button>
          </div>
        </Reveal>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand"><Emblem size={28} /><span>भूमि विकास सहायक · Bhumi Vikas Sahayak</span></div>
          <div className="lp-footer-note">
            {t('Claude Impact Lab × Cerebras Café Compute, Bhopal · Track 1 · Team AeroNerds', 'क्लॉड इम्पैक्ट लैब × सेरेब्रास कैफ़े कंप्यूट, भोपाल · ट्रैक 1 · टीम AeroNerds')}
          </div>
          <div className="lp-footer-note">{t('Not legal advice. The clerk decides.', 'यह कानूनी सलाह नहीं है। अंतिम निर्णय क्लर्क का है।')}</div>
        </div>
      </footer>
    </div>
  )
}
