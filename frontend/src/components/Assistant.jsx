import { useState, useRef, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { apiAsk } from '../api.js'
import AnswerCard from './AnswerCard.jsx'
import './Assistant.css'

const EXAMPLES_EN = [
  'My plot is 200 sq m on a 9 m road. What is the front setback?',
  'What is the fee for building permission for a residential house?',
  'I want a farm house on agricultural land. What is the minimum plot size?',
  'What are the rules for lifts in a building taller than 15 m?',
  'How long is a development permission valid?',
]

const EXAMPLES_HI = [
  'मेरा प्लॉट 200 वर्ग मीटर का है और सामने 9 मीटर चौड़ी सड़क है। आगे कितनी जगह खाली छोड़नी होगी?',
  'बिल्डिंग परमिशन की फीस कितनी है?',
  'फार्म हाउस के लिए न्यूनतम प्लॉट साइज क्या है?',
]

export default function Assistant({ lang, t }) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [amendments, setAmendments] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'amendments'), orderBy('added_at', 'desc'))
    return onSnapshot(q, snap => {
      setAmendments(snap.docs.map(d => {
        const a = d.data()
        return `[AMENDMENT — Rule ${a.rule_number}, effective ${a.effective_date || 'unknown'}] ${a.title}: ${a.text}`
      }))
    })
  }, [])

  const examples = lang === 'hi' ? EXAMPLES_HI : EXAMPLES_EN

  async function handleSubmit(e) {
    e?.preventDefault()
    const q = question.trim()
    if (!q) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await apiAsk(q, 5, amendments)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function useExample(q) {
    setQuestion(q)
    setResult(null)
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="assistant">
      <div className="assistant-header">
        <h1 className="section-title">{t('Ask the Building Rules', 'भवन नियम से पूछें')}</h1>
        <p className="section-sub">
          {t(
            'Ask in plain English or Hindi. Get the answer with the rule number and source text.',
            'सरल हिन्दी या अंग्रेज़ी में पूछें। नियम संख्या और स्रोत पाठ के साथ उत्तर पाएं।'
          )}
        </p>
      </div>

      <form className="ask-form card" onSubmit={handleSubmit}>
        <div className="ask-input-wrap">
          <svg className="ask-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="ask-input"
            placeholder={t(
              'e.g. My plot is 200 sq m on a 9 m road. What is the front setback?',
              'जैसे: मेरा प्लॉट 200 वर्ग मीटर का है, 9 मीटर सड़क है। आगे कितनी जगह छोड़नी होगी?'
            )}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            lang={lang === 'hi' ? 'hi' : 'en'}
            autoComplete="off"
            aria-label={t('Your question', 'आपका प्रश्न')}
          />
        </div>
        <button type="submit" className="btn btn-primary ask-btn" disabled={loading || !question.trim()}>
          {loading ? <span className="spinner" /> : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
          {t('Ask', 'पूछें')}
        </button>
      </form>

      <div className="examples-row">
        <span className="examples-label">{t('Try:', 'उदाहरण:')}</span>
        {examples.map((ex, i) => (
          <button key={i} className="example-pill" onClick={() => useExample(ex)}>
            {ex.length > 55 ? ex.slice(0, 55) + '…' : ex}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {result && <AnswerCard result={result} lang={lang} t={t} question={question} />}
    </div>
  )
}
