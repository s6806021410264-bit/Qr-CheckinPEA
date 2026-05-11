/**
 * components/pages/CheckinsPage.jsx
 */
import { useState, useEffect, useRef } from 'react'
import { SkeletonTable, EmptyState, LiveIndicator } from '../components/AdminShared'
import { formatDate, formatTime, getTodayBangkok } from '../admin/utils/dateUtils'
import { getCheckinsByDate } from '../admin/services/adminDashboardService'

export default function CheckinsPage({ checkins, loading }) {
  const [filterDate, setFilterDate] = useState('')
  const [historyCheckins, setHistoryCheckins] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [newIds, setNewIds] = useState(new Set())
  const prevLen = useRef(checkins.length)

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

  useEffect(() => {
    let active = true

    async function loadHistory() {
      if (!filterDate || filterDate === getTodayBangkok()) {
        setHistoryCheckins([])
        setHistoryError('')
        return
      }

      setHistoryLoading(true)
      setHistoryError('')

      try {
        const data = await getCheckinsByDate(filterDate)
        if (active) setHistoryCheckins(data)
      } catch (err) {
        if (active) {
          setHistoryCheckins([])
          setHistoryError(err.message || 'Failed to load check-ins')
        }
      } finally {
        if (active) setHistoryLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [filterDate])

  const showingHistory = Boolean(filterDate && filterDate !== getTodayBangkok())
  const tableLoading = showingHistory ? historyLoading : loading
  const rows = showingHistory ? historyCheckins : checkins

  return (
    <>
      <div className="adm-page-header">
        <h1>รายการลงชื่อ</h1>
        <p>บันทึกการเข้าร่วมแบบอัปเดตสด</p>
      </div>

      <div className="adm-filter-bar">
        <input
          type="date"
          className="adm-input"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        {filterDate && (
          <button className="adm-btn btn-ghost" onClick={() => setFilterDate('')}>ล้างตัวกรอง</button>
        )}
        {!showingHistory && (
          <div style={{ marginLeft: 'auto' }}>
            <LiveIndicator label="อัปเดตสด" />
          </div>
        )}
      </div>

      {historyError && (
        <div className="adm-card" style={{ marginBottom: 12, padding: 14, color: 'var(--red)' }}>
          {historyError}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-table-wrap">
          {tableLoading
            ? <div style={{ padding: 20 }}><SkeletonTable /></div>
            : rows.length === 0
              ? <EmptyState icon="🔍" message="ไม่พบรายการลงชื่อ" />
              : (
                <table className="adm-table">
                  <thead><tr><th>#</th><th>ชื่อ</th><th>รหัส</th><th>วันที่</th><th>เวลา</th></tr></thead>
                  <tbody>
                    {rows.map((item, i) => (
                      <tr key={item.id} className={!showingHistory && newIds.has(item.id) ? 'new-row' : ''}>
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
