import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayCheckins, getWeeklyCheckins } from './services/adminDashboardService'
import { useToasts } from './hooks/useToasts'
import { ToastList } from '../components/AdminShared'
import DashboardPage from '../pages/DashboardPage'
import CheckinsPage from '../pages/CheckinsPage'
import UsersPage from '../pages/UsersPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import EventsPage from '../pages/EventsPage'
import { formatTime } from './utils/dateUtils'
import './styles/adminDashboard.css'

const NAV = [
       { id: 'dashboard', icon: '◈', label: 'Dashboard' },
       { id: 'checkins', icon: '✓', label: 'Check-ins' },
       { id: 'users', icon: '👥', label: 'Users' },
       { id: 'events', icon: '📅', label: 'Events' },
       { id: 'reports', icon: '📊', label: 'Reports' },
       { id: 'settings', icon: '⚙', label: 'Settings' },
]

function getAdminFromStorage() {
       try { return JSON.parse(localStorage.getItem('admin_user')) } catch { return null }
}

export default function AdminDashboard({ onLogout, theme, onToggleTheme }) {
       const [activePage, setActivePage] = useState('dashboard')

       // ← mobile เริ่มปิด sidebar อัตโนมัติ
       const [collapsed, setCollapsed] = useState(  () => window.innerWidth <= 768)

       const [checkins, setCheckins] = useState([])
       const [weeklyCheckins, setWeeklyCheckins] = useState([])
       const [loading, setLoading] = useState(true)
       const [notifOpen, setNotifOpen] = useState(false)
       const [unreadCount, setUnreadCount] = useState(0)
       const notifRef = useRef(null)
       const { toasts, toast } = useToasts()

       const admin = getAdminFromStorage()

       async function loadCheckins() {
              try {
                     setLoading(true)
                     const [data, weekly] = await Promise.all([
                            getTodayCheckins(),
                            getWeeklyCheckins()
                     ])
                     setCheckins(data)
                     setWeeklyCheckins(weekly)
              } catch (err) {
                     toast('Failed to load check-ins', 'error')
                     setCheckins([])
                     setWeeklyCheckins([])
              } finally {
                     setLoading(false)
              }
       }

       useEffect(() => {
              loadCheckins()

              const channel = supabase
                     .channel('checkins-live')
                     .on(
                            'postgres_changes',
                            { event: 'INSERT', schema: 'public', table: 'checkins' },
                            () => {
                                   loadCheckins()
                                   setUnreadCount(n => n + 1)
                                   toast('New check-in!', 'success')
                            }
                     )
                     .subscribe()

              return () => supabase.removeChannel(channel)
       }, [])

       useEffect(() => {
              function handleClickOutside(e) {
                     if (notifRef.current && !notifRef.current.contains(e.target)) {
                            setNotifOpen(false)
                     }
              }
              document.addEventListener('mousedown', handleClickOutside)
              return () => document.removeEventListener('mousedown', handleClickOutside)
       }, [])

       // ← ปิด sidebar อัตโนมัติเมื่อเปลี่ยน page บน mobile
       function handleNavClick(id) {
              setActivePage(id)
              if (window.innerWidth <= 768) setCollapsed(true)
       }

       function handleNotifOpen() {
              setNotifOpen(o => !o)
              setUnreadCount(0)
       }

       function handleLogout() {
              localStorage.removeItem('admin_user')
              onLogout ? onLogout() : window.location.reload()
       }

       const pageTitle = NAV.find(n => n.id === activePage)?.label || ''

       function renderPage() {
              switch (activePage) {
                     case 'dashboard': return <DashboardPage />
                     case 'checkins': return <CheckinsPage checkins={checkins} loading={loading} />
                     case 'users': return <UsersPage toast={toast} />
                     case 'events': return <EventsPage toast={toast} />
                     case 'reports': return <ReportsPage checkins={checkins} weeklyCheckins={weeklyCheckins} />
                     case 'settings': return <SettingsPage toast={toast} />
                     default: return null
              }
       }

       return (
              <div className="adm-root">

                     {/* ── overlay กดปิด sidebar บน mobile ── */}
                     {!collapsed && (
                            <div
                                   className="adm-sidebar-overlay"
                                   onClick={() => setCollapsed(true)}
                            />
                     )}

                     <aside className={`adm-sidebar${collapsed ? ' collapsed' : ''}`}>
                            <div className="adm-logo">
                                   <div className="adm-logo-icon">P</div>
                                   <div>
                                          <div className="adm-logo-text">PEA Admin</div>
                                          <div className="adm-logo-sub">Management System</div>
                                   </div>
                            </div>

                            <nav className="adm-nav">
                                   <div className="adm-nav-label">Menu</div>
                                   {NAV.map(item => (
                                          <button
                                                 key={item.id}
                                                 className={`adm-nav-item${activePage === item.id ? ' active' : ''}`}
                                                 onClick={() => handleNavClick(item.id)}  // ← ใช้ handleNavClick
                                          >
                                                 <span className="nav-icon">{item.icon}</span>
                                                 {item.label}
                                                 {item.id === 'checkins' && checkins.length > 0 && (
                                                        <span className="nav-badge">{checkins.length}</span>
                                                 )}
                                          </button>
                                   ))}
                            </nav>

                            <div className="adm-sidebar-footer">
                                   <div className="adm-user-info">
                                          <div className="adm-avatar">{admin?.name?.[0] || 'A'}</div>
                                          <div>
                                                 <div className="adm-user-name">{admin?.name || 'Admin'}</div>
                                                
                                          </div>
                                   </div>
                            </div>
                     </aside>

                     <main className={`adm-main${collapsed ? ' expanded' : ''}`}>
                            <div className="adm-topbar">
                                   <button className="adm-toggle-btn" onClick={() => setCollapsed(c => !c)}>
                                          {collapsed ? '☰' : '←'}  {/* ← hamburger บน mobile */}
                                   </button>
                                   <span className="adm-topbar-title">{pageTitle}</span>

                                   <div className="adm-topbar-right">
                                          <button className="adm-icon-btn" title="Refresh" onClick={loadCheckins}>↻</button>
                                          {onToggleTheme && (
                                                 <button
                                                        className="adm-icon-btn"
                                                        title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
                                                        onClick={onToggleTheme}
                                                 >
                                                        {theme === 'light' ? '☾' : '☀'}
                                                 </button>
                                          )}

                                          <div ref={notifRef} style={{ position: 'relative' }}>
                                                 <button className="adm-icon-btn" title="Notifications" onClick={handleNotifOpen}>
                                                        🔔
                                                        {unreadCount > 0 && (
                                                               <div style={{
                                                                      position: 'absolute', top: 6, right: 6,
                                                                      width: 8, height: 8,
                                                                      background: 'var(--red)',
                                                                      borderRadius: '50%',
                                                                      border: '1.5px solid var(--bg)',
                                                               }} />
                                                        )}
                                                 </button>

                                                 {notifOpen && (
                                                        <div style={{
                                                               position: 'absolute', top: 42, right: 0,
                                                               width: 300,
                                                               background: 'var(--surface)',
                                                               border: '1px solid var(--border2)',
                                                               borderRadius: 'var(--radius-lg)',
                                                               boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                               zIndex: 300,
                                                               overflow: 'hidden',
                                                               // ← กัน popup เกินจอบน mobile
                                                               maxWidth: 'calc(100vw - 24px)',
                                                        }}>
                                                               <div style={{
                                                                      padding: '14px 16px',
                                                                      borderBottom: '1px solid var(--border)',
                                                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                               }}>
                                                                      <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Check-ins</span>
                                                                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{checkins.length} today</span>
                                                               </div>

                                                               <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                                                      {checkins.length === 0 ? (
                                                                             <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                                                                                    No check-ins yet today
                                                                             </div>
                                                                      ) : (
                                                                             checkins.slice(0, 8).map((item, i) => (
                                                                                    <div key={item.id} style={{
                                                                                           display: 'flex', alignItems: 'center', gap: 10,
                                                                                           padding: '10px 16px',
                                                                                           borderBottom: i < Math.min(checkins.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                                                                                    }}>
                                                                                           <div style={{
                                                                                                  width: 32, height: 32,
                                                                                                  background: 'var(--accent-bg)',
                                                                                                  borderRadius: '50%',
                                                                                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                                  fontSize: 14, flexShrink: 0
                                                                                           }}>👤</div>
                                                                                           <div style={{ flex: 1, minWidth: 0 }}>
                                                                                                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                         {item.users?.name || '—'}
                                                                                                  </div>
                                                                                                  <div style={{ fontSize: 11, color: 'var(--muted2)' }}>
                                                                                                         {item.users?.code}
                                                                                                  </div>
                                                                                           </div>
                                                                                           <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
                                                                                                  {formatTime(item.created_at)}
                                                                                           </div>
                                                                                    </div>
                                                                             ))
                                                                      )}
                                                               </div>

                                                               {checkins.length > 8 && (
                                                                      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                                                                             <button
                                                                                    style={{ background: 'none', border: 'none', color: 'var(--accent2)', fontSize: 12, cursor: 'pointer' }}
                                                                                    onClick={() => { handleNavClick('checkins'); setNotifOpen(false) }}
                                                                             >
                                                                                    View all {checkins.length} check-ins →
                                                                             </button>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 )}
                                          </div>

                                          <button className="adm-logout-btn" onClick={handleLogout}>
                                                 ⏻ <span className="adm-logout-text">Logout</span>
                                          </button>
                                   </div>
                            </div>

                            <div className="adm-content">
                                   {renderPage()}
                            </div>
                     </main>

                     <ToastList toasts={toasts} />
              </div>
       )
}
