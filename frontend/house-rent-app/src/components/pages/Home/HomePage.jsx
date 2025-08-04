import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import PropertyCard from './PropertyCard'
import PropertyFilters from './PropertyFilters'
import AuthPromptModal from './AuthPromptModal'
import Login from '../Auth/Login'
import Register from '../Auth/SignUp'
import PropertyDetailsModal from './PropertyDetailsModal'
import './HomePage.css'

const HomePage = () => {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [filters, setFilters] = useState({
    location: '',
    propertyType: 'all',
    priceRange: { min: 0, max: 10000 },
    bedrooms: 'any',
    amenities: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { user, isAuthenticated, token } = useAuth()

  useEffect(() => {
    fetchProperties()
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      const propertyToView = localStorage.getItem('propertyToView')
      if (propertyToView) {
        localStorage.removeItem('propertyToView')
        // Navigate to property details page instead of showing modal
        window.open(`/property/${propertyToView}`, '_blank')
      }
    }
  }, [isAuthenticated, properties])

  useEffect(() => {
    applyFilters()
  }, [properties, filters, searchTerm, sortBy])

  const fetchProperties = async () => {
    setLoading(true)
    setError('')

    try {
      const headers = {
        'Content-Type': 'application/json'
      }

      // Add auth header if user is logged in
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(buildApiUrl(API_CONFIG.USER.PROPERTIES), {
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
        throw new Error(data.error || handleApiError(null, response))
      }

      if (data.success) {
        setProperties(data.data.properties || [])
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Fetch properties error:', err)
      setError(err.message || 'Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) return

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
        if (data.success) {
          setWishlist(data.data.wishlist || [])
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err)
    }
  }

  const handleWishlistToggle = async (propertyId) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    try {
      const isInWishlist = wishlist.includes(propertyId)
      const method = isInWishlist ? 'DELETE' : 'POST'

      const response = await fetch(buildApiUrl(`${API_CONFIG.USER.WISHLIST}/${propertyId}`), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          if (isInWishlist) {
            setWishlist(prev => prev.filter(id => id !== propertyId))
          } else {
            setWishlist(prev => [...prev, propertyId])
          }
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
    }
  }

  const handlePropertyClick = (property) => {
    setSelectedProperty(property)
    setShowPropertyDetails(true)
  }

  // NEW: Handle login requirement for view details
  const handleLoginRequired = () => {
    setShowLogin(true)
  }

  // NEW: Handle successful login
  const handleAuthSuccess = () => {
    setShowLogin(false)
    setShowRegister(false)
    setShowAuthPrompt(false)
  }

  // NEW: Switch between login and register
  const handleSwitchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  const applyFilters = () => {
    let filtered = [...properties]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocationString(property.location).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property =>
        getLocationString(property.location).toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType)
    }

    // Price range filter
    filtered = filtered.filter(property =>
      property.rent >= filters.priceRange.min && property.rent <= filters.priceRange.max
    )

    // Bedrooms filter
    if (filters.bedrooms !== 'any') {
      const bedroomCount = parseInt(filters.bedrooms)
      filtered = filtered.filter(property => property.bedrooms === bedroomCount)
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(property =>
        filters.amenities.every(amenity =>
          (property.amenities || []).includes(amenity)
        )
      )
    }

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.rent - b.rent
        case 'price-high':
          return b.rent - a.rent
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        default:
          return 0
      }
    })

    setFilteredProperties(filtered)
  }

  const getLocationString = (location) => {
    if (typeof location === 'string') {
      return location
    }
    if (location && typeof location === 'object') {
      if (location.address) return location.address
      if (location.street) return location.street
      if (location.city && location.state) return `${location.city}, ${location.state}`
      return 'Location not specified'
    }
    return 'Location not specified'
  }

  const handleCloseModals = () => {
    setShowAuthPrompt(false)
    setShowLogin(false)
    setShowRegister(false)
    setShowPropertyDetails(false)
    setSelectedProperty(null)
  }

  if (loading) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Loading properties...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="homepage">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Find Your Perfect Rental Home</h1>
              <div className="hero-bottom-content">
                <p className="hero-subtitle">
                  Discover amazing properties from verified owners across the city
                </p>
                {!isAuthenticated && (
                  <div className="hero-auth-prompt">
                    <p>Sign up to save your favorite properties and get personalized recommendations!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Filters Section */}
          <PropertyFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProperties={filteredProperties.length}
          />

          {error && (
            <div className="homepage-error">
              <span>⚠️</span>
              {error}
              <button className="btn btn-link" onClick={fetchProperties}>
                Try Again
              </button>
            </div>
          )}

          {/* Properties Grid */}
          <div className="properties-section">
            <div className="properties-header">
              {/* Commented section kept as is */}
            </div>

            {filteredProperties.length === 0 ? (
              <div className="empty-properties">
                <div className="empty-icon">🏠</div>
                <h3>No properties match your criteria</h3>
                <p>Try adjusting your filters or search terms to see more results.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setFilters({
                      location: '',
                      propertyType: 'all',
                      priceRange: { min: 0, max: 10000 },
                      bedrooms: 'any',
                      amenities: []
                    })
                    setSearchTerm('')
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    // isInWishlist={wishlist.includes(property.id)}
                    onWishlistToggle={() => handleWishlistToggle(property.id)}
                    onClick={() => handlePropertyClick(property)}
                    onLoginRequired={handleLoginRequired}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAuthPrompt && (
        <AuthPromptModal onClose={handleCloseModals} />
      )}

      {showLogin && (
        <Login
          onClose={handleCloseModals}
          onSwitchToSignUp={handleSwitchToRegister}
        />
      )}

      {showRegister && (
        <Register
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {showPropertyDetails && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={handleCloseModals}
          // isInWishlist={wishlist.includes(selectedProperty.id)}
          onWishlistToggle={() => handleWishlistToggle(selectedProperty.id)}
          isAuthenticated={isAuthenticated}
          onAuthPrompt={() => setShowAuthPrompt(true)}
        />
      )}
    </>
  )
}

export default HomePage