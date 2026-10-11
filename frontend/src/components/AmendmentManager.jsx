import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, updateDoc, doc
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { apiRules } from '../api.js'
import './AmendmentManager.css'

const OTHER = '__other__'

export default function AmendmentManager({ user, t }) {
  const [amendments, setAmendments] = useState([])
  const [rules, setRules] = useState([])
  const [form, setForm] = useState({ rule_number: '', title: '', text: '', effective_date: '' })
  const [customRule, setCustomRule] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'amendments'), orderBy('added_at', 'desc'))
    return onSnapshot(q, snap => {
      setAmendments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  useEffect(() => {
    apiRules().then(d => setRules(d.rules)).catch(() => {})
  }, [])

  async function toggleActive(a) {
    await updateDoc(doc(db, 'amendments', a.id), { active: a.active === false })
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'amendments'), {
        ...form,
        rule_number: form.rule_number === OTHER ? customRule.trim() : form.rule_number,
        active: true,
        added_by: user.email,
        added_at: serverTimestamp(),
      })
      setForm({ rule_number: '', title: '', text: '', effective_date: '' })
      setCustomRule('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    await deleteDoc(doc(db, 'amendments', id))
    setDeleting(null)
  }

  return (
    <div className="amendments">
      <div className="assistant-header">
        <h1 className="section-title">{t('Amendment Manager', 'संशोधन प्रबंधक')}</h1>
        <p className="section-sub">
          {t('Add latest gazette amendments. Visible to all clerks immediately.', 'नवीनतम गजट संशोधन जोड़ें। सभी क्लर्कों को तुरंत दिखेगा।')}
        </p>
      </div>

      {user ? (
        <div className="amend-form card">
          <div className="amend-form-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('Add New Amendment', 'नया संशोधन जोड़ें')}
          </div>
          <form onSubmit={handleAdd} className="amend-fields">
            <div className="amend-row">
              <div className="field">
                <label>{t('Rule', 'नियम')}</label>
                <select value={form.rule_number} required
                  onChange={e => setForm(f => ({ ...f, rule_number: e.target.value }))}>
                  <option value="" disabled>{t('Choose a rule from the list…', 'सूची से नियम चुनें…')}</option>
                  {rules.map(r => (
                    <option key={r.rule} value={r.rule}>Rule {r.rule} — {r.title}</option>
                  ))}
                  <option value={OTHER}>{t('Other / new rule…', 'अन्य / नया नियम…')}</option>
                </select>
                {form.rule_number === OTHER && (
                  <input type="text" style={{ marginTop: 8 }} placeholder="e.g. 56-A" value={customRule}
                    onChange={e => setCustomRule(e.target.value)} required />
                )}
              </div>
              <div className="field">
                <label>{t('Effective Date', 'प्रभावी तिथि')}</label>
                <input type="date" value={form.effective_date}
                  onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} required />
              </div>
            </div>
            <div className="field">
              <label>{t('Amendment Title', 'संशोधन शीर्षक')}</label>
              <input type="text" placeholder={t('Short description of the change', 'परिवर्तन का संक्षिप्त विवरण')}
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="field">
              <label>{t('Amendment Text', 'संशोधन पाठ')}</label>
              <textarea rows={4} placeholder={t('Paste the gazette notification text here…', 'यहाँ गजट अधिसूचना का पाठ पेस्ट करें…')}
                value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required />
            </div>
            <div className="amend-submit-row">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {t('Save Amendment', 'संशोधन सहेजें')}
              </button>
              {saved && <span className="amend-saved">{t('Saved!', 'सहेजा गया!')}</span>}
            </div>
          </form>
        </div>
      ) : (
        <div className="amend-login-prompt card">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t('Clerk login required', 'क्लर्क लॉगिन आवश्यक')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('Sign in to add or manage amendments.', 'संशोधन जोड़ने के लिए साइन इन करें।')}</div>
          </div>
        </div>
      )}

      <div className="amend-list-section">
        <div className="amend-list-header">
          <span className="amend-list-title">{t('Recorded Amendments', 'दर्ज संशोधन')}</span>
          <span className="badge badge-navy">{amendments.length}</span>
        </div>

        {amendments.length === 0 ? (
          <div className="amend-empty card">{t('No amendments recorded yet.', 'अभी तक कोई संशोधन दर्ज नहीं।')}</div>
        ) : (
          <div className="amend-cards">
            {amendments.map(a => (
              <div key={a.id} className={`amend-card card ${a.active === false ? 'amend-off' : ''}`}>
                <div className="amend-card-top">
                  <div className="amend-meta">
                    <span className="rule-chip">Rule {a.rule_number}</span>
                    {a.effective_date && (
                      <span className="amend-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {t('Effective', 'प्रभावी')}: {a.effective_date}
                      </span>
                    )}
                  </div>
                  {user && (
                    <label className="amend-switch" title={t('Use this amendment in answers', 'उत्तरों में यह संशोधन लागू करें')}>
                      <input type="checkbox" checked={a.active !== false} onChange={() => toggleActive(a)} />
                      <span className="amend-switch-track" />
                      <span className="amend-switch-label">{a.active === false ? t('Off', 'बंद') : t('In use', 'लागू')}</span>
                    </label>
                  )}
                  {user && (
                    <button className="amend-delete" onClick={() => handleDelete(a.id)} disabled={deleting === a.id} title={t('Delete', 'हटाएं')}>
                      {deleting === a.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="amend-card-title">{a.title}</div>
                <div className="amend-card-text">{a.text}</div>
                <div className="amend-card-footer">
                  <span>{t('Added by', 'द्वारा जोड़ा गया')}: {a.added_by}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
