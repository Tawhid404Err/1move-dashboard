// API utility for handling API requests in development and production

// Get the API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use our Vercel API proxy to avoid CORS issues
  if (import.meta.env.PROD) {
    return '/api/proxy'
  }
  
  // In development, use the Vite proxy (requests go to /api which is proxied)
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

/**
 * Make an API request
 * @param {string} endpoint - The API endpoint (e.g., '/register/ADMIN-SECURE-LINK-2024')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  let url
  let requestOptions = { ...options }
  
  if (import.meta.env.PROD) {
    // In production, use our Vercel API proxy
    url = `${API_BASE_URL}?endpoint=${encodeURIComponent(cleanEndpoint)}`
  } else {
    // In development, use the Vite proxy
    url = `${API_BASE_URL}/${cleanEndpoint}`
  }
  
  console.log('[API Request]', options.method || 'GET', url)
  
  return fetch(url, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    },
  })
}

export default apiRequest

