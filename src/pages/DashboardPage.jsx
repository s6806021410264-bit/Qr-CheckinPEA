import { useMemo, useEffect, useState } from 'react'
import dayjs from 'dayjs'

import {
  SkeletonKpiGrid,
  SkeletonTable,
  EmptyState,
  Sparkline,
  LiveIndicator
} from '../components/AdminShared'

import { formatTime } from '../admin/utils/dateUtils'

import {
  getTodayCheckins,
  getAllUsers,
  getWeeklyCheckins   // ← ต้องมี
} from '../admin/services/adminDashboardService'

const KPI_CONFIG = [
  {
    icon: '👥',
    label: 'Today Check-ins',
    getValue: (checkins) => checkins.length,
    color: '#3b82f6',
    sub: () => (<><span style={{ color: '#22c55e' }}>↑</span> Live updating</>),
    bar: 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
  },
  {
    icon: '⚡',
    label: 'Not Checked-in',
    getValue: (checkins, usersOnly, checkedSet) =>
      Math.max(usersOnly.length - checkedSet.size, 0),
    color: '#f59e0b',
    sub: () => (<><span style={{ color: '#f59e0b' }}>●</span> Pending check-in</>),
    bar: 'linear-gradient(90deg,#f59e0b,#ef4444)',
  },
  {
    icon: '📅',
    label: 'This Week',
    getValue: (checkins, _, __, weeklyTotal) => weeklyTotal,
    sub: () => '7-day total',
    bar: 'linear-gradient(90deg,#f59e0b,#ef4444)',
  },
  {
    icon: '🟢',
    label: 'System Status',
    getValue: () => 'Operational',
    color: '#22c55e',
    valStyle: { fontSize: 20, paddingTop: 4 },
    sub: () => 'All services up',
    bar: 'linear-gradient(90deg,#22c55e,#84cc16)',
  },
]

export default function DashboardPage() {

  const [checkins, setCheckins] = useState([])
  const [users, setUsers] = useState([])
  const [weeklyCheckins, setWeeklyCheckins] = useState([])  // ← เพิ่ม
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [checkinsData, usersData, weeklyData] = await Promise.all([
          getTodayCheckins(),
          getAllUsers(),
          getWeeklyCheckins()   // ← เพิ่ม
        ])
        setCheckins(checkinsData)
        setUsers(usersData)
        setWeeklyCheckins(weeklyData)  // ← เพิ่ม
      } catch (err) {
        
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const usersOnly = useMemo(() => {
    return (users || []).filter(u => (u.role || '').toLowerCase() === 'user')
  }, [users])

  const checkedSet = useMemo(() => {
    return new Set((checkins || []).map(c => c.users?.id).filter(Boolean))
  }, [checkins])

  // ← ใช้ weeklyCheckins และแปลง UTC→BKK
  const weeklyData = useMemo(() => {
    const result = Array(7).fill(0)
    weeklyCheckins.forEach(c => {
      const idx = dayjs(c.created_at).day()
      result[idx]++
    })
    return result
  }, [weeklyCheckins])

  const weeklyTotal = useMemo(() => {
    return weeklyData.reduce((a, b) => a + b, 0)
  }, [weeklyData])

  // ← แปลง UTC→BKK ด้วย
  const linePoints = useMemo(() => {
    const result = Array(12).fill(0)
    checkins.forEach(c => {
      const hour = dayjs(c.created_at).hour()
      const idx = Math.floor(hour / 2)
      result[idx]++
    })
    return result
  }, [checkins])

  return (
    <>
      <div className="adm-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here's what's happening today.</p>
      </div>

      {loading ? (
        <SkeletonKpiGrid />
      ) : (
        <div className="adm-kpi-grid">
          {KPI_CONFIG.map(({ icon, label, getValue, color, valStyle = {}, sub: Sub, bar }) => {
            const value = getValue(checkins, usersOnly, checkedSet, weeklyTotal)
            return (
              <div key={label} className="adm-kpi">
                <div className="adm-kpi-icon">{icon}</div>
                <div className="adm-kpi-label">{label}</div>
                <div className="adm-kpi-val" style={{ color, ...valStyle }}>{value}</div>
                <div className="adm-kpi-sub"><Sub /></div>
                <div className="adm-kpi-bar" style={{ background: bar }} />
              </div>
            )
          })}
        </div>
      )}

      <div className="adm-grid2">

        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">Check-in Trend</div>
              <div className="adm-card-sub">Last 12 hours</div>
            </div>
          </div>
          <div className="adm-card-body">
            <Sparkline pts={linePoints} />
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">Daily Activity</div>
              <div className="adm-card-sub">This week</div>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-bars">
              {(() => {
                const max = Math.max(...weeklyData, 1)  // ← คำนวณนอก map
                return weeklyData.map((v, i) => (
                  <div key={i} className="adm-bar-wrap">
                    {v > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
                        {v}
                      </div>
                    )}
                    <div
                      className="adm-bar"
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                    <div className="adm-bar-lbl">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <div className="adm-card-title">Recent Check-ins</div>
            <div className="adm-card-sub">Today's activity</div>
          </div>
          <LiveIndicator />
        </div>
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: 20 }}><SkeletonTable rows={4} /></div>
          ) : checkins.length === 0 ? (
            <EmptyState icon="📋" message="No check-ins yet today" />
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Code</th><th>Time</th></tr>
              </thead>
              <tbody>
                {checkins.slice(0, 5).map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    <td>👤 {item.users?.name}</td>
                    <td>{item.users?.code}</td>
                    <td>{formatTime(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}