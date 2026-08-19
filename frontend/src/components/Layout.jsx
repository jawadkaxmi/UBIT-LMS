import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../api'

// Har role ke liye sidebar menu.
// Jis item mein `path` hai wo clickable link hai; jismein nahi, wo abhi
// "coming soon" (placeholder) hai — aage ke steps mein active honge.
const menusByRole = {
  ADMIN: [
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: '👨‍🏫 Teachers', path: '/teachers' },
    { label: '👥 Users' },
    { label: '📚 Classes', path: '/classes' },
    { label: '📅 Attendance', path: '/attendance' },
    { label: '🎥 Lectures', path: '/lectures' },
    { label: '📢 Announcements', path: '/announcements' },
    { label: '💬 Chat', path: '/chat' },
    { label: '⚙️ Settings' },
  ],
  STUDENT: [
    { label: '🏠 Home', path: '/dashboard' },
    { label: '📚 Classes', path: '/classes' },
    { label: '📅 Attendance', path: '/attendance' },
    { label: '🎥 Lectures', path: '/lectures' },
    { label: '📢 Announcements', path: '/announcements' },
    { label: '💬 Chat', path: '/chat' },
  ],
  VISITOR: [
    { label: '🏠 Home', path: '/dashboard' },
    { label: '📚 Explore Classes', path: '/classes' },
  ],
}

function Layout() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Logged-in user ki details lao (role-based menu ke liye)
  useEffect(() => {
    api
      .get('/me/')
      .then((res) => setUser(res.data))
      .catch(() => logout())
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

  const menu = menusByRole[user.role] || menusByRole.VISITOR

  return (
    <div className="dashboard">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-logo">🎓 LMS</div>
        <nav className="sidebar-nav">
          {menu.map((item) =>
            item.path ? (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  'nav-item' + (isActive ? ' nav-item-active' : '')
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.label}
                className="nav-item nav-item-disabled"
                title="Coming soon"
              >
                {item.label}
              </span>
            )
          )}
        </nav>
        <button className="btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* ===== Main content — child page yahan render hoga ===== */}
      <main className="main-content">
        {/* Child pages ko `user` context se milega */}
        <Outlet context={{ user }} />
      </main>
    </div>
  )
}

export default Layout
