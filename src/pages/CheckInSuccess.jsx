import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'

export default function CheckInSuccess({ record }) {
       const [show, setShow] = useState(false)

       useEffect(() => {
              const t = setTimeout(() => setShow(true), 50)
              return () => clearTimeout(t)
       }, [])

       return (
              <PageShell logo="PEA" title="">
                     <main className="card" style={{
                            textAlign: 'center',
                            gap: 0,
                            padding: '40px 28px',
                            transition: 'opacity 0.4s ease, transform 0.4s ease',
                            opacity: show ? 1 : 0,
                            transform: show ? 'translateY(0)' : 'translateY(12px)',
                     }}>

                            {/* ── checkmark circle ── */}
                            <div style={{
                                   width: 80, height: 80,
                                   borderRadius: '50%',
                                   background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   margin: '0 auto 20px',
                                   boxShadow: '0 0 0 12px rgba(34,197,94,0.12), 0 4px 20px rgba(34,197,94,0.3)',
                            }}>
                                   <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                   </svg>
                            </div>

                            {/* ── status ── */}
                            <p style={{
                                   fontSize: '.8rem',
                                   fontWeight: 600,
                                   letterSpacing: '1.5px',
                                   textTransform: 'uppercase',
                                   color: '#22c55e',
                                   marginBottom: 10,
                            }}>
                                   Check-in สำเร็จ
                            </p>

                            {/* ── name ── */}
                            <p style={{
                                   fontSize: '1.5rem',
                                   fontWeight: 700,
                                   color: 'var(--text, #1a1a1a)',
                                   marginBottom: 6,
                                   lineHeight: 1.2,
                            }}>
                                   {record.name}
                            </p>

                            {/* ── code + date ── */}
                            <p style={{
                                   fontSize: '.85rem',
                                   color: 'var(--muted, #888)',
                                   marginBottom: 28,
                            }}>
                                   {record.code} · {record.date}
                            </p>

                            {/* ── divider ── */}
                            <div style={{
                                   height: 1,
                                   background: 'rgba(0,0,0,0.06)',
                                   marginBottom: 20,
                            }} />

                            {/* ── info box ── */}
                            <div style={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   gap: 8,
                                   padding: '12px 16px',
                                   background: 'rgba(34,197,94,0.08)',
                                   borderRadius: 12,
                                   border: '1px solid rgba(34,197,94,0.2)',
                            }}>
                                   
                                   <span style={{ fontSize: '.85rem', color: '#16a34a', fontWeight: 500 }}>
                                          บันทึกการเข้าร่วมเรียบร้อยแล้ว
                                   </span>
                            </div>

                     </main>
              </PageShell>
       )
}