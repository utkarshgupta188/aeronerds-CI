import { useState } from 'react'
import './AnswerCard.css'

function renderInline(text) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  )
}

function AnswerBody({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let bulletGroup = []

  function flushBullets() {
    if (bulletGroup.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="answer-bullets">
          {bulletGroup.map((b, i) => <li key={i}>{renderInline(b)}</li>)}
        </ul>
      )
      bulletGroup = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) { flushBullets(); return }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletGroup.push(trimmed.slice(2))
    } else if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      flushBullets()
      // Section header like **Answer:** or **Key Points:**
      const m = trimmed.match(/^\*\*([^*]+):\*\*\s*(.*)/)
      const label = m[1]
      const rest = m[2].trim()
      elements.push(
        <div key={i} className="answer-section">
          <span className="answer-section-label">{label}</span>
          {rest && <span>{renderInline(rest)}</span>}
        </div>
      )
    } else {
      flushBullets()
      elements.push(<p key={i}>{renderInline(trimmed)}</p>)
    }
  })
  flushBullets()
  return <>{elements}</>
}

function Qualifies({ value, t }) {
  if (value === true) return <span className="badge badge-green">✓ {t('You qualify', 'आप पात्र हैं')}</span>
  if (value === false) return <span className="badge badge-red">✗ {t('Does not qualify', 'पात्र नहीं')}</span>
  return <span className="badge badge-amber">? {t('Not enough details', 'पर्याप्त जानकारी नहीं')}</span>
}

function verdict(c, t) {
  const { qualifies_old: o, qualifies_new: n } = c
  if (o === true && n === true) return t('Qualifies under both the old rule and the amendment.', 'पुराने नियम और संशोधन, दोनों में पात्र।')
  if (o === false && n === true) return t('Qualifies only under the amendment.', 'केवल संशोधन के तहत पात्र।')
  if (o === null && n === true) return t('Qualifies under the amendment.', 'संशोधन के तहत पात्र।')
  if (n === false && o === null) return t('Does not qualify under the amendment.', 'संशोधन के तहत पात्र नहीं।')
  if (o === true && n === false) return t('Qualified under the old rule, but not under the amendment.', 'पुराने नियम में पात्र, संशोधन में नहीं।')
  if (o === false && n === false) return t('Does not qualify under either.', 'दोनों में पात्र नहीं।')
  return t('Add more details to your question to check eligibility.', 'पात्रता जांचने के लिए प्रश्न में और जानकारी जोड़ें।')
}

function AmendmentChecks({ checks, t }) {
  return (
    <div className="amcheck">
      <div className="amcheck-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {t('This rule has been amended', 'इस नियम में संशोधन हुआ है')}
      </div>
      {checks.map((c, i) => (
        <div key={i} className="amcheck-item">
          <div className="amcheck-head">
            <span className="rule-chip">Rule {c.rule}</span>
            <span className="amcheck-name">{c.title}</span>
          </div>
          <div className="amcheck-cols">
            <div className="amcheck-col amcheck-old">
              <div className="amcheck-label">{t('Old rule (6 Mar 2025)', 'पुराना नियम (6 मार्च 2025)')}</div>
              <p>{c.old}</p>
              <Qualifies value={c.qualifies_old} t={t} />
            </div>
            <div className="amcheck-col amcheck-new">
              <div className="amcheck-label">
                {t('New (amended)', 'नया (संशोधित)')}{c.effective_date ? ` · ${c.effective_date}` : ''}
              </div>
              <p>{c.new}</p>
              <Qualifies value={c.qualifies_new} t={t} />
            </div>
          </div>
          <div className="amcheck-verdict"><strong>{verdict(c, t)}</strong> {c.reason}</div>
        </div>
      ))}
    </div>
  )
}

export default function AnswerCard({ result, lang, t, question }) {
  const [showSources, setShowSources] = useState(false)

  function printSlip() {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Citizen Guidance Slip</title>
      <style>
        body { font-family: 'Noto Sans', sans-serif; padding: 32px; max-width: 700px; margin: 0 auto; }
        h1 { color: #1A3560; font-size: 20px; border-bottom: 3px solid #E8620A; padding-bottom: 10px; margin-bottom: 18px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
        .question { background: #F7F8FB; border-left: 4px solid #E8620A; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0; }
        .answer { font-size: 15px; line-height: 1.7; margin-bottom: 20px; white-space: pre-wrap; }
        .rules { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .rule { background: #EDF1F8; color: #2E5090; padding: 3px 10px; border-radius: 4px; font-size: 13px; font-weight: 700; }
        .footer { font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>भूमि विकास सहायक · Citizen Guidance Slip</h1>
      <div class="meta">Bhopal Municipal Corporation · ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
      <div class="question"><strong>Question:</strong> ${question}</div>
      <div class="answer">${result.answer_text}</div>
      ${result.rule_numbers?.length ? `<div class="rules">${result.rule_numbers.map(r => `<span class="rule">Rule ${r}</span>`).join('')}</div>` : ''}
      <div class="footer">Based on MP Bhumi Vikas Rules 2012, consolidated to 6 March 2025. Not legal advice. The clerk decides.</div>
      <script>window.print();</script>
      </body></html>
    `)
    win.document.close()
  }

  if (result.error) {
    return (
      <div className="answer-card card error-card">
        <div className="error-icon">⚠</div>
        <div>{result.answer_text}</div>
      </div>
    )
  }

  return (
    <div className={`answer-card card ${result.not_found ? 'not-found' : 'found'}`}>
      <div className="answer-card-header">
        <div className="answer-status">
          {result.not_found ? (
            <span className="badge badge-amber">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {t('Not found in rules', 'नियमों में नहीं मिला')}
            </span>
          ) : (
            <span className="badge badge-green">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {t('Rule found', 'नियम मिला')}
            </span>
          )}
          {result.rule_numbers?.length > 0 && (
            <div className="rule-chips">
              {result.rule_numbers.slice(0, 4).map((r, i) => (
                <span key={i} className="rule-chip">Rule {r}</span>
              ))}
            </div>
          )}
        </div>
        {!result.not_found && (
          <button className="btn btn-secondary print-btn" onClick={printSlip} title={t('Print Guidance Slip', 'मार्गदर्शन पर्ची प्रिंट करें')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            {t('Print Slip', 'पर्ची')}
          </button>
        )}
      </div>

      <div className="answer-text" lang={result.language === 'hi' ? 'hi' : 'en'}>
        <AnswerBody text={result.answer_text} />
      </div>

      {result.amendment_checks?.length > 0 && <AmendmentChecks checks={result.amendment_checks} t={t} />}

      {result.source_excerpts?.length > 0 && (
        <div className="sources-section">
          <button
            className="sources-toggle"
            onClick={() => setShowSources(s => !s)}
            aria-expanded={showSources}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showSources ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            {t(
              `${showSources ? 'Hide' : 'Show'} source rules (${result.source_excerpts.length})`,
              `स्रोत नियम ${showSources ? 'छुपाएं' : 'देखें'} (${result.source_excerpts.length})`
            )}
          </button>
          {showSources && (
            <div className="sources-list">
              {result.source_excerpts.map((excerpt, i) => (
                <div key={i} className="source-item">
                  <pre className="source-text">{excerpt}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
