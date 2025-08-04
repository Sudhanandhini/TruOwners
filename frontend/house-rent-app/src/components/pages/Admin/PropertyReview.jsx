import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import PropertyReviewModal from './PropertyReviewModal'
import PublishConfirmModal from './PublishConfirmModal'
import './PropertyReview.css'

const PROPERTY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

const PropertyReview = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [processingProperty, setProcessingProperty] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [totalProperties, setTotalProperties] = useState(0)
  const [statusBreakdown, setStatusBreakdown] = useState({})
  const { token } = useAdminAuth()

  // **SAFE HELPER FUNCTIONS TO PREVENT RENDERING ERRORS**
  const getLocationString = (location) => {
    try {
      if (typeof location === 'string' && location.trim()) {
        return location
      }
      if (location && typeof location === 'object') {
        if (location.address && typeof location.address === 'string') return location.address
        if (location.street && typeof location.street === 'string') return location.street
        if (location.city && location.state) {
          return `${location.city}, ${location.state}`
        }
        if (location.coordinates && typeof location.coordinates === 'object') {
          if (location.coordinates.lat && location.coordinates.lng) {
            return `Lat: ${location.coordinates.lat}, Lng: ${location.coordinates.lng}`
          }
          return 'Custom Location'
        }
        return 'Location not specified'
      }
      return 'Location not specified'
    } catch (error) {
      console.error('Error processing location:', error)
      return 'Location error'
    }
  }

  const getPropertyTitle = (title) => {
    if (typeof title === 'string' && title.trim()) {
      return title
    }
    return 'Untitled Property'
  }

  const getPropertyDescription = (description) => {
    if (typeof description === 'string' && description.trim()) {
      return description
    }
    return 'No description provided'
  }

  const getSafeNumber = (value, defaultValue = 0) => {
    const num = parseInt(value)
    return isNaN(num) ? defaultValue : num
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

  const getOwnerInfo = (owner) => {
    if (owner && typeof owner === 'object') {
      return {
        name: owner.name || owner.user?.name || 'Unknown Owner',
        verified: Boolean(owner.verified)
      }
    }
    return {
      name: 'Unknown Owner',
      verified: false
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    setLoading(true)
    setError('')

    try {
      const url = filter === 'all' 
        ? buildApiUrl(API_CONFIG.ADMIN.PROPERTIES)
        : buildApiUrl(`${API_CONFIG.ADMIN.PROPERTIES}?status=${filter}`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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
        setTotalProperties(data.data.totalProperties || 0)
        setStatusBreakdown(data.data.statusBreakdown || {})
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

  const handleReviewProperty = (property, status) => {
    setSelectedProperty(property)
    setProcessingProperty({ ...property, reviewStatus: status })
    setShowReviewModal(true)
  }

  const handleReviewSubmit = async (reviewData) => {
    if (!processingProperty) return

    try {
      const propertyId = processingProperty.id
      const response = await fetch(buildApiUrl(`/admin/properties/${propertyId}/review`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: processingProperty.reviewStatus,
          reviewNotes: reviewData.notes,
          reviewedBy: reviewData.reviewedBy
        })
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
        if (processingProperty.reviewStatus === PROPERTY_STATUS.APPROVED) {
          setShowReviewModal(false)
          setShowPublishModal(true)
        } else {
          setShowReviewModal(false)
          setProcessingProperty(null)
          setSelectedProperty(null)
          fetchProperties()
        }
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Review property error:', err)
      setError(err.message || 'Failed to review property. Please try again.')
    }
  }

  const handlePublishConfirm = async () => {
    if (!processingProperty) return

    try {
      const response = await fetch(buildApiUrl(`/admin/properties/${processingProperty.id}/publish`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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
        setShowPublishModal(false)
        setProcessingProperty(null)
        setSelectedProperty(null)
        fetchProperties()
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Publish property error:', err)
      setError(err.message || 'Failed to publish property. Please try again.')
    }
  }

  const handleCloseModals = () => {
    setShowReviewModal(false)
    setShowPublishModal(false)
    setProcessingProperty(null)
    setSelectedProperty(null)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      [PROPERTY_STATUS.PENDING]: { color: 'warning', text: 'Pending Review', icon: '🔍' },
      [PROPERTY_STATUS.APPROVED]: { color: 'success', text: 'Approved', icon: '✅' },
      [PROPERTY_STATUS.REJECTED]: { color: 'danger', text: 'Rejected', icon: '❌' }
    }
    
    const config = statusConfig[status] || statusConfig[PROPERTY_STATUS.PENDING]
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    const safeAmount = getSafeNumber(amount, 0)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(safeAmount)
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="property-review-container">
        <div className="admin-loading">
          <div className="loading-spinner large"></div>
          <p>Loading properties for review...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="property-review-container">
      <div className="review-header">
        <h1>🏠 Property Review Management</h1>
        <p>Review and manage property submissions</p>
      </div>

      {/* Filter Tabs */}
      <div className="review-filters">
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Review ({statusBreakdown.pending || 0})
        </button>
        <button 
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({statusBreakdown.approved || 0})
        </button>
        <button 
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({statusBreakdown.rejected || 0})
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Properties ({totalProperties})
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <span>⚠️</span>
          {error}
          <button className="btn btn-link" onClick={fetchProperties}>
            Try Again
          </button>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="empty-properties">
          <div className="empty-icon">🏠</div>
          <h3>No Properties Found</h3>
          <p>No properties match the current filter criteria.</p>
        </div>
      ) : (
        <div className="properties-review-grid">
          {properties.map(property => {
            const safeImages = getSafeImages(property.images)
            const ownerInfo = getOwnerInfo(property.owner)
            
            return (
              <div key={property.id} className="property-review-card">
                <div className="property-image">
                  {safeImages.length > 0 ? (
                    <img 
                      src={safeImages[0]} 
                      alt={getPropertyTitle(property.title)}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  
                  <div className="image-placeholder" style={{ display: safeImages.length > 0 ? 'none' : 'flex' }}>
                    <span>🏠</span>
                    <p>No Image</p>
                  </div>
                  
                  <div className="property-status">
                    {getStatusBadge(property.status)}
                  </div>
                </div>

                <div className="property-info">
                  <h3 className="property-title">{getPropertyTitle(property.title)}</h3>
                  <p className="property-location">📍 {getLocationString(property.location)}</p>
                  
                  <div className="property-details">
                    <span>{getSafeNumber(property.bedrooms)} Bed{getSafeNumber(property.bedrooms) !== 1 ? 's' : ''}</span>
                    <span>{getSafeNumber(property.bathrooms)} Bath{getSafeNumber(property.bathrooms) !== 1 ? 's' : ''}</span>
                    <span>{getSafeNumber(property.area)} sq ft</span>
                  </div>

                  <div className="property-pricing">
                    <div className="rent">{formatCurrency(property.rent)}/month</div>
                    <div className="deposit">Deposit: {formatCurrency(property.deposit)}</div>
                  </div>

                  <div className="property-meta">
                    <span className="property-type">{property.propertyType || 'Property'}</span>
                    <span className="created-date">
                      Submitted {formatDate(property.createdAt)}
                    </span>
                  </div>

                  <div className="owner-info">
                    <small>
                      Owner: {ownerInfo.name} {ownerInfo.verified ? '✅' : '⚠️'}
                    </small>
                  </div>

                  {property.status === PROPERTY_STATUS.PENDING && (
                    <div className="review-actions">
                      <button 
                        className="btn btn-success review-btn"
                        onClick={() => handleReviewProperty(property, PROPERTY_STATUS.APPROVED)}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="btn btn-danger review-btn"
                        onClick={() => handleReviewProperty(property, PROPERTY_STATUS.REJECTED)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {property.status !== PROPERTY_STATUS.PENDING && (
                    <div className="review-info">
                      <small>
                        Reviewed on {formatDate(property.reviewedAt || property.updatedAt)}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProperty && processingProperty && (
        <PropertyReviewModal
          property={selectedProperty}
          status={processingProperty.reviewStatus}
          onSubmit={handleReviewSubmit}
          onClose={handleCloseModals}
        />
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && selectedProperty && (
        <PublishConfirmModal
          property={selectedProperty}
          onConfirm={handlePublishConfirm}
          onClose={handleCloseModals}
        />
      )}
    </div>
  )
}

export default PropertyReview
