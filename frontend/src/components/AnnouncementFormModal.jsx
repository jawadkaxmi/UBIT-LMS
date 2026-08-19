import { useState } from 'react'
import api from '../api'

/**
 * Announcement add/edit ka modal — sirf Admin.
 *
 * Props:
 *   announcement — edit ke liye maujooda announcement, ya null (naya)
 *   onClose      — modal band
 *   onSaved      — save/delete ke baad (list refresh)
 */
function AnnouncementFormModal({ announcement, onClose, onSaved }) {
  const isEdit = !!announcement
  const [title, setTitle] = useState(announcement?.title || '')
  const [body, setBody] = useState(announcement?.body || '')
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned || false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { title, body, is_pinned: isPinned }
    try {
      if (isEdit) {
        await api.put(`/announcements/${announcement.id}/`, payload)
      } else {
        await api.post('/announcements/', payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError('Could not save. Please fill in the title and message.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this announcement?')) return
    await api.delete(`/announcements/${announcement.id}/`)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Announcement' : 'New Announcement'}</h2>

        <form onSubmit={save}>
          {error && <div className="error-box">{error}</div>}

          <label className="field-label">Title</label>
          <input
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Quiz on Friday"'
            required
          />

          <label className="field-label">Message</label>
          <textarea
            className="field-input"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the announcement..."
            required
          />

          <label className="ann-check">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            📌 Pin to top
          </label>

          <div className="modal-actions">
            {isEdit && (
              <button type="button" className="btn-small btn-danger" onClick={remove}>
                Delete
              </button>
            )}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-inline" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AnnouncementFormModal
