import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { SkeletonTable, EmptyState, Pagination } from '../components/AdminShared'
import {
       getAllEvents,
       createEvent,
       updateEvent,
       deleteEvent
} from '../admin/services/adminDashboardService'

const PER_PAGE = 8

export default function EventsPage({ toast }) {
       const [events, setEvents] = useState([])
       const [loading, setLoading] = useState(true)
       const [search, setSearch] = useState('')
       const [page, setPage] = useState(1)
       const [modal, setModal] = useState(null)
       const [form, setForm] = useState({ name: '', date: '', description: '' })

       async function loadEvents() {
              setLoading(true)
              try {
                     setEvents(await getAllEvents())
              } catch (err) {
                     toast(err.message, 'error')
              } finally {
                     setLoading(false)
              }
       }

       useEffect(() => { loadEvents() }, [])

       const filtered = events.filter(e => {
              const q = search.toLowerCase()
              return !q || e.name?.toLowerCase().includes(q) || e.date?.includes(q)
       })
       const pages = Math.ceil(filtered.length / PER_PAGE)
       const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

       async function handleSave() {
              if (!form.name.trim() || !form.date) return
              try {
                     if (modal === 'add') {
                            await createEvent(form)
                            toast('เพิ่มกิจกรรมแล้ว', 'success')
                     } else if (modal?.edit) {
                            await updateEvent(modal.edit.id, form)
                            toast('บันทึกกิจกรรมแล้ว', 'success')
                     }
                     setModal(null)
                     await loadEvents()
              } catch (err) {
                     toast(err.message, 'error')
              }
       }

       async function handleDelete() {
              try {
                     await deleteEvent(modal.del.id)
                     toast('ลบกิจกรรมแล้ว', 'success')
                     setModal(null)
                     await loadEvents()
              } catch (err) {
                     toast(err.message, 'error')
              }
       }

       function openAdd() {
              setForm({ name: '', date: '', description: '' })
              setModal('add')
       }

       function openEdit(e) {
              setForm({ name: e.name, date: e.date, description: e.description || '' })
              setModal({ edit: e })
       }

       return (
              <>
                     <div className="adm-page-header">
                            <h1>กิจกรรม</h1>
                            <p>จัดการวันที่และรายละเอียดกิจกรรม</p>
                     </div>

                     <div className="adm-filter-bar">
                            <input
                                   className="adm-input"
                                   placeholder="ค้นหาชื่อกิจกรรมหรือวันที่"
                                   style={{ flex: 1, maxWidth: 280 }}
                                   value={search}
                                   onChange={e => { setSearch(e.target.value); setPage(1) }}
                            />
                            <button className="adm-btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>
                                   + เพิ่มกิจกรรม
                            </button>
                     </div>

                     <div className="adm-card">
                            <div className="adm-table-wrap">
                                   {loading
                                          ? <div style={{ padding: 20 }}><SkeletonTable /></div>
                                          : paged.length === 0
                                                 ? <EmptyState icon="📅" message="ไม่พบกิจกรรม" />
                                                 : (
                                                        <table className="adm-table">
                                                               <thead>
                                                                      <tr>
                                                                             <th>#</th>
                                                                             <th>ชื่อกิจกรรม</th>
                                                                             <th>วันที่</th>
                                                                             <th>รายละเอียด</th>
                                                                             <th>จัดการ</th>
                                                                      </tr>
                                                               </thead>
                                                               <tbody>
                                                                      {paged.map((ev, i) => (
                                                                             <tr key={ev.id}>
                                                                                    <td style={{ color: 'var(--muted)' }}>
                                                                                           {(page - 1) * PER_PAGE + i + 1}
                                                                                    </td>
                                                                                    <td style={{ fontWeight: 500 }}>{ev.name}</td>
                                                                                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--muted2)' }}>
                                                                                           {dayjs(ev.date).format('DD MMM YYYY')}
                                                                                    </td>
                                                                                    <td style={{ color: 'var(--muted2)', fontSize: 12 }}>
                                                                                           {ev.description || '—'}
                                                                                    </td>
                                                                                    <td>
                                                                                           <div style={{ display: 'flex', gap: 6 }}>
                                                                                                  <button
                                                                                                         className="adm-btn btn-ghost"
                                                                                                         style={{ padding: '5px 10px', fontSize: 12 }}
                                                                                                         onClick={() => openEdit(ev)}
                                                                                                  >
                                                                                                         แก้ไข
                                                                                                  </button>
                                                                                                  <button
                                                                                                         className="adm-btn btn-danger"
                                                                                                         style={{ padding: '5px 10px', fontSize: 12 }}
                                                                                                         onClick={() => setModal({ del: ev })}
                                                                                                  >
                                                                                                         ลบ
                                                                                                  </button>
                                                                                           </div>
                                                                                    </td>
                                                                             </tr>
                                                                      ))}
                                                               </tbody>
                                                        </table>
                                                 )
                                   }
                            </div>
                            <Pagination page={page} pages={pages} onPageChange={setPage} />
                     </div>

                     {/* Add / Edit Modal */}
                     {(modal === 'add' || modal?.edit) && (
                            <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
                                   <div className="adm-modal">
                                          <h3>{modal === 'add' ? 'เพิ่มกิจกรรมใหม่' : 'แก้ไขกิจกรรม'}</h3>

                                          <div className="adm-form-group">
                                                 <label>ชื่อกิจกรรม</label>
                                                 <input
                                                        className="adm-input"
                                                        style={{ width: '100%' }}
                                                        placeholder="กิจกรรมประจำปี"
                                                        value={form.name}
                                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                 />
                                          </div>

                                          <div className="adm-form-group">
                                                 <label>วันที่</label>
                                                 <input
                                                        className="adm-input"
                                                        style={{ width: '100%' }}
                                                        type="date"
                                                        value={form.date}
                                                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                                 />
                                          </div>

                                          <div className="adm-form-group">
                                                 <label>รายละเอียด (ไม่บังคับ)</label>
                                                 <input
                                                        className="adm-input"
                                                        style={{ width: '100%' }}
                                                        placeholder="รายละเอียดกิจกรรม"
                                                        value={form.description}
                                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                                 />
                                          </div>

                                          <div className="adm-modal-actions">
                                                 <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>ยกเลิก</button>
                                                 <button className="adm-btn btn-primary" onClick={handleSave}>
                                                        {modal === 'add' ? 'เพิ่มกิจกรรม' : 'บันทึก'}
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* Delete Modal */}
                     {modal?.del && (
                            <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
                                   <div className="adm-modal">
                                          <h3>ลบกิจกรรม</h3>
                                          <p style={{ color: 'var(--muted2)', marginBottom: 20 }}>
                                                 ต้องการลบ <strong style={{ color: 'var(--text)' }}>{modal.del.name}</strong> (
                                                 {dayjs(modal.del.date).format('DD MMM YYYY')}) ใช่ไหม?
                                          </p>
                                          <div className="adm-modal-actions">
                                                 <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>ยกเลิก</button>
                                                 <button className="adm-btn btn-danger" onClick={handleDelete}>ลบ</button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </>
       )
}
