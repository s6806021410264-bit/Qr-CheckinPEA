import { useState, useEffect } from 'react'
import { SkeletonTable, EmptyState, Pagination } from '../components/AdminShared'
import { getAllUsers, createUser, updateUser, deleteUser } from '../admin/services/adminDashboardService'
import { FALLBACK_POSITION_OPTIONS, getPositionOptions } from '../lib/positions'

const PER_PAGE = 8

export default function UsersPage({ toast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', role: 'user', position: '' })  // ← เพิ่ม position
  const [positionOptions, setPositionOptions] = useState(FALLBACK_POSITION_OPTIONS)

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

  useEffect(() => { loadUsers() }, [])

  useEffect(() => {
    let active = true

    async function loadPositions() {
      const options = await getPositionOptions()
      if (active) setPositionOptions(options)
    }

    loadPositions()

    return () => {
      active = false
    }
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.code?.toLowerCase().includes(q)
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
        toast('User added', 'success')
      } else if (modal?.edit) {
        await updateUser(modal.edit.id, form)
        toast('User updated', 'success')
      }
      setModal(null)
      await loadUsers()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleDelete() {
    try {
      await deleteUser(modal.del.id)
      toast('User deleted', 'success')
      setModal(null)
      await loadUsers()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function openAdd() {
    setForm({ name: '', code: '', role: 'user', position: '' })  // ← เพิ่ม position
    setModal('add')
  }

  function openEdit(u) {
    setForm({ name: u.name, code: u.code, role: u.role || 'user', position: u.position || '' })  // ← เพิ่ม position
    setModal({ edit: u })
  }

  return (
    <>
      <div className="adm-page-header">
        <h1>Users</h1>
        <p>Manage all registered users</p>
      </div>

      <div className="adm-filter-bar">
        <input
          className="adm-input"
          placeholder="🔍 Search name or code…"
          style={{ flex: 1, maxWidth: 280 }}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="adm-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button className="adm-btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>+ Add User</button>
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading
            ? <div style={{ padding: 20 }}><SkeletonTable /></div>
            : paged.length === 0
              ? <EmptyState icon="👥" message="No users found" />
              : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Position</th>  
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td><span className="adm-badge badge-user">{u.code}</span></td>
                        <td style={{ color: 'var(--muted2)' }}>{u.position || '—'}</td> 
                        <td><span className={`adm-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role || 'user'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="adm-btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openEdit(u)}>Edit</button>
                            {u.role !== 'admin' && (
                              <button className="adm-btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setModal({ del: u })}>Del</button>
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

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal?.edit) && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <h3>{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>

            <div className="adm-form-group">
              <label>Full Name</label>
              <input className="adm-input" style={{ width: '100%' }} placeholder="สมชาย ใจดี"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="adm-form-group">
              <label>Code</label>
              <input className="adm-input" style={{ width: '100%' }} placeholder="EMP001"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>

            <div className="adm-form-group"> 
              <label>Position</label>
              <select className="adm-select" style={{ width: '100%' }}
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="">Select position</option>
                {positionOptions.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="adm-form-group">
              <label>Role</label>
              <select className="adm-select" style={{ width: '100%' }} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="adm-modal-actions">
              <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'Add User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.del && (
        <div className="adm-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <h3>Delete User</h3>
            <p style={{ color: 'var(--muted2)', marginBottom: 20 }}>
              Remove <strong style={{ color: 'var(--text)' }}>{modal.del.name}</strong> ({modal.del.code})? This cannot be undone.
            </p>
            <div className="adm-modal-actions">
              <button className="adm-btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
