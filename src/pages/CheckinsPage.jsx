/**
 * components/pages/CheckinsPage.jsx
 */
import { useState, useEffect, useRef } from 'react'
import { SkeletonTable, EmptyState, LiveIndicator } from '../components/AdminShared'
import { formatDate, formatTime } from '../admin/utils/dateUtils'

export default function CheckinsPage({ checkins, loading }) {
  const [filterDate, setFilterDate] = useState('')
  const [newIds, setNewIds]         = useState(new Set())
  const prevLen                     = useRef(checkins.length)

  // ไฮไลท์แถวที่เพิ่งเข้ามาใหม่
  useEffect(() => {
    if (checkins.length > prevLen.current) {
      const freshIds = new Set(
        checkins.slice(0, checkins.length - prevLen.current).map(c => c.id)
      )
      setNewIds(freshIds)
      setTimeout(() => setNewIds(new Set()), 3000)
    }
    prevLen.current = checkins.length
  }, [checkins])

  const filtered = filterDate
    ? checkins.filter(c => c.created_at.startsWith(filterDate))
    : checkins

  return (
    <>
      <div className="adm-page-header">
        <h1>Check-ins</h1>
        <p>Real-time attendance log</p>
      </div>

      <div className="adm-filter-bar">
        <input
          type="date"
          className="adm-input"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button className="adm-btn btn-ghost" onClick={() => setFilterDate('')}>Clear</button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <LiveIndicator label="Realtime" />
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading
            ? <div style={{ padding: 20 }}><SkeletonTable /></div>
            : filtered.length === 0
              ? <EmptyState icon="🔍" message="No check-ins found" />
              : (
                <table className="adm-table">
                  <thead><tr><th>#</th><th>Name</th><th>Code</th><th>Date</th><th>Time</th></tr></thead>
                  <tbody>
                    {filtered.map((item, i) => (
                      <tr key={item.id} className={newIds.has(item.id) ? 'new-row' : ''}>
                        <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>👤 {item.users?.name}</td>
                        <td><span className="adm-badge badge-user">{item.users?.code}</span></td>
                        <td style={{ color: 'var(--muted2)' }}>{formatDate(item.created_at)}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted2)' }}>
                          {formatTime(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          }
        </div>
      </div>
    </>
  )
}
