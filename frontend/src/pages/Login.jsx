import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Form submit hone par login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Backend ko username+password bhejo -> token milega
      const res = await api.post('/token/', { username, password })
      // Token save karo (browser ke localStorage mein)
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      // Dashboard par bhej do
      navigate('/dashboard')
    } catch (err) {
      if (err.response) {
        // Server ne jawab diya (401 = galat username/password)
        setError('Invalid username or password. Please try again.')
      } else {
        // Request server tak pahunchi hi nahi — server band hai, ya CORS block
        setError('Could not reach the server. Please make sure it is running and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">🎓 LMS</div>
        <p className="login-subtitle">UBIT - Portal</p>

        {/* Error message (agar login fail ho) */}
        {error && <div className="error-box">{error}</div>}

        <label className="field-label">Username</label>
        <input
          className="field-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          required
        />

        <label className="field-label">Password</label>
        <div className="password-wrap">
          <input
            className="field-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}

export default Login
