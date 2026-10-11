// In prod, nginx proxies /api → backend container. In dev, Vite proxy does the same.
const BASE = import.meta.env.VITE_API_URL || ''

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `API error ${res.status}`)
  }
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const apiAsk       = (question, top_k = 5, amendments = [], doc_ids = []) => post('/api/ask', { question, top_k, amendments, doc_ids })
export const apiCalculate = (body) => post('/api/calculate', body)
export const apiRules     = () => get('/api/rules')

export async function apiUpload(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Upload error ${res.status}`)
  }
  return res.json()
}

export const apiDeleteUpload = (docId) =>
  fetch(`${BASE}/api/uploads/${docId}`, { method: 'DELETE' }).then(r => r.json())
