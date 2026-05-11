import { useState, useEffect } from 'react'
import { SkeletonTable, EmptyState, Pagination } from '../components/AdminShared'
import { getAllUsers, createUser, updateUser, deleteUser } from '../admin/services/adminDashboardService'
import { getPositionOptions, createPosition } from '../lib/positions'

const PER_PAGE = 8

export default function UsersPage({ toast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', role: 'user', position: '' })
  const [positionOptions, setPositionOptions] = useState([])
  const [positionForm, setPositionForm] = useState({ name: '', sortOrder: '' })

  async function loadUsers() {
    setLoading(true)
    try {
      setUsers(await getAllUsers())
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadPositions() {
    const options = await getPositionOptions()
    setPositionOptions(options)
  }

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { loadPositions() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.code?.toLowerCase().includes(q) 
    || u.role?.toLowerCase().includes(q) || u.position?.toLowerCase().includes(q)
    const matchR = roleFilter === 'all' || u.role === roleFilter
    return matchQ && matchR
  })
  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) return
    try {
      if (modal === 'add') {
        await createUser(form)
        toast('เพิ่มผู้ใช้แล้ว', 'success')
      } else if (modal?.edit) {
        await updateUser(modal.edit.id, form)
        toast('บันทึกข้อมูลผู้ใช้แล้ว', 'success')
      }
      setModal(null)
      await loadUsers()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleAddPosition() {
    if (!positionForm.name.trim()) return
    try {
      await createPosition(positionForm)
      toast('เพิ่มตำแหน่งแล้ว', 'success')
      setPositionForm({ name: '', sortOrder: '' })
      setModal(null)
      await loadPositions()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleDelete() {
    try {
      await deleteUser(modal.del.id)
      toast('ลบผู้ใช้แล้ว', 'success')
      setModal(null)
      await loadUsers()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function openAdd() {
    setForm({ name: '', code: '', role: 'user', position: '' })
    setModal('add')
  }

  function openEdit(u) {
    setForm({ name: u.name, code: u.code, role: u.role || 'user', position: u.position || '' })
    setModal({ edit: u })
  }

  function openPositionModal() {
    setPositionForm({ name: '', sortOrder: String((positionOptions.length + 1) ) })
    setModal('position')
  }

  return (
    <>
      <div className="adm-page-header">
        <h1>จัดการข้อมูลผู้ใช้</h1>
        <p>เพิ่ม แก้ไข และค้นหาข้อมูลผู้ใช้งานทั้งหมด</p>
      </div>

      <div className="adm-filter-bar">
        <input
          className="adm-input"
          placeholder="ค้นหารหัส,ชื่อ,ตำแหน่ง"
          style={{ flex: 1, maxWidth: 280 }}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="adm-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="all">ทุกสิทธิ์</option>
          <option value="admin">ผู้ดูแล</option>
          <option value="user">ผู้ใช้ทั่วไป</option>
        </select>
        <button className="adm-btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={openPositionModal}>+ เพิ่มตำแหน่ง</button>
        <button className="adm-btn btn-primary" onClick={openAdd}>+ เพิ่มผู้ใช้</button>
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading
            ? <div style={{ padding: 20 }}><SkeletonTable /></div>
            : paged.length === 0
              ? <EmptyState icon="👥" message="ไม่พบข้อมูลผู้ใช้" />
              : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ชื่อ</th>
                      <th>รหัส</th>
                      <th>ตำแหน่ง</th>
                      <th>สิทธิ์</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td><span className="adm-badge badge-user">{u.code}</span></td>
                        <td style={{ color: 'var(--muted2)' }}>{u.position || '—'}</td>
                        <td><span className={`adm-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้ทั่วไป'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="adm-btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openEdit(u)}>แก้ไข</button>
                            {u.role !== 'admin' && (
                              <button className="adm-btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setModal({ del: u })}>ลบ</button>
                            )}
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

      {(modal === 'add' || modal?.edit) && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <h3>{modal === 'add' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}</h3>

            <div className="adm-form-group">
              <label>ชื่อ-นามสกุล</label>
              <input className="adm-input" style={{ width: '100%' }} placeholder="สมชาย ใจดี"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="adm-form-group">
              <label>รหัส</label>
              <input className="adm-input" style={{ width: '100%' }} placeholder="emp001"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>

            <div className="adm-form-group">
              <label>ตำแหน่ง</label>
              <select className="adm-select" style={{ width: '100%' }}
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="">เลือกตำแหน่ง</option>
                {positionOptions.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="adm-form-group">
              <label>สิทธิ์</label>
              <select className="adm-select" style={{ width: '100%' }} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">ผู้ใช้ทั่วไป</option>
                <option value="admin">ผู้ดูแล</option>
              </select>
            </div>

            <div className="adm-modal-actions">
              <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="adm-btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'เพิ่มผู้ใช้' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'position' && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <h3>เพิ่มตำแหน่งใหม่</h3>
            <div className="adm-form-group">
              <label>ชื่อตำแหน่ง</label>
              <input className="adm-input" style={{ width: '100%' }} placeholder="เช่น ผxx."
                value={positionForm.name}
                onChange={e => setPositionForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="adm-form-group">
              <label>ลำดับการแสดงผล</label>
              <input className="adm-input" style={{ width: '100%' }} type="number" min="0" placeholder="80"
                value={positionForm.sortOrder}
                onChange={e => setPositionForm(f => ({ ...f, sortOrder: e.target.value }))} />
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="adm-btn btn-primary" onClick={handleAddPosition}>เพิ่มตำแหน่ง</button>
            </div>
          </div>
        </div>
      )}

      {modal?.del && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <h3>ลบผู้ใช้</h3>
            <p style={{ color: 'var(--muted2)', marginBottom: 20 }}>
              ต้องการลบ <strong style={{ color: 'var(--text)' }}>{modal.del.name}</strong> ({modal.del.code}) ใช่ไหม?
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
