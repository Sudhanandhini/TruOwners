import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import SignUp from '../../pages/Auth/SignUp'
import OwnerSignUp from '../../pages/Auth/OwnerSignUp'
import Login from '../../pages/Auth/Login'
import AddProperty from '../../pages/Owner/AddProperty'
import PropertySuccessModal from '../../pages/Owner/PropertySuccessModal'
import defaultProfilePic from '../../../assets/images/defaultProfile.png'
import { Link } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showOwnerSignUp, setShowOwnerSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [showPropertySuccess, setShowPropertySuccess] = useState(false)
  const [successProperty, setSuccessProperty] = useState(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const { user, isAuthenticated, logout, token } = useAuth()

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Handle Sign Up modal
  const handleSignUpClick = () => {
    setShowSignUp(true)
    setIsMobileMenuOpen(false)
  }

  // Handle Owner Sign Up modal
  const handleOwnerSignUpClick = () => {
    setShowOwnerSignUp(true)
    setIsMobileMenuOpen(false)
  }

  // Handle Login modal
  const handleLoginClick = () => {
    setShowLogin(true)
    setIsMobileMenuOpen(false)
  }

  // Handle Add Property modal
  const handleAddPropertyClick = () => {
    setShowAddProperty(true)
    setShowUserMenu(false)
    setIsMobileMenuOpen(false)
  }

  // Handle Wishlist click
  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    
    if (user?.role === 'user') {
      navigate('/wishlist')
    }
  }

  // Fetch wishlist count
    // In the fetchWishlistCount function, update this line:
  // const fetchWishlistCount = async () => {
  //   if (!isAuthenticated || !token || user?.role !== 'user') return

  //   try {
  //     const response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       }
  //     })

  //     if (response.ok) {
  //       const data = await response.json()
  //       if (data.success && data.data.wishlist) {
  //         // UPDATED: Access properties from correct API response structure
  //         const properties = data.data.wishlist.properties || []
  //         setWishlistCount(properties.length)
  //       }
  //     }
  //   } catch (err) {
  //     console.warn('Failed to fetch wishlist count:', err)
  //   }
  // }


  // Close all modals
  const handleCloseModals = () => {
    setShowSignUp(false)
    setShowOwnerSignUp(false)
    setShowLogin(false)
    setShowAddProperty(false)
    setShowPropertySuccess(false)
  }

  // Switch from SignUp to Login
  const handleSwitchToLogin = () => {
    setShowSignUp(false)
    setShowOwnerSignUp(false)
    setShowLogin(true)
  }

  // Switch from Login to SignUp
  const handleSwitchToSignUp = () => {
    setShowLogin(false)
    setShowSignUp(true)
  }

  // Handle user logout
  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setIsMobileMenuOpen(false)
    setWishlistCount(0)
  }

  // Handle successful property addition
  const handlePropertySuccess = (property) => {
    setSuccessProperty(property.property)
    setShowAddProperty(false)
    setShowPropertySuccess(true)
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Fetch wishlist count when user is authenticated
  // useEffect(() => {
  //   if (isAuthenticated && user?.role === 'user') {
  //     fetchWishlistCount()
  //   }
  // }, [isAuthenticated, user, token])

  // Track auth state changes
  useEffect(() => {
    console.log('🏠 Header: Auth state changed')
    console.log('  - User:', user)
    console.log('  - isAuthenticated:', isAuthenticated)
  }, [user, isAuthenticated])

  const isOwner = user?.role === 'owner'
  const isUser = user?.role === 'user'

  console.log('🏠 Header: Rendering with:', {
    isAuthenticated,
    userExists: !!user,
    userRole: user?.role,
    isOwner,
    isUser
  })

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo/App Name */}
            <div className="header-logo">
              <Link to="/" className="app-name-link">
                <h1 className="app-name">TruOwners</h1>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="header-nav desktop-nav">
              <div className="nav-buttons">
                {isAuthenticated ? (
                  <div className="authenticated-nav">
                    {/* Wishlist Button - Only for users */}
                    {isUser && (
                      <button 
                        className="wishlist-header-btn"
                        onClick={handleWishlistClick}
                        title="View Wishlist"
                      >
                        <span className="wishlist-icon">❤️</span>
                        <span className="wishlist-text">Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="wishlist-count">{wishlistCount}</span>
                        )}
                      </button>
                    )}

                    <div className="user-menu-container">
                      <div className="user-avatar-wrapper" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <img src={defaultProfilePic} alt="User Icon" className="user-avatar-icon" />
                        <span className="user-full-name">{user?.name}</span>
                        <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
                      </div>

                      {showUserMenu && (
                        <div className="user-dropdown">
                          <div className="user-info">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-email">{user?.email}</p>
                            <p className="user-role">({user?.role})</p>
                          </div>
                          <hr className="dropdown-divider" />
                          {isUser && (
                            <>
                              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                Profile
                              </button>
                              <button className="dropdown-item" onClick={handleWishlistClick}>
                                My Wishlist ({wishlistCount})
                              </button>
                            </>
                          )}
                          {isOwner && (
                            <button className="dropdown-item" onClick={handleAddPropertyClick}>
                              Add Property
                            </button>
                          )}
                          <button className="dropdown-item logout" onClick={handleLogout}>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={handleSignUpClick}>
                      Sign Up
                    </button>
                    <button className="btn btn-primary" onClick={handleLoginClick}>
                      Login
                    </button>
                  </>
                )}

                {/* Only show "For Property Owners" button when user is NOT logged in */}
                {!isAuthenticated && (
                  <button className="btn btn-accent" onClick={handleOwnerSignUpClick}>
                    For Property Owners
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className={`header-nav mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className="mobile-nav-buttons">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                      {getInitials(user?.name)}
                    </div>
                    <div className="mobile-user-details">
                      <p className="mobile-user-name">{user?.name}</p>
                      <p className="mobile-user-email">{user?.email}</p>
                      <p className="mobile-user-role">({user?.role})</p>
                    </div>
                  </div>
                  
                  {isUser && (
                    <>
                      <button 
                        className="btn btn-secondary btn-mobile"
                        onClick={handleWishlistClick}
                      >
                        ❤️ Wishlist ({wishlistCount})
                      </button>
                      <button className="btn btn-secondary btn-mobile">
                        Profile
                      </button>
                    </>
                  )}

                  {isOwner && (
                    <button 
                      className="btn btn-secondary btn-mobile" 
                      onClick={handleAddPropertyClick}
                    >
                      Add Property
                    </button>
                  )}

                  <button className="btn btn-danger btn-mobile" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-secondary btn-mobile"
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </button>
                  <button
                    className="btn btn-primary btn-mobile"
                    onClick={handleLoginClick}
                  >
                    Login
                  </button>
                  <button className="btn btn-accent btn-mobile" onClick={handleOwnerSignUpClick}>
                    For Property Owners
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Auth Modals */}
      {showSignUp && (
        <SignUp
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {showOwnerSignUp && (
        <OwnerSignUp
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {showLogin && (
        <Login
          onClose={handleCloseModals}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}

      {/* Owner Modals */}
      {showAddProperty && (
        <AddProperty
          onClose={handleCloseModals}
          onSuccess={handlePropertySuccess}
        />
      )}

      {showPropertySuccess && (
        <PropertySuccessModal
          onClose={handleCloseModals}
          property={successProperty}
        />
      )}
    </>
  )
}

export default Header
