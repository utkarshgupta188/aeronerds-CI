import { useState } from 'react'
import { apiBenchmark } from '../api.js'
import './Benchmark.css'

export default function Benchmark({ lang, t }) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true); setError(null)
    try {
      const data = await apiBenchmark()
      setResults(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const passed = results ? results.filter(r => {
    if (r.expected_not_found) return r.not_found
    return !r.not_found
  }).length : 0

  const total = results ? results.length : 17

  return (
    <div className="benchmark">
      <div className="assistant-header">
        <h1 className="section-title">{t('Live Benchmark', 'लाइव बेंचमार्क')}</h1>
        <p className="section-sub">
          {t('Run all 17 sample questions from the problem statement and see the tool\'s accuracy.', '17 सैंपल प्रश्न चलाएं और टूल की सटीकता देखें।')}
        </p>
      </div>

      {!results && !loading && (
        <div className="bench-start card">
          <div className="bench-stat-row">
            <div className="bench-stat">
              <div className="bench-stat-num">17</div>
              <div className="bench-stat-label">{t('Sample questions', 'सैंपल प्रश्न')}</div>
            </div>
            <div className="bench-stat">
              <div className="bench-stat-num" style={{ color: 'var(--green)' }}>15</div>
              <div className="bench-stat-label">{t('In-scope (should answer)', 'उत्तर अपेक्षित')}</div>
            </div>
            <div className="bench-stat">
              <div className="bench-stat-num" style={{ color: 'var(--amber)' }}>2</div>
              <div className="bench-stat-label">{t('Out-of-scope (should say not found)', 'दायरे से बाहर')}</div>
            </div>
          </div>
          <button className="btn btn-primary bench-run-btn" onClick={run}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            {t('Run Benchmark', 'बेंचमार्क चलाएं')}
          </button>
          <p className="bench-note">{t('This makes live API calls — takes ~2 minutes to complete.', 'यह लाइव API कॉल करता है — पूरा होने में ~2 मिनट लगते हैं।')}</p>
        </div>
      )}

      {loading && (
        <div className="bench-loading card">
          <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t('Running 17 questions…', '17 प्रश्न चल रहे हैं…')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('This takes about 2 minutes. Please wait.', 'इसमें लगभग 2 मिनट लगते हैं।')}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {results && (
        <div className="bench-results">
          <div className="bench-score-bar card">
            <div className="score-main">
              <span className="score-num" style={{ color: passed === total ? 'var(--green)' : 'var(--saffron)' }}>
                {passed}/{total}
              </span>
              <span className="score-label">{t('Passed', 'पास')}</span>
            </div>
            <div className="score-badges">
              <span className="badge badge-green">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {results.filter(r => r.expected_not_found ? r.not_found : !r.not_found).length} correct
              </span>
              {results.some(r => r.expected_not_found ? !r.not_found : r.not_found) && (
                <span className="badge badge-red">
                  {results.filter(r => r.expected_not_found ? !r.not_found : r.not_found).length} incorrect
                </span>
              )}
            </div>
            <button className="btn btn-secondary" onClick={run} style={{ marginLeft: 'auto' }}>
              {t('Re-run', 'फिर चलाएं')}
            </button>
          </div>

          <div className="bench-table-wrap card">
            <table className="bench-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>{t('Question', 'प्रश्न')}</th>
                  <th style={{ width: 100 }}>{t('Status', 'स्थिति')}</th>
                  <th style={{ width: 120 }}>{t('Rules Cited', 'नियम')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const correct = r.expected_not_found ? r.not_found : !r.not_found
                  return (
                    <tr key={r.id} className={correct ? '' : 'row-error'}>
                      <td className="bench-id">{r.id}</td>
                      <td className="bench-q">
                        <div className="bench-question">{r.question}</div>
                        {!r.not_found && (
                          <div className="bench-answer-preview">{r.answer_text?.slice(0, 120)}{r.answer_text?.length > 120 ? '…' : ''}</div>
                        )}
                      </td>
                      <td>
                        {correct ? (
                          <span className="badge badge-green">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                            {r.not_found ? 'Not found' : 'Answered'}
                          </span>
                        ) : (
                          <span className="badge badge-red">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            {r.not_found ? 'Missed' : 'Hallucinated'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {r.rule_numbers?.slice(0, 3).map((n, i) => (
                            <span key={i} className="rule-chip" style={{ fontSize: 11 }}>Rule {n}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
