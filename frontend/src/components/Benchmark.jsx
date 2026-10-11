import { useState } from 'react'
import { apiBenchmark } from '../api.js'
import './Benchmark.css'

const REFERENCE = [
  { id: '1', rule: '56(1)(a)', answer: '3.6 m front setback (10 m road falls in 9–12 m slab)' },
  { id: '2', rule: '17', answer: 'Minimum plot 0.40 ha; maximum FAR 0.10 (max height 7.5 m, 7.5 m open space all sides)' },
  { id: '3', rule: '23', answer: 'Valid 3 years; revalidation for two consecutive terms of one year each, then fresh application' },
  { id: '4', rule: '28', answer: 'Deemed sanctioned if refusal is not intimated within the Section 30(5) period; not for authorised Architect/Engineer applications' },
  { id: '5', rule: '52', answer: 'Low/medium voltage: 2.5 m vertically and 1.2 m horizontally' },
  { id: '6', rule: '18, 26', answer: 'Licensed architect, structural engineer, engineer, supervisor or town planner, plus the owner/applicant' },
  { id: '7', rule: '14, 16', answer: 'Fee receipt, key plan, site plan, building plans, service plans, project report, ownership proof, authorisation, parking plans, supervision certificate' },
  { id: '8', rule: '21(2)(ii)+21(3)(b)', answer: 'Application fee ₹1/sq m + slab sanction fee, e.g. ≤75 sq m → ₹750' },
  { id: '9', rule: '24', answer: 'Not allowed if it affects front open space, exceeds 30% of permissible FAR, or touches parking, road, water bodies; else compounding fee' },
  { id: '10', rule: '56(2)(a)', answer: '1.5 m rear setback (40–150 sq m slab)' },
  { id: '11', rule: '2(5)(c)', answer: 'No — August 2026 amendment exempts plots ≤ 500 sq m' },
  { id: '12', rule: '103', answer: 'Development Plan norms apply; conflicts go to Government via the Director, whose decision is final' },
  { id: '13', rule: '83', answer: 'Lift required above 12.5 m; design per NBC Part-VIII Section 5' },
  { id: '14', rule: '56(1)(a)', answer: '3 मीटर आगे खुला छोड़ना होगा (9 मी. तक की सड़क)' },
  { id: '15', rule: '21(2)(ii), 21(3)(b)', answer: '₹1/वर्ग मीटर आवेदन शुल्क + निर्मित क्षेत्र के अनुसार स्वीकृति शुल्क' },
  { id: '16', rule: null, answer: 'Out of scope — expect "Not found"' },
  { id: '17', rule: null, answer: 'Out of scope — expect "Not found"' },
]

const QUESTIONS = {
  '1': 'My house faces a 10 m wide street and will be 9 m tall. How much open space do I leave at the front?',
  '2': 'I want a farm house on agricultural land. What is the minimum plot size and the maximum FAR?',
  '3': 'My development permission was granted in 2023. How long does it stay valid, and how many times can I renew it?',
  '4': 'I applied for building permission and the authority has not replied. What happens if they miss the deadline?',
  '5': 'How far must my balcony stay from a low-voltage overhead electric line, vertically and horizontally?',
  '6': 'Who is allowed to sign and submit my building plans?',
  '7': 'What documents go with an application for building permission?',
  '8': 'What is the fee for building permission for a residential house?',
  '9': 'Can I change my plan after it is sanctioned?',
  '10': 'What is the minimum rear open space for a 150 sq m residential plot?',
  '11': 'Do I need separate development permission for a 300 sq m plot that matches the Development Plan?',
  '12': 'Which rule decides what happens when the Development Plan and these rules disagree?',
  '13': 'What are the rules for lifts in a building taller than 15 m?',
  '14': 'मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह खाली छोड़नी होगी?',
  '15': 'बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?',
  '16': 'How do I pay my property tax online?',
  '17': 'What is the current market rate for land in Kolar Road, Bhopal?',
}

const isCorrect = r => (r.expected_not_found ? r.not_found : !r.not_found)

export default function Benchmark({ t }) {
  const [live, setLive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true); setError(null)
    try {
      const data = await apiBenchmark()
      setLive(Object.fromEntries(data.results.map(r => [r.id, r])))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const liveRows = live ? Object.values(live) : []
  const passed = liveRows.filter(isCorrect).length

  return (
    <div className="benchmark">
      <div className="assistant-header">
        <h1 className="section-title">{t('Benchmark', 'बेंचमार्क')}</h1>
        <p className="section-sub">
          {t('The 17 sample questions with reference answers checked against the rule text. Run live to test the model.', '17 सैंपल प्रश्न, नियम पाठ से जांचे गए संदर्भ उत्तरों के साथ। मॉडल जांचने के लिए लाइव चलाएं।')}
        </p>
      </div>

      <div className="bench-score-bar card">
        {live ? (
          <div className="score-main">
            <span className="score-num" style={{ color: passed === liveRows.length ? 'var(--green)' : 'var(--saffron)' }}>
              {passed}/{liveRows.length}
            </span>
            <span className="score-label">{t('correct on live run', 'लाइव रन में सही')}</span>
          </div>
        ) : (
          <div className="score-main">
            <span className="score-num">17</span>
            <span className="score-label">{t('questions · 15 in scope · 2 out of scope', 'प्रश्न · 15 दायरे में · 2 दायरे से बाहर')}</span>
          </div>
        )}
        <button className="btn btn-primary" onClick={run} disabled={loading} style={{ marginLeft: 'auto' }}>
          {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          )}
          {loading ? t('Running… (~2 min)', 'चल रहा है… (~2 मिनट)') : live ? t('Re-run live', 'फिर चलाएं') : t('Run live', 'लाइव चलाएं')}
        </button>
      </div>

      {error && (
        <div className="error-banner card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <div className="bench-table-wrap card">
        <table className="bench-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>{t('Question and reference answer', 'प्रश्न और संदर्भ उत्तर')}</th>
              <th style={{ width: 130 }}>{t('Expected rule', 'अपेक्षित नियम')}</th>
              <th style={{ width: 150 }}>{t('Live result', 'लाइव परिणाम')}</th>
            </tr>
          </thead>
          <tbody>
            {REFERENCE.map(ref => {
              const r = live?.[ref.id]
              const ok = r ? isCorrect(r) : null
              return (
                <tr key={ref.id} className={ok === false ? 'row-error' : ''}>
                  <td className="bench-id">{ref.id}</td>
                  <td>
                    <div className="bench-question">{QUESTIONS[ref.id]}</div>
                    <div className="bench-answer-preview">{ref.answer}</div>
                  </td>
                  <td>
                    {ref.rule ? <span className="rule-chip" style={{ fontSize: 11 }}>Rule {ref.rule}</span> : <span className="bench-answer-preview">—</span>}
                  </td>
                  <td>
                    {!r ? (
                      <span className="badge badge-navy">{t('Reference', 'संदर्भ')}</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <span className={`badge ${ok ? 'badge-green' : 'badge-red'}`}>
                          {ok ? '✓ ' : '✗ '}{r.not_found ? t('Not found', 'नहीं मिला') : t('Answered', 'उत्तर दिया')}
                        </span>
                        {r.rule_numbers?.length > 0 && (
                          <span className="bench-answer-preview">{t('cited', 'उद्धृत')}: {r.rule_numbers.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
