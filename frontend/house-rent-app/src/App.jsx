import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import Layout from './components/common/Layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import HomePage from './components/pages/Home/HomePage'
import OwnerDashboard from './components/pages/Owner/OwnerDashboard'
import AdminDashboard from './components/pages/Admin/AdminDashboard'
import SecretAdminAccess from './components/pages/Admin/SecretAdminAccess'
import PropertyDetailsPage from './components/pages/Property/PropertyDetailsPage'
import WishlistPage from './components/pages/Wishlist/WishlistPage'
import './styles/globals.css'
import './styles/components.css'

function AppContent() {
  const { user, isAuthenticated } = useAuth()

  // Show Owner Dashboard for logged-in owners
  if (isAuthenticated && user?.role === 'owner') {
    return (
      <Layout>
        <ErrorBoundary>
          <OwnerDashboard />
        </ErrorBoundary>
      </Layout>
    )
  }

  // Show regular HomePage for other users
  return (
    <Layout>
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    </Layout>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              {/* Regular App Route */}
              <Route path="/" element={<AppContent />} />

              {/* Property Details Route - Wrapped with Layout */}
              <Route
                path="/property/:id"
                element={
                  <Layout>
                    <ErrorBoundary>
                      <PropertyDetailsPage />
                    </ErrorBoundary>
                  </Layout>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <Layout>
                    <ErrorBoundary>
                      <WishlistPage />
                    </ErrorBoundary>
                  </Layout>
                }
              />


              {/* Hidden Admin Access Routes */}
              <Route
                path="/system/admin/secure-access-portal-2025"
                element={
                  <ErrorBoundary>
                    <SecretAdminAccess />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                }
              />

              {/* Catch all other routes */}
              <Route path="*" element={<AppContent />} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
