import { useState, useRef } from 'react'
import PageShell from '../components/PageShell'
import StatusBanner from '../components/StatusBanner'
import { performCheckIn, isValidCodeFormat } from '../lib/checkinService'

export default function CheckInForm({ onSuccess, onNotFound, onAdmin, onDuplicate }) {  // ← เพิ่ม onDuplicate
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  const normalized = code.trim().toUpperCase()
  const hasInput = normalized.length > 0
  const formatInvalid = hasInput && !isValidCodeFormat(normalized)
  const canSubmit = hasInput && !formatInvalid && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setResult(null)

    const res = await performCheckIn(normalized)

    setLoading(false)
    setCode('')

    if (res.status === 'not_found') {
      onNotFound(normalized)
      return
    }

    if (res.status === 'success') {
      if (res.user?.role === 'admin') {
        onAdmin?.(res.user)
        return
      }
      onSuccess(res)
      return
    }

    // ← เพิ่ม: พาไปหน้า AlreadyDone แทนแสดง banner
    if (res.status === 'duplicate') {
      onDuplicate?.(res)
      return
    }

    setResult(res)
    inputRef.current?.focus()
  }

  return (
    <PageShell logo="PEA" title="ลงชื่อเข้าร่วม">
      <main className="card">
        <p className="card-hint">กรอกรหัสพนักงาน</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            ref={inputRef}
            type="text"
            className={`input ${formatInvalid ? 'input-error' : ''}`}
            placeholder="เช่น EMP001"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            disabled={loading}
            maxLength={20}
          />

          {formatInvalid && (
            <p style={{ fontSize: '.82rem', color: 'var(--error, #e53e3e)', textAlign: 'center' }}>
              รูปแบบรหัสไม่ถูกต้อง — ตัวอย่าง: EMP001 หรือ WALK-0001
            </p>
          )}

          <button type="submit" className="btn" disabled={!canSubmit}>
            {loading ? <span className="spinner" /> : 'ยืนยัน Check-in'}
          </button>
        </form>

        <StatusBanner result={result} />
      </main>
    </PageShell>
  )
}