import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import AnnouncementFormModal from '../components/AnnouncementFormModal'

// ISO date -> "20 Aug 2026, 3:45 PM"
function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Announcements() {
  const { user } = useOutletContext()
  const isAdmin = user.role === 'ADMIN'
  const isVisitor = user.role === 'VISITOR'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // announcement (edit) ya 'new' (naya)

  const load = () => {
    api
      .get('/announcements/')
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isVisitor) {
      setLoading(false)
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    await api.delete(`/announcements/${id}/`)
    load()
  }

  // Visitor enrolled nahi
  if (isVisitor) {
    return (
      <>
        <div className="topbar">
          <h1>Announcements</h1>
        </div>
        <div className="content-card">
          <p>You are not enrolled, so announcements are not available.</p>
          <p className="muted">Please contact Sir to get your id and password.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <h1>Announcements</h1>
        {isAdmin && (
          <button className="btn-primary btn-inline" onClick={() => setEditing('new')}>
            + New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="content-card">
          <p className="muted">No announcements yet.</p>
        </div>
      ) : (
        <div className="ann-list">
          {items.map((a) => (
            <div className={'ann-card' + (a.is_pinned ? ' ann-pinned' : '')} key={a.id}>
              <div className="ann-head">
                <h3>
                  {a.is_pinned && <span className="ann-pin">📌</span>}
                  {a.title}
                </h3>
                {isAdmin && (
                  <div className="ann-actions">
                    <button className="btn-small" onClick={() => setEditing(a)}>
                      Edit
                    </button>
                    <button className="btn-small btn-danger" onClick={() => remove(a.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="ann-body">{a.body}</p>
              <div className="ann-meta">
                <span>📢 {a.author_name || 'Admin'}</span>
                <span>🕒 {formatDate(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AnnouncementFormModal
          announcement={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </>
  )
}

export default Announcements
