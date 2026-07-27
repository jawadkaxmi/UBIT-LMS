import { useOutletContext } from 'react-router-dom'

function DashboardHome() {
  // `user` Layout se aata hai (Outlet context)
  const { user } = useOutletContext()

  return (
    <>
      <div className="topbar">
        <h1>
          Welcome, {user.username} <span className="wave">👋</span>
        </h1>
        <span className={`role-badge role-${user.role.toLowerCase()}`}>
          {user.role_display}
        </span>
      </div>

      <div className="content-card">
        {user.role === 'ADMIN' && (
          <p>You are the <b>Admin (Sir)</b> — from here you can manage classes, users, and attendance.</p>
        )}
        {user.role === 'STUDENT' && (
          <p>You are a <b>Student</b> — here you will see your classes, attendance, and lectures.</p>
        )}
        {user.role === 'VISITOR' && (
          <p>You are currently a <b>Visitor</b>. To get enrolled, ask Sir for your id/password.</p>
        )}
        <p className="muted">This is an early dashboard — classes, attendance, and more will be added in later steps.</p>
      </div>
    </>
  )
}

export default DashboardHome
