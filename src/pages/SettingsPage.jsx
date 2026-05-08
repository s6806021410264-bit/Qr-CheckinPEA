/**
 * components/pages/SettingsPage.jsx
 */
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayBangkok } from '../admin/utils/dateUtils'

const APP_VERSION = '1.0.0'

function StatusPill({ status }) {
  const config = {
    ok: { text: 'OK', cls: 'badge-green' },
    warn: { text: 'Check', cls: 'badge-amber' },
    error: { text: 'Error', cls: 'badge-admin' },
  }[status] || { text: 'Unknown', cls: 'badge-user' }

  return <span className={`adm-badge ${config.cls}`}>{config.text}</span>
}

export default function SettingsPage({ toast }) {
  const [loading, setLoading] = useState(false)
  const [checks, setChecks] = useState([
    { key: 'database', label: 'Database', desc: 'Supabase REST API', status: 'warn', value: 'Not checked' },
    { key: 'event', label: 'Today Event', desc: 'Event configured for current Bangkok date', status: 'warn', value: 'Not checked' },
    { key: 'realtime', label: 'Realtime', desc: 'Supabase realtime client available', status: 'ok', value: 'Client ready' },
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
        label: 'Database',
        desc: 'Supabase REST API',
        status: error ? 'error' : 'ok',
        value: error ? error.message : 'Connected',
      })
    } catch (err) {
      nextChecks.push({
        key: 'database',
        label: 'Database',
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
        label: 'Today Event',
        desc: `Bangkok date ${today}`,
        status: error ? 'error' : data ? 'ok' : 'warn',
        value: error ? error.message : data ? data.name || data.date : 'No event today',
      })
    } catch (err) {
      nextChecks.push({
        key: 'event',
        label: 'Today Event',
        desc: `Bangkok date ${today}`,
        status: 'error',
        value: err.message,
      })
    }

    nextChecks.push({
      key: 'realtime',
      label: 'Realtime',
      desc: 'Used by live check-ins and admin session presence',
      status: supabase.channel ? 'ok' : 'error',
      value: supabase.channel ? 'Client ready' : 'Unavailable',
    })

    setChecks(nextChecks)
    setLoading(false)
    toast?.('System checks refreshed', 'success')
  }

  useEffect(() => {
    runChecks()
  }, [])

  return (
    <>
      <div className="adm-page-header">
        <h1>Settings</h1>
        <p>System status and application information</p>
      </div>

      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <div className="adm-card-title">System Checks</div>
              <div className="adm-card-sub">Live checks from the current configuration</div>
            </div>
            <button className="adm-btn btn-ghost" onClick={runChecks} disabled={loading}>
              {loading ? 'Checking...' : 'Refresh'}
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
          <div className="adm-card-header"><div className="adm-card-title">Application Info</div></div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">Version</span>
            <span className="adm-stat-val">{APP_VERSION}</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">Environment</span>
            <span className="adm-stat-val">Production</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">Timezone</span>
            <span className="adm-stat-val">Asia/Bangkok</span>
          </div>
          <div className="adm-stat-row">
            <span className="adm-stat-label">Registration Code</span>
            <span className="adm-stat-val">new-001+</span>
          </div>
        </div>
      </div>
    </>
  )
}
