import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  // Agar token hai to user "logged in" hai
  const isLoggedIn = !!localStorage.getItem('access')

  return (
    <Routes>
      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard — login ke baad */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Baaki koi bhi URL: logged in ho to dashboard, warna login bhejo */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />}
      />
    </Routes>
  )
}

export default App
