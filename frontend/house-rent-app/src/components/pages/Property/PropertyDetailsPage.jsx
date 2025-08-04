import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import './PropertyDetailsPage.css'

const PropertyDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchPropertyDetails()
    if (isAuthenticated && user?.role === 'user') {
      checkWishlistStatus()
    }
  }, [id, isAuthenticated, user?.role])

  const fetchPropertyDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const headers = {
        'Content-Type': 'application/json'
      }

      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(buildApiUrl(`${API_CONFIG.USER.PROPERTIES}/${id}`), {
        method: 'GET',
        headers
      })

      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found')
        }
        throw new Error(data.error || handleApiError(null, response))
      }

      if (data.success) {
        setProperty(data.data.property)
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Fetch property details error:', err)
      setError(err.message || 'Failed to load property details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !token || user?.role !== 'user') return
  
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.wishlist) {
          const wishlistPropertyIds = data.data.wishlist.properties.map(prop => prop.id) || []
          setIsInWishlist(wishlistPropertyIds.includes(id))
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', `/property/${id}`)
      navigate('/login')
      return
    }
  
    if (user?.role !== 'user') {
      alert('Only users can add properties to wishlist')
      return
    }
  
    setWishlistLoading(true)
  
    try {
      let response
  
      if (isInWishlist) {
        // REMOVE from wishlist - using DELETE with propertyId in URL path
        response = await fetch(buildApiUrl(`${API_CONFIG.USER.WISHLIST_REMOVE}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            propertyId: id
          })
        })
      } else {
        // ADD to wishlist - using POST with propertyId in body
        response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            propertyId: id
          })
        })
      }
  
      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }
  
      if (response.ok && data.success) {
        setIsInWishlist(!isInWishlist)
        
        const action = !isInWishlist ? 'added to' : 'removed from'
        console.log(`Property ${action} wishlist successfully`)
        
        // Optional: Show success message
        // alert(`Property ${action} wishlist successfully!`)
      } else {
        throw new Error(data.error || getErrorMessage(data))
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
      alert(err.message || 'Failed to update wishlist. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }
  

  // NEW: Handle return to home
  const handleReturnToHome = () => {
    navigate('/')
  }

  const getLocationString = (location) => {
    try {
      if (typeof location === 'string' && location.trim()) {
        return location
      }
      if (location && typeof location === 'object') {
        if (location.address && typeof location.address === 'string') return location.address
        if (location.street && typeof location.street === 'string') return location.street
        if (location.city && location.state) return `${location.city}, ${location.state}`
        return 'Location not specified'
      }
      return 'Location not specified'
    } catch (error) {
      return 'Location not specified'
    }
  }

  const formatCurrency = (amount) => {
    const num = parseInt(amount) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getSafeImages = (images) => {
    if (Array.isArray(images)) {
      return images.filter(img => img && typeof img === 'string' && img.trim())
    }
    return []
  }

  const getSafeAmenities = (amenities) => {
    if (Array.isArray(amenities)) {
      return amenities.filter(amenity => amenity && typeof amenity === 'string' && amenity.trim())
    }
    return []
  }

  if (loading) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Property</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleReturnToHome}>
                Back to Home
              </button>
              <button className="btn btn-secondary" onClick={fetchPropertyDetails}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">🏠</div>
            <h2>Property Not Found</h2>
            <p>The property you're looking for doesn't exist or has been removed.</p>
            <button className="btn btn-primary" onClick={handleReturnToHome}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const safeImages = getSafeImages(property.images)
  const safeAmenities = getSafeAmenities(property.amenities)

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Navigation Buttons - UPDATED */}
        <div className="navigation-section">
          <div className="back-navigation">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
          
          <div className="home-navigation">
            <button className="home-btn" onClick={handleReturnToHome}>
              🏠 Return to Home
            </button>
          </div>
        </div>

        {/* Property Header */}
        <div className="property-header">
          <div className="property-title-section">
            <h1 className="property-title">{property.title || 'Untitled Property'}</h1>
            <p className="property-location">📍 {getLocationString(property.location)}</p>
            <div className="property-meta">
              <span className="property-type">{property.propertyType || 'Property'}</span>
              <span className="listed-date">Listed on {formatDate(property.createdAt)}</span>
            </div>
          </div>
          
          {/* WISHLIST BUTTON - Only show for users or non-authenticated */}
          <div className="property-actions">
            {(user?.role === 'user' || !isAuthenticated) && (
              <button 
                className={`wishlist-btn large ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                title={
                  !isAuthenticated 
                    ? 'Login to add to wishlist' 
                    : isInWishlist 
                      ? 'Remove from wishlist' 
                      : 'Add to wishlist'
                }
              >
                {wishlistLoading ? (
                  <div className="loading-spinner small"></div>
                ) : (
                  <>
                    <span className="wishlist-icon">
                      {isInWishlist ? '❤️' : '🤍'}
                    </span>
                    <span className="wishlist-text">
                      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        {safeImages.length > 0 && (
          <div className="image-gallery">
            <div className="main-image">
              <img 
                src={safeImages[currentImageIndex]} 
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                onError={(e) => {
                  e.target.src = '/placeholder-property.jpg'
                }}
              />
              
              {safeImages.length > 1 && (
                <>
                  <button 
                    className="image-nav prev"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? safeImages.length - 1 : prev - 1
                    )}
                  >
                    ‹
                  </button>
                  <button 
                    className="image-nav next"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === safeImages.length - 1 ? 0 : prev + 1
                    )}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            
            {safeImages.length > 1 && (
              <div className="image-thumbnails">
                {safeImages.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Content */}
        <div className="property-content">
          <div className="property-main">
            {/* Property Specs */}
            <div className="property-specs">
              <div className="spec-item">
                <span className="spec-number">{property.bedrooms || 0}</span>
                <span className="spec-label">Bedrooms</span>
              </div>
              <div className="spec-item">
                <span className="spec-number">{property.bathrooms || 0}</span>
                <span className="spec-label">Bathrooms</span>
              </div>
              <div className="spec-item">
                <span className="spec-number">{property.area || 0}</span>
                <span className="spec-label">sq ft</span>
              </div>
            </div>

            {/* Description */}
            <div className="description-section">
              <h3>Description</h3>
              <p>{property.description || 'No description provided'}</p>
            </div>

            {/* Amenities */}
            {safeAmenities.length > 0 && (
              <div className="amenities-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {safeAmenities.map(amenity => (
                    <div key={amenity} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span className="amenity-name">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="property-sidebar">
            {/* Pricing Card */}
            <div className="pricing-card">
              <div className="rent-info">
                <div className="rent-amount">
                  <span className="rent-price">{formatCurrency(property.rent)}</span>
                  <span className="rent-period">/month</span>
                </div>
                <div className="deposit-amount">
                  Security Deposit: {formatCurrency(property.deposit)}
                </div>
              </div>
              
              {/* Add another wishlist button in sidebar for easier access */}
              {(user?.role === 'user' || !isAuthenticated) && (
                <button 
                  className={`wishlist-sidebar-btn ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="wishlist-icon">
                        {isInWishlist ? '❤️' : '🤍'}
                      </span>
                      {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                    </>
                  )}
                </button>
              )}
              
              {isAuthenticated ? (
                <button className="contact-btn">
                  📞 Contact Owner
                </button>
              ) : (
                <button className="login-btn" onClick={() => navigate('/login')}>
                  🔐 Login to Contact Owner
                </button>
              )}
            </div>

            {/* Property Info */}
            <div className="property-info-card">
              <h3>Property Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{property.propertyType || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value status-available">🟢 Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADDED: Return to Home Section at the bottom */}
        <div className="return-section">
          <div className="return-content">
            <h3>Explore More Properties</h3>
            <p>Find more amazing properties that match your preferences</p>
            <button className="return-home-btn" onClick={handleReturnToHome}>
              🏠 Browse All Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsPage
