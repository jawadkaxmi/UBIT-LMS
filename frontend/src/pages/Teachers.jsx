import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'

function Teachers() {
  const { user } = useOutletContext()

  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active') // 'active' | 'inactive'

  // Add/Edit modal ke liye state
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // edit ho raha teacher, ya null (add)
  const [form, setForm] = useState({ name: '', email: '', designation: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Remove modal ke liye state
  const [removing, setRemoving] = useState(null) // hataya ja raha teacher
  const [reason, setReason] = useState('')

  const loadTeachers = () => {
    setLoading(true)
    api
      .get('/teachers/')
      .then((res) => setTeachers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  // Sirf Admin ko access
  if (user.role !== 'ADMIN') {
    return (
      <>
        <div className="topbar">
          <h1>Teachers</h1>
        </div>
        <div className="content-card">
          <p>You do not have access to this page.</p>
        </div>
      </>
    )
  }

  const activeTeachers = teachers.filter((t) => t.is_active)
  const inactiveTeachers = teachers.filter((t) => !t.is_active)
  const shown = tab === 'active' ? activeTeachers : inactiveTeachers

  // --- Add / Edit ---
  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', designation: '' })
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({ name: t.name, email: t.email, designation: t.designation })
    setFormError('')
    setShowForm(true)
  }

  const saveForm = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await api.put(`/teachers/${editing.id}/`, form)
      } else {
        await api.post('/teachers/', form)
      }
      setShowForm(false)
      loadTeachers()
    } catch (err) {
      setFormError('Could not save. Please check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  // --- Remove (soft delete) ---
  const openRemove = (t) => {
    setRemoving(t)
    setReason('')
  }

  const confirmRemove = async (e) => {
    e.preventDefault()
    await api.post(`/teachers/${removing.id}/deactivate/`, { reason })
    setRemoving(null)
    loadTeachers()
  }

  // --- Reactivate ---
  const reactivate = async (t) => {
    await api.post(`/teachers/${t.id}/reactivate/`)
    loadTeachers()
  }

  return (
    <>
      <div className="topbar">
        <h1>Manage Teachers</h1>
        <button className="btn-primary btn-inline" onClick={openAdd}>
          + Add Teacher
        </button>
      </div>

      {/* Active / Inactive tabs */}
      <div className="tabs">
        <button
          className={'tab' + (tab === 'active' ? ' tab-active' : '')}
          onClick={() => setTab('active')}
        >
          Active ({activeTeachers.length})
        </button>
        <button
          className={'tab' + (tab === 'inactive' ? ' tab-active' : '')}
          onClick={() => setTab('inactive')}
        >
          Inactive ({inactiveTeachers.length})
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : shown.length === 0 ? (
        <div className="content-card">
          <p className="muted">No {tab} teachers.</p>
        </div>
      ) : (
        <div className="teacher-grid">
          {shown.map((t) => (
            <div className="teacher-card" key={t.id}>
              <div className="teacher-info">
                <h3>{t.name}</h3>
                {t.designation && <span className="teacher-desig">{t.designation}</span>}
                {t.email && <p className="teacher-email">{t.email}</p>}
                {!t.is_active && t.removal_reason && (
                  <p className="teacher-reason">Removed: {t.removal_reason}</p>
                )}
              </div>
              <div className="teacher-actions">
                {t.is_active ? (
                  <>
                    <button className="btn-small" onClick={() => openEdit(t)}>
                      Edit
                    </button>
                    <button className="btn-small btn-danger" onClick={() => openRemove(t)}>
                      Remove
                    </button>
                  </>
                ) : (
                  <button className="btn-small" onClick={() => reactivate(t)}>
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Add / Edit modal ===== */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
            <form onSubmit={saveForm}>
              {formError && <div className="error-box">{formError}</div>}

              <label className="field-label">Name</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dr. Ahmed"
                required
              />

              <label className="field-label">Email (optional)</label>
              <input
                className="field-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. ahmed@uni.edu"
              />

              <label className="field-label">Designation (optional)</label>
              <input
                className="field-input"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Lecturer / Professor"
              />

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-inline" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Remove (soft delete) modal ===== */}
      {removing && (
        <div className="modal-overlay" onClick={() => setRemoving(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Remove Teacher</h2>
            <p className="muted">
              Removing <b>{removing.name}</b> (soft delete — the record is kept, so
              the name stays safe in past classes).
            </p>
            <form onSubmit={confirmRemove}>
              <label className="field-label">Removal reason</label>
              <textarea
                className="field-input"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Left the institute"
                required
              />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setRemoving(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-small btn-danger">
                  Remove
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Teachers
