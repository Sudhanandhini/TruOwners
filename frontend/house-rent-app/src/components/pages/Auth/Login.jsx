import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import './Auth.css'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'

const Login = ({ onClose, onSwitchToSignUp }) => {
  const [loginMethod, setLoginMethod] = useState('password') // 'password' or 'otp'
  const [step, setStep] = useState('login') // 'login' or 'otp-verify'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const { login } = useAuth()
  const inputRefs = React.useRef([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (error) setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
  
    setLoading(true)
    setError('')
  
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.AUTH.LOGIN_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })
  
      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials.')
        } else if (response.status === 423) {
          throw new Error('Account is locked. Please contact support.')
        } else {
          throw new Error(data.error || handleApiError(null, response))
        }
      }
  
      if (data.success) {
        if (!data.data || !data.data.user || !data.data.token) {
          throw new Error('Invalid authentication data received')
        }
        
        login(data.data.user, data.data.token)
        onClose && onClose()
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Update handleSendOTP function:
  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      setError('Please enter your email address')
      return
    }
  
    setLoading(true)
    setError('')
  
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.AUTH.SEND_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Email not found. Please check your email or sign up first.')
        } else {
          throw new Error(data.error || handleApiError(null, response))
        }
      }
  
      if (data.success) {
        setStep('otp-verify')
        setResendCooldown(60)
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Send OTP error:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.AUTH.LOGIN_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpString
        }),
      })

      const data = await response.json()

      if (data.success) {
        login(data.data.user, data.data.token)
        onClose && onClose()
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      console.error('OTP login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    if (resendCooldown > 0) return
    
    const fakeEvent = { preventDefault: () => {} }
    handleSendOTP(fakeEvent)
  }

  const handleBackToLogin = () => {
    setStep('login')
    setOtp(['', '', '', '', '', ''])
    setError('')
  }

  if (step === 'otp-verify') {
    return (
      <div className="auth-overlay">
        <div className="auth-modal">
          <div className="auth-header">
            <h2>Enter OTP</h2>
            <p>We've sent a 6-digit code to</p>
            <p className="email-highlight">{formData.email}</p>
            {onClose && (
              <button className="auth-close" onClick={onClose}>×</button>
            )}
          </div>

          <form className="auth-form" onSubmit={handleOTPLogin}>
            {error && (
              <div className="auth-error">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="otp-container">
              <label className="otp-label">Enter verification code</label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Didn't receive the code?{' '}
              <button 
                className={`auth-link ${resendCooldown > 0 ? 'disabled' : ''}`}
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                type="button"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </p>
            <p>
              <button 
                className="auth-link" 
                onClick={handleBackToLogin}
                type="button"
              >
                ← Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
      {onClose && (
            <button className="auth-close" onClick={onClose}>×</button>
          )}
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your Truowners account</p>
        </div>

        <div className="auth-form">
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Login Method Selector */}
          <div className="login-method-selector">
            <button
              type="button"
              className={`method-option ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMethod('password')}
            >
              Password
            </button>
            <button
              type="button"
              className={`method-option ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setLoginMethod('otp')}
            >
              OTP
            </button>
          </div>

          <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOTP}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            {loginMethod === 'password' && (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {loginMethod === 'password' ? 'Signing In...' : 'Sending OTP...'}
                </>
              ) : (
                loginMethod === 'password' ? 'Sign In' : 'Send OTP'
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              className="auth-link" 
              onClick={onSwitchToSignUp}
              type="button"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
