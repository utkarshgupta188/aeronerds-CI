import { useState } from 'react'
import './Landing.css'

const RULEBOOK_EN = 'https://mptownplan.gov.in/NewsPDF/bvn06032025E.pdf'
const RULEBOOK_HI = 'https://mptownplan.gov.in/NewsPDF/bvn06032025H.pdf'
const AMENDMENT_URL = 'https://teamleaseregtech.com/updates/article/59469/government-of-madhya-pradesh-amendment-to-land-development-rules'
const REPO_URL = 'https://github.com/utkarshgupta188/aeronerds-CI'

const Emblem = ({ size = 56 }) => (
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

const FAQ = [
  { en: 'My house faces a 10 m wide street and will be 9 m tall. How much open space do I leave at the front?', hi: 'मेरा मकान 10 मीटर चौड़ी सड़क पर है और 9 मीटर ऊंचा होगा। आगे कितनी जगह खाली छोड़नी होगी?' },
  { en: 'What is the minimum rear open space for a 150 sq m residential plot?', hi: '150 वर्ग मीटर के आवासीय प्लॉट में पीछे कम से कम कितनी जगह छोड़नी होगी?' },
  { en: 'What is the fee for building permission for a residential house?', hi: 'बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?' },
  { en: 'My development permission was granted in 2023. How long does it stay valid, and how many times can I renew it?', hi: 'मेरी विकास अनुमति 2023 में मिली थी। यह कितने समय तक वैध है और कितनी बार नवीनीकृत हो सकती है?' },
  { en: 'Do I need separate development permission for a 300 sq m plot that matches the Development Plan?', hi: 'क्या विकास योजना के अनुरूप 300 वर्ग मीटर के प्लॉट के लिए अलग विकास अनुमति चाहिए?' },
  { en: 'What are the rules for lifts in a building taller than 15 m?', hi: '15 मीटर से ऊंची इमारत में लिफ्ट के क्या नियम हैं?' },
  { en: 'Who is allowed to sign and submit my building plans?', hi: 'मेरे भवन नक्शे पर हस्ताक्षर कर उसे जमा करने का अधिकार किसे है?' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing({ lang, setLang, t, onOpen, onAsk }) {
  const [q, setQ] = useState('')
  const [scale, setScale] = useState(1)

  const resize = d => setScale(s => (d === 0 ? 1 : Math.min(1.3, Math.max(0.85, +(s + d).toFixed(2)))))

  function submit(e) {
    e.preventDefault()
    if (q.trim()) onAsk(q.trim())
  }

  const navItems = [
    { label: t('Home', 'मुख्य पृष्ठ'), go: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: t('Rules Assistant', 'नियम सहायक'), go: () => onOpen('assistant') },
    { label: t('Counter Calculator', 'काउंटर कैलकुलेटर'), go: () => onOpen('calculator') },
    { label: t('About the Service', 'सेवा के बारे में'), go: () => scrollToId('gov-about') },
    { label: t('Services', 'सेवाएं'), go: () => scrollToId('gov-services') },
    { label: t('Disclaimer', 'अस्वीकरण'), go: () => scrollToId('gov-disclaimer') },
  ]

  return (
    <div className="gov" lang={lang === 'hi' ? 'hi' : 'en'} style={{ '--fs': `${15 * scale}px` }}>
      <a className="gov-skip" href="#gov-main">{t('Skip to main content', 'मुख्य सामग्री पर जाएं')}</a>

      <div className="gov-tricolor" aria-hidden="true" />

      <div className="gov-topbar">
        <div className="gov-container gov-topbar-inner">
          <div className="gov-topbar-left">
            <span>भोपाल नगर पालिका निगम</span>
            <span className="gov-topbar-sep" aria-hidden="true">|</span>
            <span>Bhopal Municipal Corporation</span>
          </div>
          <div className="gov-topbar-right">
            <div className="gov-fontsize" role="group" aria-label={t('Text size', 'अक्षर आकार')}>
              <button type="button" onClick={() => resize(-0.1)} aria-label={t('Decrease text size', 'अक्षर छोटे करें')}>A-</button>
              <button type="button" onClick={() => resize(0)} aria-label={t('Default text size', 'सामान्य अक्षर')}>A</button>
              <button type="button" onClick={() => resize(0.1)} aria-label={t('Increase text size', 'अक्षर बड़े करें')}>A+</button>
            </div>
            <div className="gov-langswitch" role="group" aria-label="Language">
              <button type="button" className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>हिन्दी</button>
              <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>English</button>
            </div>
          </div>
        </div>
      </div>

      <header className="gov-header">
        <div className="gov-container gov-header-inner">
          <div className="gov-brand">
            <Emblem />
            <div className="gov-brand-text">
              <div className="gov-brand-hi">भूमि विकास सहायक</div>
              <div className="gov-brand-en">Bhumi Vikas Sahayak</div>
              <div className="gov-brand-sub">{t('Building Permission Counter Assistant · Bhopal Municipal Corporation', 'भवन अनुमति काउंटर सहायक · भोपाल नगर पालिका निगम')}</div>
            </div>
          </div>
          <div className="gov-header-box">
            <div className="gov-header-box-title">{t('Rulebook in force', 'प्रभावी नियमावली')}</div>
            <div>{t('M.P. Bhumi Vikas Rules, 2012', 'म.प्र. भूमि विकास नियम, 2012')}</div>
            <div className="gov-muted">{t('Consolidated up to 06-03-2025', '06-03-2025 तक समेकित')}</div>
          </div>
        </div>
      </header>

      <nav className="gov-nav" aria-label={t('Main navigation', 'मुख्य नेविगेशन')}>
        <div className="gov-container">
          <ul>
            {navItems.map((n, i) => (
              <li key={i}><button type="button" onClick={n.go}>{n.label}</button></li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="gov-ticker">
        <div className="gov-container gov-ticker-inner">
          <span className="gov-ticker-label">{t('NOTICE', 'सूचना')}</span>
          <div className="gov-ticker-track">
            <p className="gov-ticker-text">
              {t(
                'Amendment dated 28 August 2026 to Rule 2(5)(c): plots up to 500 sq m that conform to the Development Plan no longer need a separate development permission before building sanction. The consolidated rulebook (6 March 2025) does not yet include this amendment; this service applies it.',
                '28 अगस्त 2026 का संशोधन, नियम 2(5)(ग): विकास योजना के अनुरूप 500 वर्ग मीटर तक के भूखंडों को भवन स्वीकृति से पहले अलग विकास अनुमति की आवश्यकता नहीं। समेकित नियमावली (6 मार्च 2025) में यह संशोधन अभी शामिल नहीं है; यह सेवा इसे लागू करती है।'
              )}
            </p>
          </div>
        </div>
      </div>

      <main id="gov-main" className="gov-container gov-main">
        <div className="gov-col-main">
          <section className="gov-panel">
            <h2 className="gov-panel-h">{t('Ask the Building Rules', 'भवन नियमों से पूछें')}</h2>
            <div className="gov-panel-b">
              <p className="gov-lead">
                {t(
                  'Type the question as the citizen asks it, in English, Hindi or Hinglish. The answer states the rule number and shows the rule text it was taken from. If the rules do not cover the question, the service says so.',
                  'प्रश्न वैसे ही लिखें जैसे नागरिक पूछता है, हिन्दी, अंग्रेज़ी या हिंग्लिश में। उत्तर में नियम संख्या और वह नियम पाठ दिखाया जाता है जिससे उत्तर लिया गया है। यदि नियमों में प्रश्न का उत्तर नहीं है, तो सेवा यह स्पष्ट बताती है।'
                )}
              </p>
              <form className="gov-ask" onSubmit={submit}>
                <label htmlFor="gov-q" className="gov-label">{t('Question', 'प्रश्न')}</label>
                <div className="gov-ask-row">
                  <input
                    id="gov-q"
                    type="text"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder={t('e.g. My plot is 200 sq m on a 9 m road. What is the front setback?', 'जैसे: मेरा प्लॉट 200 वर्ग मीटर का है, 9 मीटर सड़क है। आगे कितनी जगह छोड़नी होगी?')}
                    autoComplete="off"
                  />
                  <button type="submit" className="gov-btn gov-btn-saffron" disabled={!q.trim()}>{t('Ask', 'पूछें')}</button>
                </div>
              </form>
              <div className="gov-ask-actions">
                <button type="button" className="gov-btn" onClick={() => onOpen('assistant')}>{t('Open Rules Assistant', 'नियम सहायक खोलें')}</button>
                <button type="button" className="gov-btn gov-btn-outline" onClick={() => onOpen('calculator')}>{t('Open Counter Calculator', 'काउंटर कैलकुलेटर खोलें')}</button>
              </div>
            </div>
          </section>

          <section className="gov-panel">
            <h2 className="gov-panel-h">{t('Frequently asked at the counter', 'काउंटर पर अक्सर पूछे जाने वाले प्रश्न')}</h2>
            <div className="gov-panel-b">
              <ol className="gov-faq">
                {FAQ.map((f, i) => (
                  <li key={i}>
                    <button type="button" className="gov-link" onClick={() => onAsk(lang === 'hi' ? f.hi : f.en)}>
                      {lang === 'hi' ? f.hi : f.en}
                    </button>
                  </li>
                ))}
              </ol>
              <p className="gov-muted gov-small">{t('Select a question to send it to the Rules Assistant.', 'किसी प्रश्न को चुनने पर वह नियम सहायक को भेज दिया जाएगा।')}</p>
            </div>
          </section>

          <section className="gov-panel" id="gov-about">
            <h2 className="gov-panel-h">{t('About this service', 'इस सेवा के बारे में')}</h2>
            <div className="gov-panel-b">
              <p>
                {t(
                  'Every house, shop or additional floor built in Bhopal must comply with the Madhya Pradesh Bhumi Vikas Rules, 2012. The rulebook runs to 108 pages and 105 numbered rules, and the figures asked about most often, such as fees, open spaces and floor area ratio, are set out in tables in different parts of it.',
                  'भोपाल में बनने वाले हर मकान, दुकान या अतिरिक्त मंज़िल को मध्यप्रदेश भूमि विकास नियम, 2012 का पालन करना होता है। नियमावली 108 पृष्ठों और 105 क्रमांकित नियमों की है, और जिन आंकड़ों के बारे में सबसे अधिक पूछा जाता है, जैसे शुल्क, खुला स्थान और फ्लोर एरिया अनुपात, वे इसके अलग-अलग भागों की तालिकाओं में हैं।'
                )}
              </p>
              <p>
                {t(
                  'This service is intended for the clerk at the building-permission counter. It locates the relevant rule, gives a short answer in the language of the question, and shows the rule number and the rule text so that the citizen can be shown the source. Fee and open-space figures are calculated from the rule tables by the Counter Calculator, not estimated.',
                  'यह सेवा भवन अनुमति काउंटर पर बैठे क्लर्क के लिए है। यह संबंधित नियम खोजती है, प्रश्न की भाषा में संक्षिप्त उत्तर देती है, और नियम संख्या तथा नियम पाठ दिखाती है ताकि नागरिक को स्रोत दिखाया जा सके। शुल्क और खुले स्थान के आंकड़े काउंटर कैलकुलेटर द्वारा नियम तालिकाओं से गणना किए जाते हैं, अनुमानित नहीं।'
                )}
              </p>

              <h3 className="gov-h3">{t('Illustration', 'उदाहरण')}</h3>
              <p className="gov-small">{t('Residential plot of 200 sq m on a 9 m wide road, building height up to 12.5 m:', '9 मीटर चौड़ी सड़क पर 200 वर्ग मीटर का आवासीय भूखंड, भवन की ऊंचाई 12.5 मीटर तक:')}</p>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t('Item', 'मद')}</th>
                    <th>{t('Result', 'परिणाम')}</th>
                    <th>{t('Rule', 'नियम')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>{t('Front open space', 'आगे का खुला स्थान')}</td><td>3.0 m</td><td>56(1)(a)</td></tr>
                  <tr><td>{t('Rear open space', 'पीछे का खुला स्थान')}</td><td>2.5 m</td><td>56(2)(a)</td></tr>
                  <tr><td>{t('Permission fee (built-up area estimated at 250 sq m)', 'अनुमति शुल्क (निर्मित क्षेत्र अनुमानित 250 वर्ग मीटर)')}</td><td>₹3,250</td><td>21(2)(ii), 21(3)(b)</td></tr>
                  <tr><td>{t('Separate development permission', 'अलग विकास अनुमति')}</td><td>{t('Not required (plot ≤ 500 sq m)', 'आवश्यक नहीं (भूखंड ≤ 500 वर्ग मीटर)')}</td><td>2(5)(c), {t('amended 28-08-2026', 'संशोधित 28-08-2026')}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="gov-panel" id="gov-services">
            <h2 className="gov-panel-h">{t('Services', 'सेवाएं')}</h2>
            <div className="gov-panel-b gov-panel-b-flush">
              <table className="gov-table gov-table-services">
                <thead>
                  <tr>
                    <th>{t('Service', 'सेवा')}</th>
                    <th>{t('Description', 'विवरण')}</th>
                    <th>{t('Action', 'कार्रवाई')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t('Rules Assistant', 'नियम सहायक')}</td>
                    <td>{t('Question and answer over all 105 rules, with rule number and source text. Says "not found" when the rules are silent.', 'सभी 105 नियमों पर प्रश्नोत्तर, नियम संख्या और स्रोत पाठ सहित। नियम मौन हों तो "नहीं मिला" बताता है।')}</td>
                    <td><button type="button" className="gov-link" onClick={() => onOpen('assistant')}>{t('Open', 'खोलें')}</button></td>
                  </tr>
                  <tr>
                    <td>{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</td>
                    <td>{t('Front and rear open space, permission fee, floor area ratio and lift requirement from plot area, road width, height and building type.', 'भूखंड क्षेत्रफल, सड़क की चौड़ाई, ऊंचाई और भवन प्रकार से आगे-पीछे का खुला स्थान, अनुमति शुल्क, फ्लोर एरिया अनुपात और लिफ्ट की आवश्यकता।')}</td>
                    <td><button type="button" className="gov-link" onClick={() => onOpen('calculator')}>{t('Open', 'खोलें')}</button></td>
                  </tr>
                  <tr>
                    <td>{t('Citizen Guidance Slip', 'नागरिक मार्गदर्शन पर्ची')}</td>
                    <td>{t('Print the answer with its rule reference for the citizen to take away. Available from the Rules Assistant.', 'उत्तर को नियम संदर्भ सहित पर्ची के रूप में प्रिंट करें। नियम सहायक में उपलब्ध।')}</td>
                    <td><button type="button" className="gov-link" onClick={() => onOpen('assistant')}>{t('Open', 'खोलें')}</button></td>
                  </tr>
                  <tr>
                    <td>{t('Amendments', 'संशोधन')}</td>
                    <td>{t('Clerks who sign in may record new gazette amendments; recorded amendments are applied to every answer and listed under Latest Updates.', 'साइन-इन किए हुए क्लर्क नए राजपत्र संशोधन दर्ज कर सकते हैं; दर्ज संशोधन हर उत्तर में लागू होते हैं और नवीनतम अपडेट में दिखते हैं।')}</td>
                    <td><button type="button" className="gov-link" onClick={() => onOpen('assistant')}>{t('Clerk login', 'क्लर्क लॉगिन')}</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="gov-panel">
            <h2 className="gov-panel-h">{t('How an answer is produced', 'उत्तर कैसे तैयार होता है')}</h2>
            <div className="gov-panel-b">
              <ol className="gov-steps">
                <li>{t('The question is matched against the text of all 105 rules and the most relevant rules are selected.', 'प्रश्न का मिलान सभी 105 नियमों के पाठ से किया जाता है और सबसे संबंधित नियम चुने जाते हैं।')}</li>
                <li>{t('Only the selected rule text is used to write the answer. The answer must cite the rule number; if the text does not contain the answer, the service reports "not found".', 'उत्तर केवल चुने गए नियम पाठ से लिखा जाता है। उत्तर में नियम संख्या देना अनिवार्य है; यदि पाठ में उत्तर नहीं है, तो सेवा "नहीं मिला" बताती है।')}</li>
                <li>{t('Figures from the fee and open-space tables are calculated in code by the Counter Calculator.', 'शुल्क और खुले स्थान की तालिकाओं के आंकड़े काउंटर कैलकुलेटर द्वारा कोड में गणना किए जाते हैं।')}</li>
                <li>{t('Every answer states the consolidation date of the rulebook (6 March 2025) and applies the amendment of 28 August 2026.', 'हर उत्तर में नियमावली की समेकन तिथि (6 मार्च 2025) बताई जाती है और 28 अगस्त 2026 का संशोधन लागू किया जाता है।')}</li>
              </ol>
            </div>
          </section>
        </div>

        <aside className="gov-col-side">
          <section className="gov-panel">
            <h2 className="gov-panel-h">{t('Important information', 'महत्वपूर्ण जानकारी')}</h2>
            <div className="gov-panel-b">
              <dl className="gov-dl">
                <dt>{t('Rulebook', 'नियमावली')}</dt>
                <dd>{t('Madhya Pradesh Bhumi Vikas Rules, 2012', 'मध्यप्रदेश भूमि विकास नियम, 2012')}</dd>
                <dt>{t('Consolidated up to', 'समेकित तिथि')}</dt>
                <dd>6 {t('March', 'मार्च')} 2025</dd>
                <dt>{t('Latest amendment applied', 'लागू नवीनतम संशोधन')}</dt>
                <dd>28 {t('August', 'अगस्त')} 2026 — {t('Rule', 'नियम')} 2(5)(c)</dd>
                <dt>{t('Rules indexed', 'सूचीबद्ध नियम')}</dt>
                <dd>105 {t('numbered rules and Rule 26-B', 'क्रमांकित नियम तथा नियम 26-ख')}</dd>
                <dt>{t('Languages', 'भाषाएं')}</dt>
                <dd>{t('English, Hindi, Hinglish', 'हिन्दी, अंग्रेज़ी, हिंग्लिश')}</dd>
              </dl>
            </div>
          </section>

          <section className="gov-panel">
            <h2 className="gov-panel-h">{t('Quick links', 'त्वरित लिंक')}</h2>
            <div className="gov-panel-b">
              <ul className="gov-links">
                <li><button type="button" className="gov-link" onClick={() => onOpen('assistant')}>{t('Rules Assistant', 'नियम सहायक')}</button></li>
                <li><button type="button" className="gov-link" onClick={() => onOpen('calculator')}>{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</button></li>
                <li><a href={RULEBOOK_EN} target="_blank" rel="noopener noreferrer">{t('Rulebook, English (PDF, T&CP Department)', 'नियमावली, अंग्रेज़ी (PDF, नगर तथा ग्राम निवेश विभाग)')}</a></li>
                <li><a href={RULEBOOK_HI} target="_blank" rel="noopener noreferrer">{t('Rulebook, Hindi (PDF, T&CP Department)', 'नियमावली, हिन्दी (PDF, नगर तथा ग्राम निवेश विभाग)')}</a></li>
                <li><a href={AMENDMENT_URL} target="_blank" rel="noopener noreferrer">{t('Amendment of 28 August 2026 (notice)', '28 अगस्त 2026 का संशोधन (सूचना)')}</a></li>
                <li><a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t('Source code (GitHub)', 'स्रोत कोड (GitHub)')}</a></li>
              </ul>
            </div>
          </section>

          <section className="gov-panel gov-panel-notice" id="gov-disclaimer">
            <h2 className="gov-panel-h">{t('Disclaimer', 'अस्वीकरण')}</h2>
            <div className="gov-panel-b">
              <ul className="gov-bullets">
                <li>{t('The service points to the rule; the decision rests with the clerk and the competent authority.', 'सेवा नियम की ओर संकेत करती है; निर्णय क्लर्क और सक्षम प्राधिकारी का होता है।')}</li>
                <li>{t('Answers are not legal advice. Verify figures against the official PDF before acting on them.', 'उत्तर कानूनी सलाह नहीं हैं। कार्रवाई से पहले आंकड़ों का आधिकारिक PDF से मिलान करें।')}</li>
                <li>{t('The service uses public data only, is not connected to any government system and stores no personal data.', 'सेवा केवल सार्वजनिक डेटा का उपयोग करती है, किसी सरकारी प्रणाली से जुड़ी नहीं है और कोई व्यक्तिगत डेटा संग्रहीत नहीं करती।')}</li>
              </ul>
            </div>
          </section>
        </aside>
      </main>

      <footer className="gov-footer">
        <div className="gov-container">
          <ul className="gov-footer-links">
            <li><button type="button" onClick={() => scrollToId('gov-about')}>{t('About', 'परिचय')}</button></li>
            <li><button type="button" onClick={() => scrollToId('gov-disclaimer')}>{t('Disclaimer', 'अस्वीकरण')}</button></li>
            <li><a href={RULEBOOK_EN} target="_blank" rel="noopener noreferrer">{t('Official rulebook', 'आधिकारिक नियमावली')}</a></li>
            <li><a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t('Source code', 'स्रोत कोड')}</a></li>
            <li><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('Back to top', 'ऊपर जाएं')}</button></li>
          </ul>
          <p className="gov-footer-text">
            {t(
              'Content based on the Madhya Pradesh Bhumi Vikas Rules, 2012, consolidated up to 6 March 2025, with the amendment of 28 August 2026. Developed by Team AeroNerds at Claude Impact Lab × Cerebras Café Compute, Bhopal, 11 October 2026. Released under the MIT licence and offered to the Government of Madhya Pradesh through MPSeDC.',
              'सामग्री मध्यप्रदेश भूमि विकास नियम, 2012 (6 मार्च 2025 तक समेकित) तथा 28 अगस्त 2026 के संशोधन पर आधारित। टीम AeroNerds द्वारा क्लॉड इम्पैक्ट लैब × सेरेब्रास कैफ़े कंप्यूट, भोपाल, 11 अक्टूबर 2026 में विकसित। MIT लाइसेंस के अंतर्गत जारी तथा MPSeDC के माध्यम से मध्यप्रदेश शासन को प्रस्तावित।'
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
