import React, { createContext, useContext, useState, useEffect } from 'react'
import { handleApiError, getErrorMessage } from '../utils/errorHandler'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser)
        
        // Validate stored data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setToken(storedToken)
          setUser(parsedUser)
        } else {
          // Invalid stored data, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Error restoring auth state:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setError('Error restoring authentication. Please log in again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData, authToken) => {
    try {
      if (!userData || !authToken) {
        throw new Error('Invalid login data provided')
      }
      
      if (!userData.id || !userData.email) {
        throw new Error('Incomplete user data received')
      }
      
      setUser(userData)
      setToken(authToken)
      localStorage.setItem('authToken', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setError(null)
      
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    }
  }

  const logout = () => {
    try {
      setUser(null)
      setToken(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setError(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear state even if localStorage fails
      setUser(null)
      setToken(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
