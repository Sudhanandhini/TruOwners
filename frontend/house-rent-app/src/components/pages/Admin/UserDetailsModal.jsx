import React, { useState } from 'react'
import './UserManagement.css'

const UserDetailsModal = ({ user, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('details')

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'admin', text: 'Admin', icon: '👑' },
      owner: { color: 'owner', text: 'Owner', icon: '🏠' },
      user: { color: 'user', text: 'User', icon: '👤' }
    }
    
    const config = roleConfig[role] || roleConfig.user
    return (
      <span className={`role-badge role-${config.color}`}>
        <span className="role-icon">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const getVerificationBadge = (isVerified) => {
    return (
      <span className={`verification-badge ${isVerified ? 'verified' : 'unverified'}`}>
        <span className="verification-icon">{isVerified ? '✅' : '⚠️'}</span>
        {isVerified ? 'Verified' : 'Unverified'}
      </span>
    )
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
    <div className="user-modal-overlay">
      <div className="user-modal">
        <div className="user-modal-header">
          <div className="user-header-info">
            <div className="user-avatar-large">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-header-details">
              <h2>{user.name || 'Unnamed User'}</h2>
              <p>{user.email}</p>
              <div className="user-header-badges">
                {getRoleBadge(user.role)}
                {getVerificationBadge(user.isVerified)}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="user-modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            User Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
          </button>
          {user.role === 'owner' && (
            <button 
              className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              Properties
            </button>
          )}
        </div>

        <div className="user-modal-content">
          {activeTab === 'details' && (
            <div className="user-details-tab">
              <div className="details-grid">
                <div className="detail-item">
                  <label>User ID</label>
                  <p>{user.id}</p>
                </div>
                
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{user.name || 'Not provided'}</p>
                </div>
                
                <div className="detail-item">
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
                
                <div className="detail-item">
                  <label>User Role</label>
                  <p>
                    {getRoleBadge(user.role)}
                  </p>
                </div>
                
                <div className="detail-item">
                  <label>Verification Status</label>
                  <p>
                    {getVerificationBadge(user.isVerified)}
                  </p>
                </div>
                
                <div className="detail-item">
                  <label>Account Created</label>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="user-actions-section">
                <h3>Admin Actions</h3>
                <div className="action-buttons">
                  <button className="btn btn-secondary">
                    📧 Send Email
                  </button>
                  <button className="btn btn-warning">
                    🔒 Suspend Account
                  </button>
                  {!user.isVerified && (
                    <button className="btn btn-success">
                      ✅ Verify Account
                    </button>
                  )}
                  <button className="btn btn-danger">
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-tab">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <p><strong>Account Created</strong></p>
                    <small>{formatDate(user.createdAt)}</small>
                  </div>
                </div>
                
                {user.isVerified && (
                  <div className="activity-item">
                    <div className="activity-icon">✅</div>
                    <div className="activity-content">
                      <p><strong>Account Verified</strong></p>
                      <small>Email verification completed</small>
                    </div>
                  </div>
                )}
                
                <div className="activity-item">
                  <div className="activity-icon">🔧</div>
                  <div className="activity-content">
                    <p><strong>More activity data coming soon</strong></p>
                    <small>Login history, property activity, etc.</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && user.role === 'owner' && (
            <div className="properties-tab">
              <div className="properties-info">
                <h3>Property Management</h3>
                <p>Properties owned by this user will be displayed here.</p>
                <div className="property-stats">
                  <div className="property-stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Total Properties</span>
                  </div>
                  <div className="property-stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Active Listings</span>
                  </div>
                  <div className="property-stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Pending Review</span>
                  </div>
                </div>
                <p className="coming-soon">🚧 Detailed property management coming soon!</p>
              </div>
            </div>
          )}
        </div>

        <div className="user-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsModal
