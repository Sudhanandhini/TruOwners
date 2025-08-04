import React, { useState } from 'react'
import './PropertyReview.css'

const PropertyReviewModal = ({ property, status, onSubmit, onClose }) => {
  const [reviewData, setReviewData] = useState({
    notes: '',
    reviewedBy: 'Admin'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (status === 'rejected' && !reviewData.notes.trim()) {
      alert('Please provide rejection reason in notes')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(reviewData)
    } finally {
      setSubmitting(false)
    }
  }

  const isApproval = status === 'approved'
  const isRejection = status === 'rejected'

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-modal-header">
          <h2>
            {isApproval ? '✅ Approve Property' : '❌ Reject Property'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="review-modal-content">
          <div className="property-summary">
            <h3>{property.title}</h3>
            <p>📍 {property.location}</p>
            <div className="property-quick-info">
              <span>{property.bedrooms} Bed</span>
              <span>{property.bathrooms} Bath</span>
              <span>{property.area} sq ft</span>
              <span>${property.rent}/month</span>
            </div>
          </div>

          <form className="review-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reviewedBy">Reviewed By</label>
              <input
                type="text"
                id="reviewedBy"
                value={reviewData.reviewedBy}
                onChange={(e) => setReviewData(prev => ({ ...prev, reviewedBy: e.target.value }))}
                placeholder="Admin Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">
                {isRejection ? 'Rejection Reason *' : 'Review Notes (Optional)'}
              </label>
              <textarea
                id="notes"
                value={reviewData.notes}
                onChange={(e) => setReviewData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={
                  isRejection 
                    ? "Please explain why this property is being rejected..."
                    : "Add any notes about this review..."
                }
                rows="4"
                required={isRejection}
              />
            </div>

            <div className="review-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`btn ${isApproval ? 'btn-success' : 'btn-danger'}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    {isApproval ? 'Approving...' : 'Rejecting...'}
                  </>
                ) : (
                  <>
                    {isApproval ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PropertyReviewModal
