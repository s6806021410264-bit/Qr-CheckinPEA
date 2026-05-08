const CONFIG = {
  success: {
    icon: '✓',
    cls: 'status-success',
    message: 'ดำเนินการสำเร็จ',
  },
  duplicate: {
    icon: '!',
    cls: 'status-duplicate',
    message: 'คุณได้ลงชื่อเข้าร่วมแล้ว',
  },
  not_found: {
    icon: '×',
    cls: 'status-error',
    message: 'ไม่พบข้อมูลในระบบ',
  },
  no_event: {
    icon: '!',
    cls: 'status-warning',
    message: 'ยังไม่มีกิจกรรมสำหรับวันนี้',
  },
  invalid_format: {
    icon: '×',
    cls: 'status-error',
    message: 'รูปแบบข้อมูลไม่ถูกต้อง',
  },
  error: {
    icon: '!',
    cls: 'status-error',
    message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  },
}

export default function StatusBanner({ result }) {
  if (!result) return null
  const cfg = CONFIG[result.status] ?? CONFIG.error

  return (
    <div className={`result-banner ${cfg.cls}`} role="alert">
      <span className="result-icon">{cfg.icon}</span>
      <span className="result-msg">{result.message || cfg.message}</span>
    </div>
  )
}
