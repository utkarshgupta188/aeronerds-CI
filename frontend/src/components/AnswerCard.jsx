import { useState } from 'react'
import './AnswerCard.css'

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
        {result.answer_text}
      </div>

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
