/**
 * components/pages/SettingsPage.jsx
 */
import { useState } from 'react'

const SETTING_ITEMS = [
  { key: 'realtime', label: 'Realtime Updates', desc: 'Live check-in feed via Supabase' },
  { key: 'walkin',   label: 'Allow Walk-in',    desc: 'Let unregistered users check in' },
  { key: 'notif',    label: 'Notifications',    desc: 'Push alerts for new check-ins' },
]

const SYSTEM_INFO = [
  { label: 'Database',    value: 'Supabase ✓', color: 'var(--green)' },
  { label: 'Realtime',    value: 'Connected ✓', color: 'var(--green)' },
  { label: 'Version',     value: '1.0.0' },
  { label: 'Environment', value: 'Production' },
]

export default function SettingsPage({ toast }) {
  const [toggles, setToggles] = useState({ realtime: true, walkin: true, notif: false })

  function toggle(key) {
    setToggles(t => ({ ...t, [key]: !t[key] }))
    toast('Setting saved', 'success')
  }

  return (
    <>
      <div className="adm-page-header">
        <h1>Settings</h1>
        <p>System configuration</p>
      </div>

      <div className="adm-grid2">
        <div className="adm-card">
          <div className="adm-card-header"><div className="adm-card-title">System Config</div></div>
          {SETTING_ITEMS.map(({ key, label, desc }) => (
            <div className="adm-setting-row" key={key}>
              <div>
                <div className="adm-setting-title">{label}</div>
                <div className="adm-setting-desc">{desc}</div>
              </div>
              <div className={`adm-toggle${toggles[key] ? ' on' : ''}`} onClick={() => toggle(key)}>
                <div className="adm-toggle-thumb" />
              </div>
            </div>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-card-header"><div className="adm-card-title">System Info</div></div>
          {SYSTEM_INFO.map(({ label, value, color }) => (
            <div key={label} className="adm-stat-row">
              <span className="adm-stat-label">{label}</span>
              <span className="adm-stat-val" style={color ? { color } : undefined}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
