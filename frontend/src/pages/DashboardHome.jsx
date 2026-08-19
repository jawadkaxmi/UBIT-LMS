import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'

// ISO date -> "23 Jul"
function shortDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

// Ek stat tile (bada number + label, left par colored border)
function StatTile({ label, value, accent }) {
  return (
    <div className="stat-tile" style={{ '--accent': accent }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

// Percentage ring (conic-gradient se donut)
function Ring({ percent, label }) {
  return (
    <div className="ring-card">
      <div className="ring" style={{ '--pct': percent }}>
        <span className="ring-value">{percent}%</span>
      </div>
      {label && <div className="ring-label">{label}</div>}
    </div>
  )
}

function DashboardHome() {
  const { user } = useOutletContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard/')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  const header = (
    <div className="topbar">
      <h1>
        Welcome, {user.username} <span className="wave">👋</span>
      </h1>
      <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role_display}</span>
    </div>
  )

  if (loading) {
    return (
      <>
        {header}
        <p className="muted">Loading...</p>
      </>
    )
  }

  // ===== Visitor — simple welcome =====
  if (!data || data.role === 'VISITOR') {
    return (
      <>
        {header}
        <div className="content-card">
          <p>
            You are currently a <b>Visitor</b>. To get enrolled, ask Sir for your id/password.
          </p>
          <p className="muted">
            Once enrolled, your classes, attendance, and lectures will appear here.
          </p>
        </div>
      </>
    )
  }

  const isAdmin = data.role === 'ADMIN'
  const s = data.stats

  return (
    <>
      {header}

      {/* ===== Stat tiles ===== */}
      <div className="stat-grid">
        {isAdmin ? (
          <>
            <StatTile label="Students" value={s.students} accent="#A435F0" />
            <StatTile label="Classes" value={s.classes} accent="#2563EB" />
            <StatTile label="Lectures" value={s.lectures} accent="#0F766E" />
            <StatTile label="Teachers" value={s.teachers} accent="#D97706" />
          </>
        ) : (
          <>
            <StatTile label="My Attendance" value={`${s.attendance_percent}%`} accent="#A435F0" />
            <StatTile
              label="Classes Attended"
              value={`${s.classes_attended}/${s.classes_total}`}
              accent="#2563EB"
            />
            <StatTile label="Lectures" value={s.lectures} accent="#0F766E" />
          </>
        )}
      </div>

      {/* ===== Attendance chart + ring ===== */}
      <div className="dash-row">
        <div className="dash-card dash-grow">
          <h3 className="dash-title">
            {isAdmin ? 'Attendance — recent classes' : 'My recent attendance'}
          </h3>

          {data.attendance_recent.length === 0 ? (
            <p className="muted">No attendance data yet.</p>
          ) : isAdmin ? (
            // Admin: bar chart (har class ka present %)
            <div className="bar-chart">
              {data.attendance_recent.map((c, i) => (
                <div className="bar-col" key={i} title={`${c.title}: ${c.present}/${c.total}`}>
                  <div className="bar-num">{c.percent}%</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${c.percent}%` }}></div>
                  </div>
                  <div className="bar-label">{c.title}</div>
                </div>
              ))}
            </div>
          ) : (
            // Student: present/absent dots
            <div className="dots">
              {data.attendance_recent.map((c, i) => (
                <div className="dot-item" key={i} title={`${c.title} — ${c.status}`}>
                  <span className={'dot ' + (c.status === 'PRESENT' ? 'dot-present' : 'dot-absent')}>
                    {c.status === 'PRESENT' ? '✓' : '✕'}
                  </span>
                  <span className="dot-label">{shortDate(c.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAdmin ? (
          <Ring
            percent={data.attendance_overall.percent}
            label={`${data.attendance_overall.present}/${data.attendance_overall.total} present overall`}
          />
        ) : (
          <Ring percent={s.attendance_percent} label="overall present" />
        )}
      </div>

      {/* ===== Next class + Latest announcements ===== */}
      <div className="dash-row">
        <div className="dash-card dash-grow">
          <h3 className="dash-title">{data.next_class?.is_live ? '🔴 Live class' : '📅 Next class'}</h3>
          {data.next_class ? (
            <div className="next-class">
              {data.next_class.course_name && (
                <span className="course-label">{data.next_class.course_name}</span>
              )}
              <div className="next-title">{data.next_class.title}</div>
              <div className="class-meta">
                <span>📅 {shortDate(data.next_class.date)}</span>
                {data.next_class.start_time && <span>🕒 {data.next_class.start_time.slice(0, 5)}</span>}
              </div>
            </div>
          ) : (
            <p className="muted">No upcoming class scheduled.</p>
          )}
        </div>

        <div className="dash-card dash-grow">
          <h3 className="dash-title">📢 Latest announcements</h3>
          {data.announcements.length === 0 ? (
            <p className="muted">No announcements yet.</p>
          ) : (
            <ul className="dash-ann">
              {data.announcements.map((a) => (
                <li key={a.id}>
                  {a.is_pinned && <span className="ann-pin">📌</span>}
                  {a.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardHome
