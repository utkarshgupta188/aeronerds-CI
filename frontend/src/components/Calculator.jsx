import { useState } from 'react'
import { apiCalculate } from '../api.js'
import './Calculator.css'

export default function Calculator({ lang, t }) {
  const [form, setForm] = useState({ plot_area: '', road_width: '', building_height: '', built_up_area: '', building_type: 'residential' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setResult(null) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const data = await apiCalculate({
        plot_area: Number(form.plot_area),
        road_width: Number(form.road_width),
        building_height: Number(form.building_height),
        built_up_area: form.built_up_area ? Number(form.built_up_area) : null,
        building_type: form.building_type,
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const valid = form.plot_area > 0 && form.road_width > 0 && form.building_height > 0

  return (
    <div className="calculator">
      <div className="assistant-header">
        <h1 className="section-title">{t('Counter Calculator', 'काउंटर कैलकुलेटर')}</h1>
        <p className="section-sub">
          {t('Enter plot details to get setbacks and fees from the rules instantly.', 'प्लॉट का विवरण दर्ज करें और नियमों से सेटबैक व शुल्क तुरंत पाएं।')}
        </p>
      </div>

      <form className="calc-form card" onSubmit={handleSubmit}>
        <div className="calc-fields">
          <div className="field">
            <label htmlFor="plot_area">{t('Plot Area (sq m)', 'प्लॉट क्षेत्रफल (वर्ग मी.)')}</label>
            <input id="plot_area" type="number" min="1" step="1" placeholder="e.g. 200" value={form.plot_area} onChange={e => set('plot_area', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="road_width">{t('Road Width (m)', 'सड़क की चौड़ाई (मी.)')}</label>
            <input id="road_width" type="number" min="1" step="0.5" placeholder="e.g. 9" value={form.road_width} onChange={e => set('road_width', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="building_height">{t('Building Height (m)', 'भवन की ऊंचाई (मी.)')}</label>
            <input id="building_height" type="number" min="1" step="0.5" placeholder="e.g. 9" value={form.building_height} onChange={e => set('building_height', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="built_up_area">{t('Built-up Area (sq m, optional)', 'निर्मित क्षेत्र (वर्ग मी., वैकल्पिक)')}</label>
            <input id="built_up_area" type="number" min="1" step="1" placeholder={t('blank = plot × 1.25', 'खाली = प्लॉट × 1.25')} value={form.built_up_area} onChange={e => set('built_up_area', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="building_type">{t('Building Type', 'भवन प्रकार')}</label>
            <select id="building_type" value={form.building_type} onChange={e => set('building_type', e.target.value)}>
              <option value="residential">{t('Residential', 'आवासीय')}</option>
              <option value="commercial">{t('Commercial', 'व्यावसायिक')}</option>
              <option value="farm_house">{t('Farm House', 'फार्म हाउस')}</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary calc-submit" disabled={loading || !valid}>
          {loading ? <span className="spinner" /> : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/>
            </svg>
          )}
          {t('Calculate', 'गणना करें')}
        </button>
      </form>

      {error && (
        <div className="error-banner card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {result && (
        <div className="calc-results card" style={{ animation: 'slide-in 0.25s ease-out' }}>
          <h2 className="results-title">{t('Results', 'परिणाम')}</h2>

          <div className="result-grid">
            <ResultTile
              icon="↕"
              label={t('Front Setback', 'आगे का खुला स्थान')}
              value={result.front_setback.value != null ? `${result.front_setback.value} m` : '—'}
              rule={result.front_setback.rule}
              note={result.front_setback.label}
            />
            <ResultTile
              icon="↕"
              label={t('Rear Setback', 'पीछे का खुला स्थान')}
              value={result.rear_setback.value != null ? `${result.rear_setback.value} m` : '—'}
              rule={result.rear_setback.rule}
              note={result.rear_setback.label}
            />
            <ResultTile
              icon="₹"
              label={t('Total Permission Fee', 'कुल अनुमति शुल्क')}
              value={result.permission_fee.value != null ? `₹${result.permission_fee.value.toLocaleString('en-IN')}` : '—'}
              rule={result.permission_fee.rule}
              note={result.permission_fee.label}
            />
          </div>

          <div className="side-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {result.side_note}
          </div>
          <div className="side-note" style={{marginTop:'0.4rem'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {result.lift_note}
          </div>
          <div className="side-note" style={{marginTop:'0.4rem'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {result.dev_permission}
          </div>
          {result.far_note && (
            <div className="side-note" style={{marginTop:'0.4rem'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              {result.far_note}
            </div>
          )}
          <div className="data-note">{result.data_note}</div>
        </div>
      )}
    </div>
  )
}

function ResultTile({ icon, label, value, rule, note }) {
  return (
    <div className="result-tile">
      <div className="result-tile-icon">{icon}</div>
      <div className="result-tile-body">
        <div className="result-tile-label">{label}</div>
        <div className="result-tile-value">{value}</div>
        <div className="result-tile-meta">
          <span className="rule-chip">Rule {rule}</span>
          <span className="result-tile-note">{note}</span>
        </div>
      </div>
    </div>
  )
}
