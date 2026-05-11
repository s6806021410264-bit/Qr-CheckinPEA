/**
 * components/pages/SettingsPage.jsx
 */
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayBangkok } from '../admin/utils/dateUtils'

const APP_VERSION = '1.0.0'

function StatusPill({ status }) {
  const config = {
    ok: { text: 'ปกติ', cls: 'badge-green' },
    warn: { text: 'ตรวจสอบ', cls: 'badge-amber' },
    error: { text: 'ผิดพลาด', cls: 'badge-admin' },
  }[status] || { text: 'ไม่ทราบสถานะ', cls: 'badge-user' }

  return <span className={`adm-badge ${config.cls}`}>{config.text}</span>
}

export default function SettingsPage({ toast }) {
  const [loading, setLoading] = useState(false)
  const [checks, setChecks] = useState([
    { key: 'database', label: 'ฐานข้อมูล', desc: 'Supabase REST API', status: 'warn', value: 'ยังไม่ได้ตรวจสอบ' },
    { key: 'event', label: 'กิจกรรมวันนี้', desc: 'กิจกรรมตามวันที่ประเทศไทย', status: 'warn', value: 'ยังไม่ได้ตรวจสอบ' },
    { key: 'realtime', label: 'อัปเดตสด', desc: 'Supabase Realtime client', status: 'ok', value: 'พร้อมใช้งาน' },
  ])

  async function runChecks() {
    setLoading(true)

    const nextChecks = []
    const today = getTodayBangkok()

    try {
      const { error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      nextChecks.push({
        key: 'database',
        label: 'ฐานข้อมูล',
        desc: 'Supabase REST API',
        status: error ? 'error' : 'ok',
        value: error ? error.message : 'เชื่อมต่อสำเร็จ',
      })
    } catch (err) {
      nextChecks.push({
        key: 'database',
        label: 'ฐานข้อมูล',
        desc: 'Supabase REST API',
        status: 'error',
        value: err.message,
      })
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('name, date')
        .eq('date', today)
        .maybeSingle()

      nextChecks.push({
        key: 'event',
        label: 'กิจกรรมวันนี้',
        desc: `วันที่ประเทศไทย ${today}`,
        status: error ? 'error' : data ? 'ok' : 'warn',
        value: error ? error.message : data ? data.name || data.date : 'ยังไม่มีกิจกรรมวันนี้',
      })
    } catch (err) {
      nextChecks.push({
        key: 'event',
        label: 'กิจกรรมวันนี้',
        desc: `วันที่ประเทศไทย ${today}`,
        status: 'error',
        value: err.message,
      })
    }

    nextChecks.push({
      key: 'realtime',
      label: 'อัปเดตสด',
      desc: 'ใช้กับรายการลงชื่อสดและ session admin',
      status: supabase.channel ? 'ok' : 'error',
      value: supabase.channel ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน',
    })

    setChecks(nextChecks)
    setLoading(false)
    toast?.('ตรวจสอบสถานะระบบแล้ว', 'success')
  }

  useEffect(() => {
    runChecks()
  }, [])

  return (
    <>
      <div className="adm-page-header">
        <h1>ตั้งค่า</h1>
        <p>สถานะระบบและข้อมูลแอปพลิเคชัน</p>
      </div>

      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">ตรวจสอบระบบ</div>
              <div className="adm-card-sub">ตรวจสอบจากการตั้งค่าปัจจุบัน</div>
            </div>
            <button className="adm-btn btn-ghost" onClick={runChecks} disabled={loading}>
              {loading ? 'กำลังตรวจสอบ...' : 'รีเฟรช'}
            </button>
          </div>
          {checks.map(({ key, label, desc, status, value }) => (
            <div className="adm-setting-row" key={key}>
              <div>
                <div className="adm-setting-title">{label}</div>
                <div className="adm-setting-desc">{desc}</div>
                <div className="adm-setting-desc" style={{ marginTop: 4 }}>{value}</div>
              </div>
              <StatusPill status={status} />
            </div>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-card-header"><div className="adm-card-title">ข้อมูลแอปพลิเคชัน</div></div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">เวอร์ชัน</span>
            <span className="adm-stat-val">{APP_VERSION}</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">สภาพแวดล้อม</span>
            <span className="adm-stat-val">ใช้งานจริง</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">เขตเวลา</span>
            <span className="adm-stat-val">Asia/Bangkok</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">รหัสสมัครใหม่</span>
            <span className="adm-stat-val">new-001+</span>
          </div>
        </div>
      </div>
    </>
  )
}
