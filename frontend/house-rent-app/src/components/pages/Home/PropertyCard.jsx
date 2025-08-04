import React from 'react'
import './PropertyCard.css'

const PropertyCard = ({ 
  property, 
  isAuthenticated,
  onLoginRequired,
  onViewDetails
}) => {
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
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(0)}K`
    }
    return `₹${num.toLocaleString()}`
  }

  // Data validation functions
  const validateNumber = (value, max = 50) => {
    const num = parseInt(value) || 0
    return num > max ? 0 : num // Reset suspicious numbers
  }

  const validateArea = (value) => {
    const num = parseInt(value) || 0
    return num < 50 || num > 10000 ? 0 : num // Reasonable area range
  }

  const getSafeImages = (images) => {
    if (Array.isArray(images)) {
      const validImages = images.filter(img => img && typeof img === 'string' && img.trim())
      // Filter out non-property images (basic check for common non-property keywords)
      return validImages.filter(img => 
        !img.toLowerCase().includes('car') && 
        !img.toLowerCase().includes('vehicle') &&
        !img.toLowerCase().includes('auto')
      )
    }
    return []
  }

  const handleViewDetailsClick = (e) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      onLoginRequired && onLoginRequired()
    } else {
      onViewDetails && onViewDetails(property.id)
    }
  }

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    e.target.nextSibling.style.display = 'flex'
  }

  const safeImages = getSafeImages(property.images)
  const bedrooms = validateNumber(property.bedrooms, 10)
  const bathrooms = validateNumber(property.bathrooms, 10)
  const area = validateArea(property.area)

  return (
    <div className="property-card">
      <div className="property-image-container">
        {safeImages.length > 0 ? (
          <img 
            src={safeImages[0]} 
            alt={property.title || 'Property'}
            className="property-image"
            onError={handleImageError}
          />
        ) : null}
        
        <div className={`image-placeholder ${safeImages.length > 0 ? 'hidden' : ''}`}>
          <div className="placeholder-icon">🏠</div>
          <p className="placeholder-text">No Image Available</p>
        </div>

        <div className="property-type-badge">
          {property.propertyType || 'Property'}
        </div>
      </div>

      <div className="property-content">
      <div className="property-header">
  <h3 className="property-title">{property.title || 'Untitled Property'}</h3>
  <p className="property-location">
    <span className="location-icon">📍</span>
    <span className="location-text">{getLocationString(property.location)}</span>
  </p>
</div>
        
        <div className="property-specs">
          <div className="spec-item">
            <span className="spec-number">{bedrooms}</span>
            <span className="spec-label">Bed{bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="spec-divider">•</div>
          <div className="spec-item">
            <span className="spec-number">{bathrooms}</span>
            <span className="spec-label">Bath{bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="spec-divider">•</div>
          <div className="spec-item">
            <span className="spec-number">{area || 'N/A'}</span>
            <span className="spec-label">sq ft</span>
          </div>
        </div>

        <div className="property-pricing">
          <div className="rent-price">
            <span className="price-amount">{formatCurrency(property.rent)}</span>
            <span className="price-period">/month</span>
          </div>
          {property.deposit && (
            <div className="deposit-price">
              <span className="deposit-label">Deposit:</span>
              <span className="deposit-amount">{formatCurrency(property.deposit)}</span>
            </div>
          )}
        </div>

        <div className="property-actions">
          <button 
            className="view-details-btn"
            onClick={handleViewDetailsClick}
          >
            {isAuthenticated ? (
              'View Details'
            ) : (
              <>
                <span className="lock-icon">🔐</span>
                Login to View Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard