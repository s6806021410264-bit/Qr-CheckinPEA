/**
 * components/AdminShared.jsx
 * Components เล็ก ๆ ที่ใช้ร่วมกันหลาย page
 */

import { TOAST_ICON } from '../admin/hooks/useToasts'

// ── Skeleton loader ──────────────────────────────────────
export function SkeletonTable({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <div key={i} className="adm-skeleton sk-row" style={{ opacity: 1 - i * 0.15 }} />
  ))
}

export function SkeletonKpiGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="adm-skeleton sk-kpi" />)}
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────
export function EmptyState({ icon = '📋', message = 'ไม่พบข้อมูล' }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  )
}

// ── Toast list ───────────────────────────────────────────
export function ToastList({ toasts }) {
  return (
    <div className="adm-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`adm-toast toast-${t.type}`}>
          <span>{TOAST_ICON[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ── Live indicator ───────────────────────────────────────
export function LiveIndicator({ label = 'Live' }) {
  return (
    <div className="adm-live">
      <div className="adm-live-dot" />
      {label}
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null
  return (
    <div className="adm-pagination">
      <button className="adm-pg-btn" disabled={page === 1} onClick={() => onPageChange(p => p - 1)}>‹</button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          className={`adm-pg-btn${page === i + 1 ? ' active' : ''}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button className="adm-pg-btn" disabled={page === pages} onClick={() => onPageChange(p => p + 1)}>›</button>
    </div>
  )
}

export function Sparkline({ pts }) {
  const W = 300, H = 80
  const PAD_LEFT = 8, PAD_BOTTOM = 18, PAD_TOP = 8, PAD_RIGHT = 8
  const cW = W - PAD_LEFT - PAD_RIGHT
  const cH = H - PAD_TOP - PAD_BOTTOM

  const max = Math.max(...pts, 1) // baseline = 0 เสมอ

  const coords = pts.map((v, i) => ({
    x: PAD_LEFT + (i / (pts.length - 1)) * cW,
    y: PAD_TOP + cH - (v / max) * cH,
    v,
  }))

  const d = `M${coords.map(c => `${c.x},${c.y}`).join(' L')}`
  const fill = `M${PAD_LEFT},${PAD_TOP + cH} L${coords.map(c => `${c.x},${c.y}`).join(' L')} L${W - PAD_RIGHT},${PAD_TOP + cH} Z`

  // แสดงแค่ 4 label: 00:00, 06:00, 12:00, 18:00
  const xLabels = [0, 3, 6, 9].map(i => ({
    x: PAD_LEFT + (i / (pts.length - 1)) * cW,
    label: `${String(i * 2).padStart(2, '0')}:00`,
  }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="adm-sparkline">
      <defs>
        <linearGradient id="spark-lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={fill} fill="url(#spark-lg)" />
      <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* dot เฉพาะจุด peak สูงสุด */}
      {coords.map((c, i) => c.v === max && (
        <circle key={i} cx={c.x} cy={c.y} r="3" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />
      ))}

      {/* X label แค่ 4 จุด */}
      {xLabels.map(({ x, label }) => (
        <text key={label} x={x} y={H - 2} textAnchor="middle" fontSize="7" fill="#64748b">
          {label}
        </text>
      ))}
    </svg>
  )
}