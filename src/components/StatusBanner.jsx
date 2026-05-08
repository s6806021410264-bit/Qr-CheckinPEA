// src/components/StatusBanner.jsx
const CONFIG = {
  success: { icon: '✓', cls: 'status-success' },
  duplicate: { icon: '⚠', cls: 'status-duplicate' },
  not_found: { icon: '✗', cls: 'status-error' },
  no_event: { icon: '📅', cls: 'status-warning' },
  invalid_format: { icon: '✗', cls: 'status-error' },
  error: { icon: '!', cls: 'status-error' },
}

export default function StatusBanner({ result }) {
  if (!result) return null
  const cfg = CONFIG[result.status] ?? CONFIG.error
  return (
    <div className={`result-banner ${cfg.cls}`} role="alert">
      <span className="result-icon">{cfg.icon}</span>
      <span className="result-msg">{result.message}</span>
    </div>
  )
}
