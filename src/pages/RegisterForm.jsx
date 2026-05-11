import { useState, useRef, useEffect } from 'react'
import PageShell from '../components/PageShell'
import StatusBanner from '../components/StatusBanner'
import { registerWalkInUser } from '../lib/registerService'
import { performCheckIn } from '../lib/checkinService'
import { getPositionOptions } from '../lib/positions'

export default function RegisterForm({ onSuccess, onBack, theme, onToggleTheme }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [positionOptions, setPositionOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const firstNameRef = useRef(null)

  useEffect(() => {
    firstNameRef.current?.focus()
  }, [])

  useEffect(() => {
    let active = true

    async function loadPositions() {
      const options = await getPositionOptions()
      if (active) setPositionOptions(options)
    }

    loadPositions()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !position) return

    setLoading(true)
    setResult(null)

    try {
      const user = await registerWalkInUser({ firstName, lastName, position })
      const checkinResult = await performCheckIn(user.code)

      if (checkinResult.status === 'success') {
        onSuccess?.(checkinResult)
        setFirstName('')
        setLastName('')
        setPosition('')
        return
      }

      setResult({
        ...checkinResult,
        message: checkinResult.message || `ลงทะเบียนสำเร็จ รหัสของคุณคือ ${user.code}`,
      })
    } catch (err) {
      console.error(err)

      setResult({
        status: 'error',
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      })
    } finally {
      setLoading(false)
    }
  }

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    position &&
    !loading

  return (
    <PageShell
      logo="+"
      title="ลงทะเบียนผู้ใช้งานใหม่"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <main className="card">
        <p className="card-hint">
          กรอกข้อมูลให้ครบ ระบบจะออกรหัส new-xxx และ check-in ให้อัตโนมัติ
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            ref={firstNameRef}
            type="text"
            className="input"
            placeholder="ชื่อ"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            disabled={loading}
            maxLength={80}
          />

          <input
            type="text"
            className="input"
            placeholder="นามสกุล"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            disabled={loading}
            maxLength={80}
          />

          <select
            className="input"
            value={position}
            onChange={e => setPosition(e.target.value)}
            disabled={loading}
          >
            <option value="">เลือกตำแหน่ง</option>
            {positionOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button type="submit" className="btn" disabled={!canSubmit}>
            {loading ? <span className="spinner" /> : 'สมัครและ Check-in'}
          </button>

          <button
            type="button"
            className="btn-back"
            onClick={onBack}
            disabled={loading}
          >
            ← กลับ
          </button>
        </form>

        <StatusBanner result={result} />
      </main>
    </PageShell>
  )
}
