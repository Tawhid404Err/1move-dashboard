import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()
  const [affiliates, setAffiliates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userEmail = localStorage.getItem('user_email')

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login/admin')
      return
    }

    // Fetch affiliates data on mount
    fetchAffiliates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAffiliates = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // API expects "Bearer Bearer <token>" format (token already has "Bearer " prefix)
      const response = await fetch('/api/admin/affiliates', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view affiliates.')
        }
        throw new Error(`Failed to fetch affiliates (Status: ${response.status})`)
      }

      const data = await response.json()
      setAffiliates(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_email')
    navigate('/login/admin')
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r border-[#1f1f1f] bg-[#0f0f0f] transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6">
          {sidebarOpen && <img src="/logo.png" alt="1Move Logo" className="h-10 object-contain" />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {sidebarOpen ? (
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg bg-gold/10 px-4 py-3 text-gold transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {sidebarOpen && <span className="font-medium">Affiliates</span>}
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
            {sidebarOpen && <span className="font-medium">Requests</span>}
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {sidebarOpen && <span className="font-medium">Analytics</span>}
          </button>
        </nav>

        {/* User Section */}
        <div className="border-t border-[#1f1f1f] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-[#0a0a0a]">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{userEmail}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-2xl font-semibold text-white">Approved Affiliates</h1>
              <p className="text-sm text-gray-400">Manage and view all approved affiliates</p>
            </div>
            <button
              onClick={fetchAffiliates}
              className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gold/20 border-t-gold"></div>
                <p className="text-gray-400">Loading affiliates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
              <div className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            </div>
          ) : affiliates.length === 0 ? (
            <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] py-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-white">No affiliates found</h3>
              <p className="text-sm text-gray-400">There are no approved affiliates yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#1f1f1f]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#1f1f1f] bg-[#0f0f0f]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Language
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f] bg-[#0a0a0a]">
                    {affiliates.map((affiliate, index) => (
                      <tr
                        key={affiliate.id || index}
                        className="transition-colors hover:bg-[#0f0f0f]"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                              {affiliate.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-white">
                              {affiliate.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {affiliate.email || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {affiliate.location || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {affiliate.language || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
