import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import './OwnerDashboard.css'

const PropertyDetailsModal = ({ property, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { token } = useAuth()

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${buildApiUrl(API_CONFIG.OWNER.PROPERTIES)}/${property.id}`, {
        method: 'DELETE',
        headers: {
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
        // Refresh properties list and close modal
        onUpdate && onUpdate()
        onClose()
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Delete property error:', err)
      setError(err.message || 'Failed to delete property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Under Review', icon: '🔍' },
      approved: { color: 'success', text: 'Live', icon: '✅' },
      rejected: { color: 'danger', text: 'Rejected', icon: '❌' },
      suspended: { color: 'danger', text: 'Suspended', icon: '⚠️' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getLocationString = (location) => {
    if (typeof location === 'string') {
      return location
    }
    if (location && typeof location === 'object') {
      // Handle different possible location object structures
      if (location.address) return location.address
      if (location.street) return location.street
      if (location.city && location.state) return `${location.city}, ${location.state}`
      if (location.coordinates && (location.coordinates.lat || location.coordinates.lng)) {
        return `Coordinates: ${location.coordinates.lat || 'N/A'}, ${location.coordinates.lng || 'N/A'}`
      }
      return 'Location not specified'
    }
    return 'Location not specified'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal property-details-modal">
        <div className="modal-header">
          <h2>{property.title}</h2>
          <div className="header-status">
            {getStatusBadge(property.status)}
          </div>
          <button className="auth-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Property Images */}
          {property.images && property.images.length > 0 && (
            <div className="property-images-section">
              <h3>Property Images</h3>
              <div className="images-grid">
                {property.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={image} 
                      alt={`${property.title} - Image ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Information */}
          <div className="property-info-section">
            <h3>Property Information</h3>
            <div className="info-grid">
              <div className="info-item">
              <label>Location</label>
                <p>📍 {getLocationString(property.location)}</p>
              </div>

              
              <div className="info-item">
                <label>Property Type</label>
                <p className="property-type-badge">{property.propertyType}</p>
              </div>
              
              <div className="info-item">
                <label>Monthly Rent</label>
                <p className="price-highlight">{formatCurrency(property.rent)}</p>
              </div>
              
              <div className="info-item">
                <label>Security Deposit</label>
                <p>{formatCurrency(property.deposit)}</p>
              </div>
              
              <div className="info-item">
                <label>Bedrooms</label>
                <p>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</p>
              </div>
              
              <div className="info-item">
                <label>Bathrooms</label>
                <p>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</p>
              </div>
              
              <div className="info-item">
                <label>Area</label>
                <p>{property.area} sq ft</p>
              </div>
              
              <div className="info-item">
                <label>Created</label>
                <p>{formatDate(property.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p className="property-description">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {property.amenities.map(amenity => (
                  <span key={amenity} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Information */}
          <div className="status-section">
            <h3>Status Information</h3>
            <div className="status-info">
              <div className="status-display">
                {getStatusBadge(property.status)}
              </div>
              <div className="status-description">
                {property.status === 'pending' && (
                  <p>Your property is currently under review by our team. This typically takes 24-48 hours.</p>
                )}
                {property.status === 'approved' && (
                  <p>Your property is live and visible to potential tenants on our platform.</p>
                )}
                {property.status === 'rejected' && (
                  <p>Your property submission needs some changes. Please contact support for details.</p>
                )}
                {property.status === 'suspended' && (
                  <p>Your property has been temporarily suspended. Please contact support for assistance.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <div className="action-buttons">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            
            <button 
              className="btn btn-primary"
              disabled={loading}
              onClick={() => {
                // TODO: Implement edit functionality
                alert('Edit functionality coming soon!')
              }}
            >
              Edit Property
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
            >
              Delete Property
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <div className="confirmation-content">
              <h4>Delete Property?</h4>
              <p>Are you sure you want to delete "{property.title}"? This action cannot be undone.</p>
              <div className="confirmation-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyDetailsModal
