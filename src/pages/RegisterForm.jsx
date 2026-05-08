// src/pages/RegisterForm.jsx
import { useState, useRef, useEffect } from 'react'
import PageShell from '../components/PageShell'
import StatusBanner from '../components/StatusBanner'
import { registerAndCheckIn } from '../lib/checkinService'

export default function RegisterForm({ pendingCode, onSuccess, onBack }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const firstNameRef = useRef(null)

  useEffect(() => { firstNameRef.current?.focus() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    setLoading(true)
    setResult(null)

    const res = await registerAndCheckIn(firstName, lastName)
    setLoading(false)

    if (res.status === 'success') { onSuccess(res); return }
    setResult(res)
  }

  const canSubmit = firstName.trim() && lastName.trim() && !loading

  return (
    <PageShell logo="+" title="ลงทะเบียนใหม่" subtitle={`รหัส "${pendingCode}" ยังไม่มีในระบบ`}>
      <main className="card">
        <p className="card-hint">กรอกชื่อและนามสกุลเพื่อลงทะเบียน</p>
        <form onSubmit={handleSubmit} className="form">
          <input
            ref={firstNameRef}
            type="text"
            className="input"
            placeholder="ชื่อ เช่น สมชาย"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            disabled={loading}
            style={{ textTransform: 'none', letterSpacing: 'normal', textAlign: 'left' }}
            
          />
          <input
            type="text"
            className="input"
            placeholder="นามสกุล เช่น ใจดี"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            disabled={loading}
            style={{ textTransform: 'none', letterSpacing: 'normal', textAlign: 'left' }}
          />
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', textAlign: 'center' }}>
            ระบบจะออกรหัสให้อัตโนมัติ (WALK-XXXX)
          </p>
          <button type="submit" className="btn" disabled={!canSubmit}>
            {loading ? <span className="spinner" /> : 'ลงทะเบียน + Check-in'}
          </button>
          <button type="button" className="btn-back" onClick={onBack} disabled={loading}>
            ← กลับ
          </button>
        </form>
        <StatusBanner result={result} />
      </main>
    </PageShell>
  )
}