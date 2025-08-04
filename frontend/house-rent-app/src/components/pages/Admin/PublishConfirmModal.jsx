import React, { useState } from 'react'
import './PropertyReview.css'

const PublishConfirmModal = ({ property, onConfirm, onClose }) => {
  const [publishing, setPublishing] = useState(false)

  const handleConfirm = async () => {
    setPublishing(true)
    try {
      await onConfirm()
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="publish-modal-overlay">
      <div className="publish-modal">
        <div className="publish-modal-header">
          <h2>🚀 Publish Property</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="publish-modal-content">
          <div className="publish-icon">📢</div>
          
          <h3>Ready to Publish?</h3>
          <p>
            The property <strong>"{property.title}"</strong> has been approved and is ready to be published.
          </p>
          
          <div className="publish-info">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value approved">✅ Approved</span>
            </div>
            <div className="info-item">
              <span className="info-label">Next Step:</span>
              <span className="info-value">Make visible to tenants</span>
            </div>
          </div>

          <div className="publish-note">
            <p>📝 <strong>Note:</strong> Once published, this property will be visible to all users and tenants on the platform.</p>
          </div>

          <div className="publish-actions">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={publishing}
            >
              Not Now
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={publishing}
            >
              {publishing ? (
                <>
                  <span className="loading-spinner"></span>
                  Publishing...
                </>
              ) : (
                '🚀 Yes, Publish Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublishConfirmModal
