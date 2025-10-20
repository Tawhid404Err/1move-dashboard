import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiRequest from '../utils/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [affiliates, setAffiliates] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [activeTab, setActiveTab] = useState('affiliates') // 'affiliates' or 'pending' or 'links'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [reviewModal, setReviewModal] = useState(null) // { request, approve: true/false }
  const [reviewReason, setReviewReason] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(null) // Track which link was copied

  const userEmail = localStorage.getItem('user_email')

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login/admin')
      return
    }

    // Fetch data based on active tab
    if (activeTab === 'affiliates' || activeTab === 'links') {
      fetchAffiliates()
    } else if (activeTab === 'pending') {
      fetchPendingRequests()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchAffiliates = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Add Bearer prefix to raw token
      const response = await apiRequest('admin/affiliates', {
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

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Add Bearer prefix to raw token
      const response = await apiRequest('admin/pending-requests', {
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
          throw new Error('Access denied. You do not have permission to view pending requests.')
        }
        throw new Error(`Failed to fetch pending requests (Status: ${response.status})`)
      }

      const data = await response.json()
      setPendingRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReviewRequest = async () => {
    if (!reviewModal) return

    try {
      setReviewLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await apiRequest('admin/review-request', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_id: reviewModal.request.id,
          approve: reviewModal.approve,
          reason: reviewReason || (reviewModal.approve ? 'Approved' : 'Rejected'),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to review request (Status: ${response.status})`)
      }

      // Success! Close modal and refresh pending requests
      setReviewModal(null)
      setReviewReason('')
      await fetchPendingRequests()
    } catch (err) {
      setError(err.message)
      if (err.message.includes('Session expired')) {
        setTimeout(() => handleLogout(), 2000)
      }
    } finally {
      setReviewLoading(false)
    }
  }

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(link)
      setTimeout(() => setCopiedLink(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_email')
    navigate('/login/admin')
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
            onClick={() => setActiveTab('affiliates')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'affiliates'
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
            {sidebarOpen && <span className="font-medium">Affiliates</span>}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              activeTab === 'pending'
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {sidebarOpen && <span className="font-medium">Pending Requests</span>}
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
            {sidebarOpen && <span className="font-medium">All Affiliate Links</span>}
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
                {activeTab === 'affiliates'
                  ? 'Approved Affiliates'
                  : activeTab === 'pending'
                    ? 'Pending Requests'
                    : 'All Affiliate Links'}
              </h1>
              <p className="text-sm text-gray-400">
                {activeTab === 'affiliates'
                  ? 'Manage and view all approved affiliates'
                  : activeTab === 'pending'
                    ? 'Review and approve pending affiliate requests'
                    : 'View and copy all affiliate referral links'}
              </p>
            </div>
            <button
              onClick={
                activeTab === 'affiliates' || activeTab === 'links'
                  ? fetchAffiliates
                  : fetchPendingRequests
              }
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
          ) : activeTab === 'affiliates' && affiliates.length === 0 ? (
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
          ) : activeTab === 'pending' && pendingRequests.length === 0 ? (
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-white">No pending requests</h3>
              <p className="text-sm text-gray-400">All affiliate requests have been reviewed.</p>
            </div>
          ) : activeTab === 'links' && affiliates.length === 0 ? (
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-white">No affiliate links found</h3>
              <p className="text-sm text-gray-400">
                There are no approved affiliates with links yet.
              </p>
            </div>
          ) : activeTab === 'affiliates' ? (
            <div className="overflow-hidden rounded-lg border border-[#1f1f1f]">
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

              {/* Mobile Card View */}
              <div className="space-y-4 p-4 lg:hidden">
                {affiliates.map((affiliate, index) => (
                  <div
                    key={affiliate.id || index}
                    className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-semibold text-gold">
                        {affiliate.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-white">
                          {affiliate.name || 'N/A'}
                        </h3>
                        <p className="truncate text-sm text-gray-400">{affiliate.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-300">{affiliate.location || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Language:</span>
                        <span className="text-gray-300">{affiliate.language || 'N/A'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                          Approved
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'links' ? (
            /* All Affiliate Links View */
            <div className="space-y-4">
              {affiliates.map((affiliate, index) => (
                <div
                  key={affiliate.id || index}
                  className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-6 transition-colors hover:border-gold/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-base font-semibold text-gold">
                          {affiliate.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{affiliate.name}</h3>
                          <p className="text-sm text-gray-400">{affiliate.email}</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[#252525] bg-[#0a0a0a] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                              Referral Link
                            </p>
                            <p className="break-all text-sm text-gold">{affiliate.unique_link}</p>
                          </div>
                          <button
                            onClick={() => handleCopyLink(affiliate.unique_link)}
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                              copiedLink === affiliate.unique_link
                                ? 'bg-green-600 text-white'
                                : 'bg-gold/10 text-gold hover:bg-gold/20'
                            }`}
                            title="Copy link"
                          >
                            {copiedLink === affiliate.unique_link ? (
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Pending Requests Table */
            <div className="overflow-hidden rounded-lg border border-[#1f1f1f]">
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
                        Language
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f] bg-[#0a0a0a]">
                    {pendingRequests.map((request, index) => (
                      <tr
                        key={request.id || index}
                        className="transition-colors hover:bg-[#0f0f0f]"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-400">
                              {request.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-white">{request.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {request.email || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {request.location || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {request.language || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {request.created_at
                            ? new Date(request.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
                            Pending
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setReviewModal({ request, approve: true })}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setReviewModal({ request, approve: false })}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-4 p-4 lg:hidden">
                {pendingRequests.map((request, index) => (
                  <div
                    key={request.id || index}
                    className="rounded-lg border border-[#1f1f1f] bg-[#0f0f0f] p-4"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-400">
                        {request.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-white">{request.name || 'N/A'}</h3>
                        <p className="truncate text-sm text-gray-400">{request.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-300">{request.location || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Language:</span>
                        <span className="text-gray-300">{request.language || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-300">
                          {request.created_at
                            ? new Date(request.created_at).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
                          Pending
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReviewModal({ request, approve: true })}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setReviewModal({ request, approve: false })}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0f0f0f] p-4 shadow-2xl sm:p-6">
            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold text-white">
                {reviewModal.approve ? 'Approve Request' : 'Reject Request'}
              </h3>
              <p className="text-sm text-gray-400">
                {reviewModal.approve
                  ? `Approve ${reviewModal.request.name}'s affiliate application?`
                  : `Reject ${reviewModal.request.name}'s affiliate application?`}
              </p>
            </div>

            {/* Request Details */}
            <div className="mb-4 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    reviewModal.approve
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {reviewModal.request.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{reviewModal.request.name}</p>
                  <p className="text-sm text-gray-400">{reviewModal.request.email}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-1 text-gray-300">{reviewModal.request.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Language:</span>
                  <span className="ml-1 text-gray-300">{reviewModal.request.language}</span>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label htmlFor="reason" className="mb-2 block text-sm font-medium text-white">
                Reason {reviewModal.approve ? '(Optional)' : '(Required)'}
              </label>
              <textarea
                id="reason"
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder={
                  reviewModal.approve
                    ? 'Add a note (optional)...'
                    : 'Please provide a reason for rejection...'
                }
                rows={3}
                className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3 text-sm text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewModal(null)
                  setReviewReason('')
                }}
                disabled={reviewLoading}
                className="flex-1 rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewRequest}
                disabled={reviewLoading || (!reviewModal.approve && !reviewReason.trim())}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  reviewModal.approve
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewLoading ? 'Processing...' : reviewModal.approve ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
