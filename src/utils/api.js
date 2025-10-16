// API utility for handling API requests in development and production

// Get the API base URL based on environment
const getApiBaseUrl = () => {
  // In production, use the environment variable or default to the production API
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || 'https://api.domainkini.com'
  }
  
  // In development, use the proxy (requests go to /api which is proxied)
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
  
  const url = `${API_BASE_URL}/${cleanEndpoint}`
  
  console.log('[API Request]', options.method || 'GET', url)
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export default apiRequest

