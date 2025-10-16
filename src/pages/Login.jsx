import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import apiRequest from '../utils/api'

function Login() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(role || 'admin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'affiliate', label: 'Affiliate' },
    { id: 'user', label: 'User' },
  ]

  useEffect(() => {
    if (role && role !== selectedRole) {
      setSelectedRole(role)
    }
  }, [role, selectedRole])

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole)
    navigate(`/login/${newRole}`)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Only Admin login is integrated
    if (selectedRole !== 'admin') {
      alert(
        `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} login will be available soon.`
      )
      return
    }

    setLoading(true)

    try {
      const response = await apiRequest('login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password')
      }

      // Success! Store the token and redirect
      // API expects "Bearer Bearer <token>" format, so add "Bearer " prefix to token
      const tokenToStore = data.access_token.startsWith('Bearer')
        ? data.access_token
        : `Bearer ${data.access_token}`

      localStorage.setItem('access_token', tokenToStore)
      localStorage.setItem('token_type', data.token_type)
      localStorage.setItem('user_email', formData.email)

      // Redirect to admin dashboard
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center sm:mb-8">
        <img src="/logo.png" alt="1Move Logo" className="h-16 object-contain sm:h-20" />
      </div>

      <div className="w-full max-w-[440px] rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#121212] px-6 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] sm:px-10 sm:py-10">
        {/* Role Toggle Bar */}
        <div className="mb-8">
          <div className="flex gap-2 rounded-lg bg-[#0a0a0a] p-1.5">
            {roles.map((roleItem) => (
              <button
                key={roleItem.id}
                type="button"
                onClick={() => handleRoleChange(roleItem.id)}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  selectedRole === roleItem.id
                    ? 'bg-gold text-[#0a0a0a] shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {roleItem.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 text-xl font-semibold leading-snug text-white sm:text-[1.75rem]">
            Welcome Back
          </h1>
          <p className="text-xs text-gold sm:text-sm">
            Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3.5 pr-12 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center p-1 text-gray-500 transition-colors duration-300 hover:text-gold focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-gold"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-gold transition-colors duration-300 hover:text-gold-light">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-gray-200 px-4 py-4 text-base font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_12px_rgba(232,232,232,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-gray-300">
          Want to become an affiliate?{' '}
          <Link
            to="/"
            className="text-gold underline transition-colors duration-300 hover:text-gold-light"
          >
            Register here..
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
