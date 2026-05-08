import { useState, useRef } from 'react'
import PageShell from '../components/PageShell'
import StatusBanner from '../components/StatusBanner'
import { performCheckIn } from '../lib/checkinService'

export default function CheckInForm({
  onSuccess,
  onAdmin,
  onDuplicate,
  onGoRegister,
  externalResult,
  theme,
  onToggleTheme,
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const inputRef = useRef(null)

  const hasInput = code.trim().length > 0
  const canSubmit = hasInput && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const submittedCode = code.trim()
    setLoading(true)
    setResult(null)

    try {
      const res = await performCheckIn(submittedCode)
      setCode('')

      if (res.status === 'success') {
        if (res.user?.role === 'admin') {
          onAdmin?.(res.user)
          return
        }

        onSuccess?.(res)
        return
      }

      if (res.status === 'duplicate') {
        onDuplicate?.(res)
        return
      }

      if (res.status === 'not_found') {
        setResult(res)
        inputRef.current?.focus()
        return
      }

      setResult(res)
      inputRef.current?.focus()
    } catch (err) {
      console.error(err)
      setResult({
        status: 'error',
        message: 'ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง',
      })
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      logo="PEA"
      title="ลงชื่อเข้าร่วม"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <main className="card">
        <p className="card-hint">กรอกรหัสพนักงาน</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="รหัสพนักงาน"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoComplete="off"
            disabled={loading}
            maxLength={50}
          />

          <button type="submit" className="btn" disabled={!canSubmit}>
            {loading ? <span className="spinner" /> : 'ยืนยัน Check-in'}
          </button>
        </form>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onGoRegister?.()}
            disabled={loading}
          >
            สมัครใช้งาน
          </button>
        </div>

        <StatusBanner result={externalResult || result} />
      </main>
    </PageShell>
  )
}
