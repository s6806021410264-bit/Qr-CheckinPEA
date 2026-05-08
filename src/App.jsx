import { useState, useEffect } from 'react'
import CheckInForm from './pages/CheckInForm'
import RegisterForm from './pages/RegisterForm'
import AlreadyDone from './pages/AlreadyDone'
import CheckInSuccess from './pages/CheckInSuccess'
import AdminDashboard from './admin/AdminDashboard'

const STORAGE_KEY = 'qr_checkin_done'
const ADMIN_KEY = 'admin_user'

export default function App() {
  const [doneRecord, setDoneRecord] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })

  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ADMIN_KEY)) } catch { return null }
  })

  const [page, setPage] = useState('checkin')
  const [pendingCode, setPendingCode] = useState('')
  const [successRecord, setSuccessRecord] = useState(null)
  const [alreadyRecord, setAlreadyRecord] = useState(null)

  useEffect(() => {
    if (page === 'admin-dashboard' && !admin) setPage('checkin')
  }, [page, admin])

  function handleSuccess(res) {
    const record = {
      code: res.user.code,
      name: res.user.name,
      position: res.user.position || '',
      date: new Date().toLocaleDateString('th-TH'),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    setDoneRecord(record)
    setSuccessRecord(record)
    setPage('success')
  }

  function handleDuplicate(res) {
    setAlreadyRecord({
      code: res.user?.code || '',
      name: res.user?.name || '',
      position: res.user?.position || '',
      date: new Date().toLocaleDateString('th-TH'),
    })
    setPage('already')
  }

  function handleNotFound(code) {
    setPendingCode(code)
    setPage('register')
  }

  function handleBack() {
    setPendingCode('')
    setPage('checkin')
  }

  function handleAdminFromCheckIn(user) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(user))
    setAdmin(user)
    setPage('admin-dashboard')
  }

  if (page === 'admin-dashboard' && admin)
    return <AdminDashboard />

  if (page === 'success' && successRecord)
    return <CheckInSuccess record={successRecord} />

  if (page === 'already' && alreadyRecord)
    return <AlreadyDone record={alreadyRecord} />

  if (doneRecord)
    return <AlreadyDone record={doneRecord} />

  if (page === 'register') {
    return (
      <RegisterForm
        pendingCode={pendingCode}
        onSuccess={handleSuccess}
        onBack={handleBack}
      />
    )
  }

  return (
    <CheckInForm
      onSuccess={handleSuccess}
      onNotFound={handleNotFound}
      onAdmin={handleAdminFromCheckIn}
      onDuplicate={handleDuplicate}
    />
  )
}