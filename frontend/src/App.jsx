import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import DashboardHome from './pages/DashboardHome'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Attendance from './pages/Attendance'
import Lectures from './pages/Lectures'
import Chat from './pages/Chat'

function App() {
  // Agar token hai to user "logged in" hai
  const isLoggedIn = !!localStorage.getItem('access')

  return (
    <Routes>
      {/* Login page (bina sidebar) */}
      <Route path="/login" element={<Login />} />

      {/* Baaki saare pages — Layout (sidebar) ke andar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/chat" element={<Chat />} />
      </Route>

      {/* Koi bhi aur URL: logged in ho to dashboard, warna login */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />}
      />
    </Routes>
  )
}

export default App
