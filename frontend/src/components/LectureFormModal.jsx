import { useEffect, useState } from 'react'
import api from '../api'

// --- Time helpers: seconds <-> "MM:SS" (ya "H:MM:SS") ---
function secondsToStr(sec) {
  const s = Number(sec) || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`
}

function strToSeconds(str) {
  // "5:30" -> 330, "1:05:30" -> 3930
  const parts = String(str).split(':').map((p) => parseInt(p, 10) || 0)
  return parts.reduce((total, p) => total * 60 + p, 0)
}

/**
 * Recording (lecture) add/edit ka modal — sirf Admin.
 *
 * Props:
 *   classSession — kaunsi class ki recording
 *   onClose      — modal band
 *   onSaved      — save/delete ke baad (list refresh)
 */
function LectureFormModal({ classSession, onClose, onSaved }) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  // chapters: [{ title, timeStr }] — UI mein time string (MM:SS)
  const [chapters, setChapters] = useState([])
  const [exists, setExists] = useState(false) // recording pehle se hai?
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pehle se recording ho to uski values bhar do
  useEffect(() => {
    api
      .get(`/classes/${classSession.id}/lecture/`)
      .then((res) => {
        setExists(true)
        setYoutubeUrl(res.data.youtube_url)
        setTitle(res.data.title)
        setChapters(res.data.chapters.map((c) => ({ title: c.title, timeStr: secondsToStr(c.time) })))
      })
      .catch(() => setExists(false)) // 404 = abhi koi recording nahi
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addChapter = () => setChapters([...chapters, { title: '', timeStr: '0:00' }])
  const removeChapter = (i) => setChapters(chapters.filter((_, idx) => idx !== i))
  const updateChapter = (i, field, value) =>
    setChapters(chapters.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      youtube_url: youtubeUrl,
      title,
      chapters: chapters
        .filter((c) => c.title.trim() !== '')
        .map((c) => ({ title: c.title, time: strToSeconds(c.timeStr) })),
    }
    try {
      await api.put(`/classes/${classSession.id}/lecture/`, payload)
      onSaved()
      onClose()
    } catch (err) {
      setError('Could not save. Please check the YouTube link and chapters.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this recording?')) return
    await api.delete(`/classes/${classSession.id}/lecture/`)
    onSaved()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Recording — {classSession.title}</h2>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <form onSubmit={save}>
            {error && <div className="error-box">{error}</div>}

            <label className="field-label">YouTube link</label>
            <input
              className="field-input"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              required
            />

            <label className="field-label">Title (optional)</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave empty to use the class title"
            />

            <label className="field-label">Chapters</label>
            {chapters.length === 0 && (
              <p className="muted">No chapters yet. Add one below (optional).</p>
            )}
            {chapters.map((c, i) => (
              <div className="chapter-row" key={i}>
                <input
                  className="field-input chapter-title"
                  value={c.title}
                  onChange={(e) => updateChapter(i, 'title', e.target.value)}
                  placeholder="Chapter title"
                />
                <input
                  className="field-input chapter-time"
                  value={c.timeStr}
                  onChange={(e) => updateChapter(i, 'timeStr', e.target.value)}
                  placeholder="MM:SS"
                />
                <button
                  type="button"
                  className="chapter-remove"
                  onClick={() => removeChapter(i)}
                  title="Remove chapter"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="btn-small" onClick={addChapter}>
              + Add chapter
            </button>

            <div className="modal-actions">
              {exists && (
                <button type="button" className="btn-small btn-danger" onClick={remove}>
                  Delete recording
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
        )}
      </div>
    </div>
  )
}

export default LectureFormModal
