import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { EmptyState } from '../components/AdminShared'
import { formatDate, formatTime } from '../admin/utils/dateUtils'
import { getMonthlyCheckins } from '../admin/services/adminDashboardService'

const PER_PAGE = 10

function exportCSV(checkins, label) {
  const rows = [['#', 'Name', 'Code', 'Position', 'Date', 'Time']]
  checkins.forEach((item, i) => {
    rows.push([
      i + 1,
      item.users?.name || '',
      item.users?.code || '',
      item.users?.position || '',
      formatDate(item.created_at),
      formatTime(item.created_at),
    ])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `checkins_${label}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage({ checkins, weeklyCheckins = [] }) {

  const now = dayjs()
  const [selectedYear, setSelectedYear] = useState(now.year())
  const [selectedMonth, setSelectedMonth] = useState(now.month() + 1)
  const [monthlyData, setMonthlyData] = useState([])
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [openDay, setOpenDay] = useState(null)  // ← วันที่เปิดอยู่

  useEffect(() => {
    async function load() {
      setLoadingMonth(true)
      setOpenDay(null)
      try {
        const data = await getMonthlyCheckins(selectedYear, selectedMonth)
        setMonthlyData(data)

        // ← เปิดวันล่าสุดอัตโนมัติ
        if (data.length > 0) {
          const latest = dayjs(data[0].created_at).format('YYYY-MM-DD')
          setOpenDay(latest)
        }
      } catch (err) {
        setMonthlyData([])
      } finally {
        setLoadingMonth(false)
      }
    }
    load()
  }, [selectedYear, selectedMonth])

  // ── Today summary ──
  const byHour = Array(24).fill(0)
  checkins.forEach(c => { byHour[dayjs(c.created_at).hour()]++ })
  const peakHour = byHour.indexOf(Math.max(...byHour))

  // ── Monthly bar รายวัน ──
  const daysInMonth = dayjs(`${selectedYear}-${selectedMonth}-01`).daysInMonth()
  const monthBarData = Array(daysInMonth).fill(0)
  monthlyData.forEach(c => {
    const d = dayjs(c.created_at).date() - 1
    monthBarData[d]++
  })
  const maxMonthBar = Math.max(...monthBarData, 1)

  // ← group by วัน เรียงล่าสุดก่อน
  const groupedByDay = monthlyData.reduce((acc, item) => {
    const day = dayjs(item.created_at).format('YYYY-MM-DD')
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a))

  const monthLabel = dayjs(`${selectedYear}-${selectedMonth}-01`).format('MMMM YYYY')
  const years = Array.from({ length: 3 }, (_, i) => now.year() - i)
  const months = [
    { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
    { v: 4, l: 'April' }, { v: 5, l: 'May' }, { v: 6, l: 'June' },
    { v: 7, l: 'July' }, { v: 8, l: 'August' }, { v: 9, l: 'September' },
    { v: 10, l: 'October' }, { v: 11, l: 'November' }, { v: 12, l: 'December' },
  ]

  return (
    <>
      <div className="adm-page-header">
        <h1>Reports</h1>
        <p>Summary statistics and exports</p>
      </div>

      {/* ── TODAY SUMMARY ── */}
      <div className="adm-card" style={{ marginBottom: 24 }}>
        <div className="adm-card-header">
          <div className="adm-card-title">Today's Summary</div>
          <button className="adm-export-btn" onClick={() => exportCSV(checkins, dayjs().format('YYYY-MM-DD'))}>
            ⬇ Export CSV
          </button>
        </div>
        <div className="adm-stat-row">
          <span className="adm-stat-label">Total Check-ins</span>
          <span className="adm-stat-val">{checkins.length}</span>
        </div>
        <div className="adm-stat-row">
          <span className="adm-stat-label">Peak Hour</span>
          <span className="adm-stat-val">{checkins.length > 0 ? `${peakHour}:00` : '—'}</span>
        </div>
        <div className="adm-stat-row">
          <span className="adm-stat-label">Walk-in Users</span>
          <span className="adm-stat-val">{checkins.filter(c => c.users?.code?.startsWith('WALK')).length}</span>
        </div>
        <div className="adm-stat-row">
          <span className="adm-stat-label">Staff Users</span>
          <span className="adm-stat-val">{checkins.filter(c => c.users?.code?.startsWith('EMP')).length}</span>
        </div>
      </div>

      {/* ── MONTHLY REPORT ── */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <div className="adm-card-title">Monthly Report</div>
            <div className="adm-card-sub">{monthLabel} — {monthlyData.length} check-ins</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="adm-select" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="adm-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="adm-export-btn" onClick={() => exportCSV(monthlyData, `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`)}>
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {/* Bar chart รายวัน */}
        <div className="adm-card-body">
          {loadingMonth ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div className="adm-bars" style={{ height: 120, minWidth: daysInMonth * 28, gap: 3 }}>
                {monthBarData.map((v, i) => (
                  <div
                    key={i}
                    className="adm-bar-wrap"
                    style={{ height: '100%', justifyContent: 'flex-end', minWidth: 20, cursor: v > 0 ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (v === 0) return
                      const d = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
                      setOpenDay(prev => prev === d ? null : d)  // ← กดที่ bar เพื่อเปิด/ปิด section
                    }}
                  >
                    {v > 0 && (
                      <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2, textAlign: 'center' }}>{v}</div>
                    )}
                    <div className="adm-bar" style={{
                      height: `${(v / maxMonthBar) * 100}%`,
                      opacity: openDay === `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}` ? 1 : 0.6,
                    }} />
                    <div className="adm-bar-lbl" style={{ fontSize: 8 }}>{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SESSION BY DAY ── */}
        {!loadingMonth && (
          monthlyData.length === 0 ? (
            <EmptyState icon="📊" message={`No check-ins in ${monthLabel}`} />
          ) : (
            <div style={{ padding: '0 0 8px' }}>
              {sortedDays.map(day => {
                const items = groupedByDay[day]
                const isOpen = openDay === day
                const dayLabel = dayjs(day).format('dddd, D MMMM YYYY')

                return (
                  <div key={day} style={{ borderTop: '1px solid var(--border)' }}>

                    {/* ── Day header — กดเปิด/ปิด ── */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        background: isOpen ? 'rgba(59,130,246,0.06)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => setOpenDay(prev => prev === day ? null : day)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? 'var(--accent2)' : 'var(--text)' }}>
                          {dayLabel}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          padding: '2px 8px', borderRadius: 20,
                          background: 'var(--accent-bg)', color: 'var(--accent2)'
                        }}>
                          {items.length} คน
                        </span>
                      </div>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* ── Table ── */}
                    {isOpen && (
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Code</th>
                              <th>Position</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, i) => (
                              <tr key={item.id}>
                                <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                                <td>{item.users?.name}</td>
                                <td><span className="adm-badge badge-user">{item.users?.code}</span></td>
                                <td style={{ color: 'var(--muted2)', fontSize: 12 }}>{item.users?.position || '—'}</td>
                                <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted2)' }}>{formatTime(item.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </>
  )
}