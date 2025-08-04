import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import AdminLogin from './AdminLogin'
import PropertyReview from './PropertyReview'
import UserManagement from './UserManagement'
import ErrorBoundary from '../../common/ErrorBoundary'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import './AdminDashboard.css'

const AdminDashboard = () => {
  // **ALWAYS call all hooks first, before any conditional returns**
  const { isAuthenticated, admin, logout, token } = useAdminAuth()
  const [currentView, setCurrentView] = useState('overview')
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingReviews: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // **Move useEffect hook before conditional returns**
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardStats()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  // **NOW we can do conditional returns after all hooks are called**
  if (!isAuthenticated) {
    return <AdminLogin />
  }

  const fetchDashboardStats = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setError('')
      
      // Fetch users with error handling
      let usersData = { data: { totalUsers: 0 } }
      try {
        const usersResponse = await fetch(buildApiUrl(API_CONFIG.ADMIN.USERS), {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (usersResponse.ok) {
          usersData = await usersResponse.json()
        }
      } catch (userError) {
        console.warn('Failed to fetch users:', userError)
      }

      // Fetch properties with error handling
      let propertiesData = { data: { totalProperties: 0, statusBreakdown: {} } }
      try {
        const propertiesResponse = await fetch(buildApiUrl(API_CONFIG.ADMIN.PROPERTIES), {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (propertiesResponse.ok) {
          propertiesData = await propertiesResponse.json()
        }
      } catch (propertyError) {
        console.warn('Failed to fetch properties:', propertyError)
      }

      // Safely set dashboard stats
      setDashboardStats({
        totalUsers: usersData?.data?.totalUsers || 0,
        totalProperties: propertiesData?.data?.totalProperties || 0,
        pendingReviews: propertiesData?.data?.statusBreakdown?.pending || 0,
        revenue: 45230 // This would come from a revenue API
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    try {
      logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  const renderContent = () => {
    try {
      switch (currentView) {
        case 'property-review':
          return (
            <ErrorBoundary>
              <PropertyReview />
            </ErrorBoundary>
          )
        case 'user-management':
          return (
            <ErrorBoundary>
              <UserManagement />
            </ErrorBoundary>
          )
        case 'overview':
        default:
          return (
            <div className="admin-content">
              {loading && (
                <div className="admin-loading">
                  <div className="loading-spinner large"></div>
                  <p>Loading dashboard...</p>
                </div>
              )}
              
              {error && (
                <div className="admin-error">
                  <span>⚠️</span>
                  {error}
                  <button className="btn btn-link" onClick={fetchDashboardStats}>
                    Try Again
                  </button>
                </div>
              )}
              
              {!loading && !error && (
                <>
                  <div className="admin-stats">
                    <div className="admin-stat-card">
                      <h3>Total Users</h3>
                      <div className="stat-number">{dashboardStats.totalUsers.toLocaleString()}</div>
                    </div>
                    <div className="admin-stat-card">
                      <h3>Total Properties</h3>
                      <div className="stat-number">{dashboardStats.totalProperties.toLocaleString()}</div>
                    </div>
                    <div className="admin-stat-card">
                      <h3>Pending Reviews</h3>
                      <div className="stat-number">{dashboardStats.pendingReviews}</div>
                    </div>
                    <div className="admin-stat-card">
                      <h3>Revenue</h3>
                      <div className="stat-number">${dashboardStats.revenue.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="admin-sections">
                    <div className="admin-section">
                      <h2>User Management</h2>
                      <p>Manage all users, property owners, and administrators</p>
                      <button 
                        className="admin-action-btn"
                        onClick={() => setCurrentView('user-management')}
                      >
                        👥 Manage Users
                      </button>
                    </div>

                    <div className="admin-section">
                      <h2>Property Reviews</h2>
                      <p>Review and approve property listings</p>
                      <button 
                        className="admin-action-btn"
                        onClick={() => setCurrentView('property-review')}
                      >
                        🏠 Review Properties
                      </button>
                    </div>

                    <div className="admin-section">
                      <h2>System Settings</h2>
                      <p>Configure application settings and preferences</p>
                      <button className="admin-action-btn">
                        ⚙️ System Config
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
      }
    } catch (renderError) {
      console.error('Render error in AdminDashboard:', renderError)
      return (
        <div className="admin-error">
          <span>⚠️</span>
          Failed to render dashboard content. Please try refreshing the page.
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )
    }
  }

  // Safe render with error boundary
  try {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>🛡️ Admin Control Panel</h1>
            <div className="admin-nav">
              <button 
                className={`nav-btn ${currentView === 'overview' ? 'active' : ''}`}
                onClick={() => setCurrentView('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`nav-btn ${currentView === 'user-management' ? 'active' : ''}`}
                onClick={() => setCurrentView('user-management')}
              >
                👥 Users
              </button>
              <button 
                className={`nav-btn ${currentView === 'property-review' ? 'active' : ''}`}
                onClick={() => setCurrentView('property-review')}
              >
                🏠 Properties
              </button>
            </div>
            <div className="admin-user-info">
              <span>Welcome, {admin?.name || 'Admin'}</span>
              <button className="admin-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    )
  } catch (componentError) {
    console.error('Critical error in AdminDashboard component:', componentError)
    return (
      <div className="admin-error">
        <h2>Dashboard Error</h2>
        <p>Unable to load the admin dashboard. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    )
  }
}

export default AdminDashboard
