import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiRequest from '../utils/api'

function AffiliateProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedLink, setCopiedLink] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'links', 'leads', 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userEmail = localStorage.getItem('user_email')

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    const token = localStorage.getItem('access_token')
    const role = localStorage.getItem('user_role')
    if (!token || role !== 'affiliate') {
      navigate('/login/affiliate')
      return
    }

    if (activeTab === 'profile' || activeTab === 'links') {
      fetchProfile()
    } else if (activeTab === 'leads') {
      fetchReferrals()
    } else if (activeTab === 'settings') {
      fetchProfile()
      fetchStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await apiRequest('affiliate/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this profile.')
        }
        throw new Error(`Failed to fetch profile (Status: ${response.status})`)
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await apiRequest('affiliate/referrals', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view referrals.')
        }
        throw new Error(`Failed to fetch referrals (Status: ${response.status})`)
      }

      const data = await response.json()
      setReferrals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await apiRequest('affiliate/status', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        if (response.status === 403) {
          throw new Error('Access denied.')
        }
        throw new Error(`Failed to fetch status (Status: ${response.status})`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Failed to fetch status:', err.message)
      // Don't show error to user for status fetch failure
    }
  }

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(link)
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleDeleteProfile = async () => {
    try {
      setDeleteLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await apiRequest('affiliate/profile', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to delete profile (Status: ${response.status})`)
      }

      // Success! Logout and redirect
      handleLogout()
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    navigate('/login/affiliate')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#1f1f1f] bg-[#0f0f0f] transition-all duration-300 lg:relative ${
          sidebarOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:w-20 lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-4 sm:px-6">
          {sidebarOpen && (
            <img src="/logo.png" alt="1Move Logo" className="h-8 object-contain sm:h-10" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white lg:block"
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
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'profile'
                ? 'bg-gold/10 text-gold'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {sidebarOpen && <span className="font-medium">My Profile</span>}
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'links'
                ? 'bg-gold/10 text-gold'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {sidebarOpen && <span className="font-medium">My Links</span>}
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'leads'
                ? 'bg-gold/10 text-gold'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
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
            {sidebarOpen && <span className="font-medium">My Leads</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'settings'
                ? 'bg-gold/10 text-gold'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m8.66-13.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24m-4.24-4.24l-4.24-4.24" />
            </svg>
            {sidebarOpen && <span className="font-medium">Settings</span>}
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
                <p className="text-xs text-gray-400">Affiliate</p>
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
        {/* Mobile Header Bar */}
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#1f1f1f] bg-[#0a0a0a] px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img src="/logo.png" alt="1Move Logo" className="h-8 object-contain" />
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-sm lg:top-0">
          <div className="flex h-auto min-h-[4rem] flex-col items-start justify-between gap-3 px-4 py-3 sm:px-6 lg:h-16 lg:flex-row lg:items-center lg:px-8 lg:py-0">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white sm:text-xl lg:text-2xl">
                {activeTab === 'profile'
                  ? 'My Profile'
                  : activeTab === 'links'
                    ? 'My Referral Links'
                    : activeTab === 'leads'
                      ? 'My Leads'
                      : 'Account Settings'}
              </h1>
              <p className="text-sm text-gray-400">
                {activeTab === 'profile'
                  ? 'View and manage your affiliate profile'
                  : activeTab === 'links'
                    ? 'Access your unique referral links'
                    : activeTab === 'leads'
                      ? 'View all your referrals and leads'
                      : 'Manage your account preferences'}
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'leads') {
                  fetchReferrals()
                } else if (activeTab === 'settings') {
                  fetchProfile()
                  fetchStatus()
                } else {
                  fetchProfile()
                }
              }}
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
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gold/20 border-t-gold"></div>
                <p className="text-gray-400">Loading profile...</p>
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
          ) : profile && activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-[#1f1f1f] bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-6 shadow-xl sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-2xl font-semibold text-gold sm:h-20 sm:w-20">
                    {profile.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white sm:text-3xl">{profile.name}</h2>
                    <p className="text-sm text-gray-400 sm:text-base">{profile.email}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#252525] bg-[#0f0f0f] p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Location
                    </p>
                    <p className="text-base font-medium text-white">{profile.location}</p>
                  </div>
                  <div className="rounded-lg border border-[#252525] bg-[#0f0f0f] p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Language
                    </p>
                    <p className="text-base font-medium text-white">{profile.language}</p>
                  </div>
                  <div className="rounded-lg border border-[#252525] bg-[#0f0f0f] p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Member Since
                    </p>
                    <p className="text-base font-medium text-white">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : profile && activeTab === 'links' ? (
            /* Links Tab */
            <div className="space-y-4">

                {/* Unique Link */}
                <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6 transition-colors hover:border-gold/20">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      className="text-gold"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <h4 className="text-base font-semibold text-white">Unique Referral Link</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-[#252525] bg-[#0a0a0a] p-3">
                      <p className="break-all text-sm text-gold">{profile.unique_link}</p>
                    </div>
                    <button
                      onClick={() => handleCopyLink(profile.unique_link)}
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        copiedLink === profile.unique_link
                          ? 'bg-green-600 text-white'
                          : 'bg-gold/10 text-gold hover:bg-gold/20'
                      }`}
                      title="Copy link"
                    >
                      {copiedLink === profile.unique_link ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1Move Link */}
                <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6 transition-colors hover:border-gold/20">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      className="text-gold"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <h4 className="text-base font-semibold text-white">1Move Link</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-[#252525] bg-[#0a0a0a] p-3">
                      <p className="break-all text-sm text-gray-300">{profile.onemove_link}</p>
                    </div>
                    <button
                      onClick={() => handleCopyLink(profile.onemove_link)}
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        copiedLink === profile.onemove_link
                          ? 'bg-green-600 text-white'
                          : 'bg-gold/10 text-gold hover:bg-gold/20'
                      }`}
                      title="Copy link"
                    >
                      {copiedLink === profile.onemove_link ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* PU Prime Link */}
                <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6 transition-colors hover:border-gold/20">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      className="text-gold"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <h4 className="text-base font-semibold text-white">PU Prime Link</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-[#252525] bg-[#0a0a0a] p-3">
                      <p className="break-all text-sm text-gray-300">{profile.puprime_link}</p>
                    </div>
                    <button
                      onClick={() => handleCopyLink(profile.puprime_link)}
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                        copiedLink === profile.puprime_link
                          ? 'bg-green-600 text-white'
                          : 'bg-gold/10 text-gold hover:bg-gold/20'
                      }`}
                      title="Copy link"
                    >
                      {copiedLink === profile.puprime_link ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
            </div>
          ) : activeTab === 'leads' ? (
            /* Leads Tab */
            referrals.length === 0 ? (
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
                <h3 className="mb-2 text-lg font-medium text-white">No leads yet</h3>
                <p className="text-sm text-gray-400">
                  Share your referral links to start generating leads.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#1f1f1f]">
                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto lg:block">
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
                          Timezone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f1f] bg-[#0a0a0a]">
                      {referrals.map((referral, index) => (
                        <tr
                          key={referral.id || index}
                          className="transition-colors hover:bg-[#0f0f0f]"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                                {referral.full_name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-white">
                                  {referral.full_name || 'N/A'}
                                </div>
                                {referral.headline && (
                                  <div className="text-xs text-gray-500">{referral.headline}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {referral.email || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {referral.location || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {referral.timezone || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {referral.created_at
                              ? new Date(referral.created_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-4 p-4 lg:hidden">
                  {referrals.map((referral, index) => (
                    <div
                      key={referral.id || index}
                      className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                          {referral.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium text-white">
                            {referral.full_name || 'N/A'}
                          </h3>
                          <p className="truncate text-sm text-gray-400">
                            {referral.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {referral.headline && (
                        <div className="mb-2 text-sm text-gray-400">{referral.headline}</div>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span className="text-gray-300">{referral.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Timezone:</span>
                          <span className="text-gray-300">{referral.timezone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-300">
                            {referral.created_at
                              ? new Date(referral.created_at).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : profile && activeTab === 'settings' ? (
            /* Settings Tab */
            <div className="space-y-6">
              {/* Account Information */}
              <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">Name</label>
                    <div className="rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3 text-white">
                      {profile.name}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-400">Email</label>
                    <div className="rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3 text-white">
                      {profile.email}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">
                        Location
                      </label>
                      <div className="rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3 text-white">
                        {profile.location}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">
                        Language
                      </label>
                      <div className="rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3 text-white">
                        {profile.language}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    To update your account information, please contact support.
                  </p>
                </div>
              </div>

              {/* Account Status */}
              {status && (
                <div className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Account Status</h3>
                  <div className="space-y-4">
                    {status.status && (
                      <div className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3">
                        <span className="text-sm font-medium text-gray-400">Status</span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            status.status === 'active'
                              ? 'bg-green-500/10 text-green-400'
                              : status.status === 'pending'
                                ? 'bg-orange-500/10 text-orange-400'
                                : status.status === 'suspended'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status.status === 'active'
                                ? 'bg-green-400'
                                : status.status === 'pending'
                                  ? 'bg-orange-400'
                                  : status.status === 'suspended'
                                    ? 'bg-red-400'
                                    : 'bg-gray-400'
                            }`}
                          ></span>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                      </div>
                    )}
                    {status.total_referrals !== undefined && (
                      <div className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3">
                        <span className="text-sm font-medium text-gray-400">Total Referrals</span>
                        <span className="text-lg font-semibold text-gold">
                          {status.total_referrals}
                        </span>
                      </div>
                    )}
                    {status.earnings !== undefined && (
                      <div className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3">
                        <span className="text-sm font-medium text-gray-400">Total Earnings</span>
                        <span className="text-lg font-semibold text-gold">
                          ${status.earnings.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {status.commission_rate !== undefined && (
                      <div className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3">
                        <span className="text-sm font-medium text-gray-400">Commission Rate</span>
                        <span className="text-base font-semibold text-white">
                          {status.commission_rate}%
                        </span>
                      </div>
                    )}
                    {status.joined_at && (
                      <div className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#0a0a0a] px-4 py-3">
                        <span className="text-sm font-medium text-gray-400">Joined</span>
                        <span className="text-base text-white">
                          {new Date(status.joined_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
                <h3 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h3>
                <p className="mb-4 text-sm text-gray-400">
                  Once you delete your profile, there is no going back. Please be certain. All your
                  affiliate data and links will be permanently deleted.
                </p>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="rounded-lg border border-red-500/50 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete My Profile
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] p-4 shadow-2xl sm:p-6">
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold text-white">Delete Profile</h3>
              <p className="text-sm text-gray-400">
                Are you sure you want to delete your profile? This action cannot be undone and you
                will lose access to all your affiliate links and data.
              </p>
            </div>

            {/* Warning */}
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 flex-shrink-0 text-red-400"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="font-medium text-red-400">Warning: This is permanent!</p>
                  <p className="mt-1 text-sm text-gray-400">
                    All your affiliate data and links will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AffiliateProfile

