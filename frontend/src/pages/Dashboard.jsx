import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Page khulte hi: logged-in user ki details lao (/api/me/)
  useEffect(() => {
    api
      .get('/me/')
      .then((res) => setUser(res.data))
      .catch(() => logout()) // token galat/expire -> logout
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  if (loading) return <div className="center-screen">Loading...</div>
  if (!user) return null

  // Har role ke liye alag menu items
  const menusByRole = {
    ADMIN: ['📊 Dashboard', '👥 Users', '📚 Classes', '📢 Announcements', '💬 Chat', '⚙️ Settings'],
    STUDENT: ['🏠 Home', '📚 Classes', '📅 Attendance', '🎥 Lectures', '💬 Chat'],
    VISITOR: ['🏠 Home', '📚 Explore Classes'],
  }
  const menu = menusByRole[user.role] || menusByRole.VISITOR

  return (
    <div className="dashboard">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-logo">🎓 LMS</div>
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <a key={item} className="nav-item" href="#">
              {item}
            </a>
          ))}
        </nav>
        <button className="btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ===== Main content ===== */}
      <main className="main-content">
        <div className="topbar">
          <h1>
            Welcome, {user.username} <span className="wave">👋</span>
          </h1>
          <span className={`role-badge role-${user.role.toLowerCase()}`}>
            {user.role_display}
          </span>
        </div>

        {/* Role ke hisaab se message */}
        <div className="content-card">
          {user.role === 'ADMIN' && (
            <p>Aap <b>Admin (Sir)</b> ho — yahan se aap classes, users aur attendance manage kar sakenge.</p>
          )}
          {user.role === 'STUDENT' && (
            <p>Aap ek <b>Student</b> ho — yahan aapki classes, attendance aur lectures dikhenge.</p>
          )}
          {user.role === 'VISITOR' && (
            <p>Aap abhi <b>Visitor</b> ho. Enrolled hone ke liye Sir se apna id/password lein.</p>
          )}
          <p className="muted">Ye abhi shuruaati dashboard hai — aage ke steps mein isme classes, attendance waghera add honge.</p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
