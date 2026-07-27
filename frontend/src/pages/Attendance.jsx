import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import AttendanceSheetModal from '../components/AttendanceSheetModal'

function Attendance() {
  const { user } = useOutletContext()
  const isAdmin = user.role === 'ADMIN'
  const isVisitor = user.role === 'VISITOR'

  // Admin ke liye: classes ki list. Student ke liye: apni attendance records.
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheet, setSheet] = useState(null) // { cls, autoTake, readOnly } ya null

  const load = () => {
    setLoading(true)
    const url = isAdmin ? '/classes/' : '/attendance/my/'
    api
      .get(url)
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isVisitor) load()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Visitor enrolled nahi — uski koi attendance nahi hoti
  if (isVisitor) {
    return (
      <>
        <div className="topbar">
          <h1>Attendance</h1>
        </div>
        <div className="content-card">
          <p>You are not enrolled, so you do not have any attendance record.</p>
          <p className="muted">Please contact Sir to get your id and password.</p>
        </div>
      </>
    )
  }

  // ===================== ADMIN VIEW =====================
  if (isAdmin) {
    return (
      <>
        <div className="topbar">
          <h1>Attendance</h1>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : rows.length === 0 ? (
          <div className="content-card">
            <p className="muted">No classes yet.</p>
          </div>
        ) : (
          <div className="content-card">
            <div className="table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Date</th>
                    <th>Teacher</th>
                    <th>Present</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.date}</td>
                      <td>{c.teacher_name || '—'}</td>
                      <td>
                        {c.attendance_taken_at
                          ? `${c.attendance_present_count}/${c.attendance_total_count}`
                          : '—'}
                      </td>
                      <td>
                        {!c.attendance_taken_at ? (
                          <span className="muted">Not taken</span>
                        ) : c.attendance_published ? (
                          <span className="badge-published">🔓 Published</span>
                        ) : (
                          <span className="badge-draft">🔒 Draft</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-small btn-attendance"
                          onClick={() => setSheet({ cls: c, autoTake: !c.attendance_taken_at })}
                          disabled={!c.started_at}
                          title={!c.started_at ? 'Start the class first' : ''}
                        >
                          {c.attendance_taken_at ? 'Open' : 'Take'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sheet && (
          <AttendanceSheetModal
            classSession={sheet.cls}
            autoTake={sheet.autoTake}
            onClose={() => setSheet(null)}
            onChanged={load}
          />
        )}
      </>
    )
  }

  // ===================== STUDENT VIEW =====================
  const presentCount = rows.filter((r) => r.status === 'PRESENT').length
  const percent = rows.length ? Math.round((presentCount / rows.length) * 100) : 0

  return (
    <>
      <div className="topbar">
        <h1>My Attendance</h1>
        {rows.length > 0 && (
          <span className="role-badge role-student">
            {presentCount}/{rows.length} · {percent}%
          </span>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="content-card">
          <p className="muted">
            No attendance published yet. It will appear here once Sir publishes it.
          </p>
        </div>
      ) : (
        <div className="content-card">
          <div className="table-wrap">
            <table className="att-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Your status</th>
                  <th>Joins</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.class_title}</td>
                    <td>{r.class_date}</td>
                    <td>{r.class_start_time?.slice(0, 5)}</td>
                    <td>
                      <span
                        className={
                          'status-badge ' + (r.status === 'PRESENT' ? 'is-present' : 'is-absent')
                        }
                      >
                        {r.status_display}
                      </span>
                    </td>
                    <td>{r.join_count}</td>
                    <td>{r.total_minutes} m</td>
                    <td>
                      <button
                        className="btn-small"
                        onClick={() =>
                          setSheet({
                            cls: {
                              id: r.class_session,
                              title: r.class_title,
                              attendance_taken_at: r.class_attendance_taken_at,
                              attendance_published: true,
                            },
                            autoTake: false,
                            readOnly: true,
                          })
                        }
                      >
                        View sheet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sheet && (
        <AttendanceSheetModal
          classSession={sheet.cls}
          autoTake={false}
          readOnly={sheet.readOnly}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}

export default Attendance
