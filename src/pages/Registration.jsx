import { useState } from 'react'
import { Link } from 'react-router-dom'

function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    language: '',
    onemove_link: '',
    puprime_link: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const validatePassword = (password) => {
    const hasCapital = /[A-Z]/.test(password)
    const hasSmall = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    if (!hasCapital || !hasSmall || !hasNumber || !hasSymbol) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    return null
  }

  const validateURL = (url) => {
    try {
      new URL(url)
      return null
    } catch (e) {
      return 'Please enter a valid URL'
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate password
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    // Validate URLs
    const onemoveLinkError = validateURL(formData.onemove_link)
    if (onemoveLinkError) {
      newErrors.onemove_link = onemoveLinkError
    }

    const puprimeLinkError = validateURL(formData.puprime_link)
    if (puprimeLinkError) {
      newErrors.puprime_link = puprimeLinkError
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms of service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Submitting form data:', formData)

      const linkCode = import.meta.env.VITE_LINK_CODE || 'ADMIN-SECURE-LINK-2024'
      const response = await fetch(`/api/register/${linkCode}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Success response:', result)
        setIsSuccess(true)
      } else {
        let errorMessage = 'Failed to submit form. Please try again.'
        try {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          const errorText = await response.text()
          console.error('Error response text:', errorText)
          errorMessage = errorText || errorMessage
        }
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      // More specific error messages
      let errorMessage = 'Network error occurred. '
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage +=
          'This might be a CORS issue or the API server is not responding. Please check:\n\n'
        errorMessage += '1. The API server is running and accessible\n'
        errorMessage += '2. The API server has CORS enabled for your domain\n'
        errorMessage += '3. Your internet connection is stable\n\n'
        errorMessage += 'Check the browser console for more details.'
      } else {
        errorMessage += error.message
      }

      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-8">
        <div className="w-full max-w-[540px] rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#121212] px-10 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="mb-6 flex animate-[scaleIn_0.5s_ease-out] justify-center">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="#c4a572" strokeWidth="3" fill="none" />
              <path
                d="M30 50 L45 65 L70 35"
                stroke="#c4a572"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h1 className="mb-4 animate-[fadeInUp_0.6s_ease-out_0.2s_both] text-4xl font-semibold text-white">
            Congratulations!
          </h1>
          <p className="mb-8 animate-[fadeInUp_0.6s_ease-out_0.4s_both] text-lg leading-relaxed text-gray-300">
            Your request has been sent successfully. You will receive an email shortly with further
            instructions.
          </p>

          <div className="my-8 flex animate-[fadeIn_1s_ease-out_0.6s_both] justify-center opacity-80">
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
              <path
                d="M20 70 Q100 20 180 70"
                stroke="#c4a572"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
              />
              <circle cx="100" cy="70" r="4" fill="#c4a572" />
              <path
                d="M70 90 L100 70 L130 90"
                stroke="#c4a572"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <path
                d="M40 100 Q100 80 160 100"
                stroke="#c4a572"
                strokeWidth="1.5"
                fill="none"
                opacity="0.2"
              />
            </svg>
          </div>

          <p className="mb-6 mt-6 animate-[fadeInUp_0.6s_ease-out_0.8s_both] italic text-gold">
            Please check your inbox and spam folder for our email.
          </p>

          <button
            className="mt-6 w-full rounded-lg bg-gray-200 px-4 py-4 text-base font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_12px_rgba(232,232,232,0.2)] active:translate-y-0"
            onClick={() => window.location.reload()}
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-8">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="1Move Logo" className="h-20 object-contain" />
      </div>

      <div className="w-full max-w-[440px] rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#121212] px-10 py-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[1.75rem] font-semibold leading-snug text-white">
            Fill up the form to be a 1Move Affiliate
          </h1>
          <p className="text-sm text-gold">Start your journey with us today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
            />
          </div>

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

          <div className="mb-5">
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
                className={`w-full rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-[#333333]'
                } bg-[#252525] px-4 py-3.5 pr-12 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:bg-[#2a2a2a] focus:outline-none ${
                  errors.password
                    ? 'focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(231,76,60,0.1)]'
                    : 'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)]'
                }`}
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
            {errors.password && (
              <span className="mt-1.5 block text-[0.825rem] leading-relaxed text-red-500">
                {errors.password}
              </span>
            )}
            <p className="mt-1.5 block text-xs leading-relaxed text-gray-500">
              Must contain uppercase, lowercase, number, and symbol
            </p>
          </div>

          <div className="mb-5">
            <label htmlFor="location" className="mb-2 block text-sm font-medium text-white">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="language" className="mb-2 block text-sm font-medium text-white">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Enter your preferred language"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:border-gold focus:bg-[#2a2a2a] focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)] focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="onemove_link" className="mb-2 block text-sm font-medium text-white">
              1Move Link
            </label>
            <input
              type="url"
              id="onemove_link"
              name="onemove_link"
              value={formData.onemove_link}
              onChange={handleChange}
              placeholder="https://example.com/your-link"
              required
              className={`w-full rounded-lg border ${
                errors.onemove_link ? 'border-red-500' : 'border-[#333333]'
              } bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:bg-[#2a2a2a] focus:outline-none ${
                errors.onemove_link
                  ? 'focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(231,76,60,0.1)]'
                  : 'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)]'
              }`}
            />
            {errors.onemove_link && (
              <span className="mt-1.5 block text-[0.825rem] leading-relaxed text-red-500">
                {errors.onemove_link}
              </span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="puprime_link" className="mb-2 block text-sm font-medium text-white">
              PU Prime Link
            </label>
            <input
              type="url"
              id="puprime_link"
              name="puprime_link"
              value={formData.puprime_link}
              onChange={handleChange}
              placeholder="https://example.com/your-link"
              required
              className={`w-full rounded-lg border ${
                errors.puprime_link ? 'border-red-500' : 'border-[#333333]'
              } bg-[#252525] px-4 py-3.5 text-[0.95rem] text-white transition-all duration-300 placeholder:text-[#666666] focus:bg-[#2a2a2a] focus:outline-none ${
                errors.puprime_link
                  ? 'focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(231,76,60,0.1)]'
                  : 'focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,165,114,0.1)]'
              }`}
            />
            {errors.puprime_link && (
              <span className="mt-1.5 block text-[0.825rem] leading-relaxed text-red-500">
                {errors.puprime_link}
              </span>
            )}
          </div>

          <div className="my-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked)
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: null }))
                }
              }}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-gold"
            />
            <label htmlFor="terms" className="cursor-pointer text-sm leading-normal text-gray-300">
              I agree to the{' '}
              <a
                href="https://1move.circle.so/terms"
                target="_blank"
                className="text-gold underline transition-colors duration-300 hover:text-gold-light"
              >
                terms of service
              </a>{' '}
              and have read the{' '}
              <a
                href="https://1move.circle.so/privacy"
                target="_blank"
                className="text-gold underline transition-colors duration-300 hover:text-gold-light"
              >
                privacy policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <span className="-mt-3 mb-4 block text-[0.825rem] leading-relaxed text-red-500">
              {errors.terms}
            </span>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-gray-200 px-4 py-4 text-base font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_12px_rgba(232,232,232,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Request'}
          </button>
        </form>

        <div className="mt-7 text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link
            to="/login/admin"
            className="text-gold underline transition-colors duration-300 hover:text-gold-light"
          >
            Login here..
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Registration
