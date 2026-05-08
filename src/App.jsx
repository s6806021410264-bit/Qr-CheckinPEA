import { useState, useEffect } from 'react'
import CheckInForm from './pages/CheckInForm'
import RegisterForm from './pages/RegisterForm'
import AlreadyDone from './pages/AlreadyDone'
import CheckInSuccess from './pages/CheckInSuccess'
import AdminDashboard from './admin/AdminDashboard'
import { startAdminSession, endAdminSession } from './lib/adminSession'
import { useTheme } from './lib/theme'

const ADMIN_KEY = 'admin_user'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [admin, setAdmin] = useState(null)

  const [page, setPage] = useState('checkin')
  const [successRecord, setSuccessRecord] = useState(null)
  const [alreadyRecord, setAlreadyRecord] = useState(null)
  const [adminSession, setAdminSession] = useState(null)
  const [checkInResult, setCheckInResult] = useState(null)

  useEffect(() => {
    if (page === 'admin-dashboard' && !admin) {
      setPage('checkin')
    }
  }, [page, admin])

  useEffect(() => {
    return () => {
      endAdminSession(adminSession)
    }
  }, [adminSession])

  function handleSuccess(res) {
    const record = {
      code: res.user.code,
      name: res.user.name,
      position: res.user.position || '',
      date: new Date().toLocaleDateString('th-TH'),
    }

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

  function handleBack() {
    setCheckInResult(null)
    setPage('checkin')
  }

  async function handleAdminFromCheckIn(user) {
    const session = await startAdminSession(user)

    if (!session.ok) {
      setCheckInResult({
        status: 'error',
        message: session.message || 'รหัส admin นี้กำลังใช้งานอยู่ในเครื่องอื่น',
      })
      setPage('checkin')
      return
    }

    localStorage.setItem(ADMIN_KEY, JSON.stringify(user))
    setAdmin(user)
    setAdminSession(session)
    setCheckInResult(null)
    setPage('admin-dashboard')
  }

  function handleGoRegister() {
    setCheckInResult(null)
    setPage('register')
  }

  async function handleLogout() {
    await endAdminSession(adminSession)
    setAdminSession(null)
    setAdmin(null)
    localStorage.removeItem(ADMIN_KEY)
    setPage('checkin')
  }

  if (page === 'admin-dashboard' && admin) {
    return (
      <AdminDashboard
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'success' && successRecord) {
    return <CheckInSuccess record={successRecord} />
  }

  if (page === 'already' && alreadyRecord) {
    return <AlreadyDone record={alreadyRecord} />
  }

  if (page === 'register') {
    return (
      <RegisterForm
        onSuccess={handleSuccess}
        onBack={handleBack}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <CheckInForm
      onSuccess={handleSuccess}
      onAdmin={handleAdminFromCheckIn}
      onDuplicate={handleDuplicate}
      onGoRegister={handleGoRegister}
      externalResult={checkInResult}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  )
}
