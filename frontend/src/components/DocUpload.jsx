import { useState, useRef } from 'react'
import { apiUpload } from '../api.js'
import './DocUpload.css'

export default function DocUpload({ docs, onAdd, onRemove, t }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [dragOver, setDragOver]   = useState(false)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'txt'].includes(ext)) {
      setError(t('Only PDF or TXT files are supported.', 'केवल PDF या TXT फ़ाइलें समर्थित हैं।'))
      return
    }
    setUploading(true)
    setError(null)
    try {
      const data = await apiUpload(file)
      onAdd(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="doc-upload">
      <div className="doc-upload-bar">
        <span className="doc-upload-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {t('Reference Documents', 'संदर्भ दस्तावेज़')}
        </span>
        {docs.length > 0 && (
          <span className="doc-active-badge">{docs.length} {t('active', 'सक्रिय')}</span>
        )}
      </div>

      {docs.length > 0 && (
        <div className="doc-chips">
          {docs.map(d => (
            <span key={d.doc_id} className="doc-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="doc-chip-name">{d.name}</span>
              <span className="doc-chip-meta">{d.size_kb}KB · {d.chunks} {t('chunks', 'खंड')}</span>
              <button
                className="doc-chip-remove"
                onClick={() => onRemove(d.doc_id)}
                aria-label={t('Remove document', 'दस्तावेज़ हटाएं')}
              >×</button>
            </span>
          ))}
        </div>
      )}

      <div
        className={`doc-drop-zone${dragOver ? ' drag-over' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={t('Upload a reference document', 'संदर्भ दस्तावेज़ अपलोड करें')}
      >
        {uploading ? (
          <span className="spinner" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <span className="doc-drop-label">
              {t('Upload PDF or TXT', 'PDF या TXT अपलोड करें')}
            </span>
            <span className="doc-drop-sub">
              {t('Gazette notifications, new rules, site reports', 'गजट अधिसूचना, नए नियम, साइट रिपोर्ट')}
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="doc-upload-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {docs.length > 0 && (
        <p className="doc-active-note">
          {t(
            'Questions will also search these documents alongside the base rules.',
            'प्रश्नों की खोज बेस नियमों के साथ इन दस्तावेज़ों में भी होगी।'
          )}
        </p>
      )}
    </div>
  )
}
