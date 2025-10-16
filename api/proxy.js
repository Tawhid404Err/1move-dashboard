// Vercel serverless function to proxy API requests
// This solves CORS issues in production by making server-side requests

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { method, body, headers } = req
    
    // Get the target URL from query parameters
    const { endpoint } = req.query
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' })
    }

    // Construct the target URL
    const targetUrl = `https://api.domainkini.com/${Array.isArray(endpoint) ? endpoint.join('/') : endpoint}`
    
    console.log(`[Proxy] ${method} ${targetUrl}`)

    // Prepare headers for the target request
    const targetHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Forward authorization header if present
    if (headers.authorization) {
      targetHeaders.Authorization = headers.authorization
    }

    // Make the request to the target API
    const response = await fetch(targetUrl, {
      method,
      headers: targetHeaders,
      body: method !== 'GET' && method !== 'HEAD' && body ? JSON.stringify(body) : undefined,
    })

    // Get response data
    const responseData = await response.text()
    
    // Set response status and headers
    res.status(response.status)
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(responseData)
      res.json(jsonData)
    } catch {
      res.send(responseData)
    }

  } catch (error) {
    console.error('[Proxy] Error:', error)
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    })
  }
}
