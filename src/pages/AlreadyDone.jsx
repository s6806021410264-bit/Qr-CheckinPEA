import PageShell from '../components/PageShell'

export default function AlreadyDone({ record }) {
  return (
    <PageShell logo="✓" title="ลงชื่อแล้ว">
      <main className="card" style={{ textAlign: 'center', gap: '8px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '.95rem' }}>
          คุณได้ลงชื่อเข้าร่วมแล้ว
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
          {record.name} 
        </p>
        
        <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
          ตำแหน่ง : {record.position} 
        </p>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
         {record.code} · {record.date}
        </p>
      </main>
    </PageShell>
  )
}