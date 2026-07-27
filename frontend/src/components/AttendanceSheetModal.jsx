import { useEffect, useState } from 'react'
import api from '../api'

/**
 * Attendance sheet ka modal.
 *
 * Ye ek REUSABLE component hai — Classes page aur Attendance page,
 * dono yahi use karte hain (code do jagah copy nahi karna padta).
 *
 * Props:
 *   classSession — kaunsi class ki sheet
 *   autoTake     — khulte hi attendance calculate kar lo? (true = "Take Attendance")
 *   onClose      — modal band karne par
 *   onChanged    — kuch badla to parent ko batao (list refresh ke liye)
 *   readOnly     — students ke liye: sirf dekhna, koi edit/publish nahi
 */
function AttendanceSheetModal({
  classSession,
  autoTake = false,
  onClose,
  onChanged,
  readOnly = false,
}) {
  const [cls, setCls] = useState(classSession)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (autoTake) {
          // Pehli baar attendance lena
          const res = await api.post(`/classes/${classSession.id}/take_attendance/`)
          setRecords(res.data)
          setCls({ ...classSession, attendance_taken_at: new Date().toISOString() })
          if (onChanged) onChanged()
        } else {
          // Pehle se li hui sheet dekhna
          const res = await api.get(`/classes/${classSession.id}/attendance/`)
          setRecords(res.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dobara calculate karo (manual edits safe rehte hain)
  const retake = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/classes/${cls.id}/take_attendance/`)
      setRecords(res.data)
      setCls({ ...cls, attendance_taken_at: new Date().toISOString() })
      if (onChanged) onChanged()
    } finally {
      setLoading(false)
    }
  }

  // Kisi student ka status manually badlo
  const updateStatus = async (record, status) => {
    const res = await api.patch(`/attendance/records/${record.id}/`, { status })
    setRecords((prev) => prev.map((r) => (r.id === record.id ? res.data : r)))
    if (onChanged) onChanged()
  }

  // Publish / Unpublish — publish hote hi students ko dikhne lagti hai
  const togglePublish = async () => {
    const res = await api.post(`/classes/${cls.id}/publish_attendance/`, {
      publish: !cls.attendance_published,
    })
    setCls({ ...cls, attendance_published: res.data.attendance_published })
    if (onChanged) onChanged()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Attendance — {cls.title}</h2>
        <p className="muted">
          {cls.attendance_taken_at
            ? `Taken: ${new Date(cls.attendance_taken_at).toLocaleString()}`
            : 'Not taken yet'}
          {' · '}
          {cls.attendance_published ? '🔓 Published' : '🔒 Not published'}
          {cls.ended_at &&
            ` · Class ended at ${new Date(cls.ended_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`}
        </p>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : records.length === 0 ? (
          <p className="muted">No attendance records yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="att-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Joins</th>
                  <th>Total</th>
                  <th>First join</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.student_name}
                      {/* Sir ne manually badla ho to nishaan */}
                      {r.manually_edited && <span title="Manually edited"> ✏️</span>}
                    </td>
                    <td>
                      {readOnly ? (
                        // Students ke liye sirf badge (badal nahi sakte)
                        <span
                          className={
                            'status-badge ' +
                            (r.status === 'PRESENT' ? 'is-present' : 'is-absent')
                          }
                        >
                          {r.status_display}
                        </span>
                      ) : (
                        <select
                          className={
                            'status-select ' + (r.status === 'PRESENT' ? 'is-present' : 'is-absent')
                          }
                          value={r.status}
                          onChange={(e) => updateStatus(r, e.target.value)}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      )}
                    </td>
                    <td>{r.join_count}</td>
                    <td>{r.total_minutes} m</td>
                    <td>
                      {r.first_joined_at
                        ? new Date(r.first_joined_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
          {/* Ye buttons sirf Admin ko (students ke liye sheet read-only hai) */}
          {!readOnly && (
            <>
              {/* Class end hone ke baad re-take band (sab logs band hain ->
                  sab Absent ho jayenge). Status edit phir bhi ho sakta hai. */}
              {cls.ended_at ? (
                <span className="muted">Class has ended</span>
              ) : (
                <button className="btn-small" onClick={retake} disabled={loading}>
                  {cls.attendance_taken_at ? 'Re-take Attendance' : 'Take Attendance'}
                </button>
              )}
              <button className="btn-primary btn-inline" onClick={togglePublish}>
                {cls.attendance_published ? 'Unpublish' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceSheetModal
