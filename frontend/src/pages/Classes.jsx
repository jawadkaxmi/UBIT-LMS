import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import AttendanceSheetModal from '../components/AttendanceSheetModal'

const emptyForm = {
  title: '',
  description: '',
  date: '',
  start_time: '',
  meet_link: '',
  teacher: '',
}

function Classes() {
  const { user } = useOutletContext()
  const isAdmin = user.role === 'ADMIN'
  const isStudent = user.role === 'STUDENT'
  const isVisitor = user.role === 'VISITOR'

  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([]) // sirf active (dropdown ke liye)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming') // 'upcoming' | 'past'

  // Attendance sheet modal (sirf Admin) — { cls, autoTake } ya null
  const [sheet, setSheet] = useState(null)

  // Announce/Edit modal state
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadClasses = () => {
    setLoading(true)
    api
      .get('/classes/')
      .then((res) => setClasses(res.data))
      .finally(() => setLoading(false))
  }

  const loadTeachers = () => {
    api.get('/teachers/').then((res) => setTeachers(res.data.filter((t) => t.is_active)))
  }

  useEffect(() => {
    loadClasses()
    if (isAdmin) loadTeachers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Announce / Edit ---
  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      title: c.title,
      description: c.description,
      date: c.date,
      start_time: c.start_time ? c.start_time.slice(0, 5) : '', // "14:00:00" -> "14:00"
      meet_link: c.meet_link,
      teacher: c.teacher || '',
    })
    setFormError('')
    setShowForm(true)
  }

  const saveForm = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    // Khaali teacher -> null (koi teacher select nahi)
    const payload = { ...form, teacher: form.teacher === '' ? null : form.teacher }
    try {
      if (editing) {
        await api.put(`/classes/${editing.id}/`, payload)
      } else {
        await api.post('/classes/', payload)
      }
      setShowForm(false)
      loadClasses()
    } catch (err) {
      setFormError('Could not save. Please check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteClass = async (c) => {
    if (!window.confirm(`Delete class "${c.title}"? This cannot be undone.`)) return
    await api.delete(`/classes/${c.id}/`)
    loadClasses()
  }

  // Time ko "03:45 PM" jaisा dikhane ke liye
  const timeOf = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  // --- Admin: class start / end ---
  const startClass = async (c) => {
    await api.post(`/classes/${c.id}/start/`)
    if (c.meet_link) window.open(c.meet_link, '_blank', 'noopener')
    loadClasses()
  }

  const endClass = async (c) => {
    if (
      !window.confirm(
        `End class "${c.title}"?\n\nAttendance will be saved automatically (as a draft) and everyone still in the class will be marked as left.`
      )
    )
      return
    await api.post(`/classes/${c.id}/end/`)
    loadClasses()
  }

  // --- Student: Join / Leave (attendance yahin record hoti hai) ---
  const joinClass = async (c) => {
    // Pehle LMS mein time record karo, phir Meet kholo
    await api.post(`/classes/${c.id}/join/`)
    if (c.meet_link) window.open(c.meet_link, '_blank', 'noopener')
    loadClasses() // is_joined refresh ho jaye
  }

  const leaveClass = async (c) => {
    await api.post(`/classes/${c.id}/leave/`)
    loadClasses()
  }

  // --- Admin: attendance sheet kholna (sheet ka saara kaam
  //     AttendanceSheetModal component karta hai) ---
  const openSheet = (c) => setSheet({ cls: c, autoTake: !c.attendance_taken_at })

  // Aaj ki date (local) "YYYY-MM-DD" format mein — class ki date se compare karne ke liye
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`

  const upcoming = classes.filter((c) => c.date >= today)
  const past = [...classes.filter((c) => c.date < today)].reverse() // recent pehle
  const shown = tab === 'upcoming' ? upcoming : past

  return (
    <>
      <div className="topbar">
        <h1>{isVisitor ? 'Explore Classes' : 'Classes'}</h1>
        {isAdmin && (
          <button className="btn-primary btn-inline" onClick={openAdd}>
            + Announce Class
          </button>
        )}
      </div>

      {/* Visitor enrolled nahi hai — use notice dikhao */}
      {isVisitor && (
        <div className="notice">
          You are not enrolled in this class. Please contact Sir to get your id and
          password so you can join classes.
        </div>
      )}

      {/* Upcoming / Past tabs */}
      <div className="tabs">
        <button
          className={'tab' + (tab === 'upcoming' ? ' tab-active' : '')}
          onClick={() => setTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          className={'tab' + (tab === 'past' ? ' tab-active' : '')}
          onClick={() => setTab('past')}
        >
          Past ({past.length})
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : shown.length === 0 ? (
        <div className="content-card">
          <p className="muted">No {tab} classes.</p>
        </div>
      ) : (
        <div className="class-list">
          {shown.map((c) => (
            <div className="class-card" key={c.id}>
              <div className="class-main">
                <h3>{c.title}</h3>
                <div className="class-meta">
                  <span>📅 {c.date}</span>
                  <span>🕒 {c.start_time?.slice(0, 5)}</span>
                  {c.teacher_name && <span>👨‍🏫 {c.teacher_name}</span>}
                </div>
                {c.description && <p className="class-desc">{c.description}</p>}
              </div>
              <div className="class-actions">
                {/* ================= ADMIN ================= */}
                {isAdmin && (
                  <>
                    {/* Class abhi shuru nahi hui */}
                    {!c.started_at && (
                      <button className="btn-small btn-join" onClick={() => startClass(c)}>
                        Start Class
                      </button>
                    )}

                    {/* Class chal rahi hai */}
                    {c.started_at && !c.ended_at && (
                      <>
                        {c.meet_link && (
                          <a
                            className="btn-small btn-join"
                            href={c.meet_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Join
                          </a>
                        )}
                        <button className="btn-small btn-danger" onClick={() => endClass(c)}>
                          End Class
                        </button>
                      </>
                    )}

                    {/* Class khatam ho chuki */}
                    {c.ended_at && (
                      <span className="ended-note">Ended at {timeOf(c.ended_at)}</span>
                    )}

                    {/* Attendance — class shuru huye bina disabled */}
                    <button
                      className="btn-small btn-attendance"
                      onClick={() => openSheet(c)}
                      disabled={!c.started_at}
                      title={!c.started_at ? 'Start the class first' : ''}
                    >
                      {c.attendance_taken_at ? 'Attendance' : 'Take Attendance'}
                    </button>

                    <button className="btn-small" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button className="btn-small btn-danger" onClick={() => deleteClass(c)}>
                      Delete
                    </button>
                  </>
                )}

                {/* ================= STUDENT ================= */}
                {isStudent && (
                  <>
                    {/* Class abhi shuru nahi hui */}
                    {!c.started_at && <span className="muted-note">Not started yet</span>}

                    {/* Class khatam ho chuki */}
                    {c.ended_at && (
                      <span className="ended-note">Class ended at {timeOf(c.ended_at)}</span>
                    )}

                    {/* Class chal rahi hai — Join / Leave */}
                    {c.started_at &&
                      !c.ended_at &&
                      (c.is_joined ? (
                        <>
                          <span className="in-class">🟢 In class</span>
                          {c.meet_link && (
                            <a
                              className="btn-small"
                              href={c.meet_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Meet
                            </a>
                          )}
                          <button className="btn-small btn-danger" onClick={() => leaveClass(c)}>
                            Leave
                          </button>
                        </>
                      ) : (
                        <button className="btn-small btn-join" onClick={() => joinClass(c)}>
                          Join
                        </button>
                      ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Announce / Edit modal ===== */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Class' : 'Announce Class'}</h2>
            <form onSubmit={saveForm}>
              {formError && <div className="error-box">{formError}</div>}

              <label className="field-label">Title</label>
              <input
                className="field-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. OOP - Inheritance"
                required
              />

              <label className="field-label">Description (optional)</label>
              <textarea
                className="field-input"
                rows="2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. which chapter will be covered"
              />

              <label className="field-label">Date</label>
              <input
                className="field-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />

              <label className="field-label">Start time</label>
              <input
                className="field-input"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />

              <label className="field-label">Google Meet link (optional)</label>
              <input
                className="field-input"
                type="url"
                value={form.meet_link}
                onChange={(e) => setForm({ ...form, meet_link: e.target.value })}
                placeholder="https://meet.google.com/..."
              />

              <label className="field-label">Teacher (optional)</label>
              <select
                className="field-input"
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              >
                <option value="">— Select a teacher —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.designation ? ` (${t.designation})` : ''}
                  </option>
                ))}
              </select>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-inline" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save' : 'Announce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== Attendance sheet — shared component (Attendance page bhi yahi use karta hai) ===== */}
      {sheet && (
        <AttendanceSheetModal
          classSession={sheet.cls}
          autoTake={sheet.autoTake}
          onClose={() => setSheet(null)}
          onChanged={loadClasses}
        />
      )}
    </>
  )
}

export default Classes
