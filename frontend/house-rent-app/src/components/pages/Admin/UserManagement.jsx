import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import UserDetailsModal from './UserDetailsModal'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [totalUsers, setTotalUsers] = useState(0)
  const { token } = useAdminAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ADMIN.USERS), {
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
        setUsers(data.data.users || [])
        setTotalUsers(data.data.totalUsers || 0)
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Fetch users error:', err)
      setError(err.message || 'Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleCloseModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
  }

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Statistics
  const stats = {
    total: totalUsers,
    admins: users.filter(u => u.role === 'admin').length,
    owners: users.filter(u => u.role === 'owner').length,
    users: users.filter(u => u.role === 'user').length,
    verified: users.filter(u => u.isVerified).length,
    unverified: users.filter(u => !u.isVerified).length
  }

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="admin-loading">
          <div className="loading-spinner large"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>👥 User Management</h1>
        <p>Manage all platform users, owners, and administrators</p>
      </div>

      {/* Statistics Cards */}
      <div className="user-stats">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="stat-card admins">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>Admins</p>
          </div>
        </div>
        
        <div className="stat-card owners">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>{stats.owners}</h3>
            <p>Property Owners</p>
          </div>
        </div>
        
        <div className="stat-card users">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>Regular Users</p>
          </div>
        </div>
        
        <div className="stat-card verified">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
          </div>
        </div>
        
        <div className="stat-card unverified">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.unverified}</h3>
            <p>Unverified</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="user-controls">
        <div className="user-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Users ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            👑 Admins ({stats.admins})
          </button>
          <button 
            className={`filter-btn ${filter === 'owner' ? 'active' : ''}`}
            onClick={() => setFilter('owner')}
          >
            🏠 Owners ({stats.owners})
          </button>
          <button 
            className={`filter-btn ${filter === 'user' ? 'active' : ''}`}
            onClick={() => setFilter('user')}
          >
            👤 Users ({stats.users})
          </button>
        </div>

        <div className="user-search">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <span>⚠️</span>
          {error}
          <button className="btn btn-link" onClick={fetchUsers}>
            Try Again
          </button>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="empty-users">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No users match the current filter criteria.</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="user-card"
              onClick={() => handleUserClick(user)}
            >
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="user-badges">
                  {getRoleBadge(user.role)}
                  {getVerificationBadge(user.isVerified)}
                </div>
              </div>

              <div className="user-info">
                <h3 className="user-name">{user.name || 'Unnamed User'}</h3>
                <p className="user-email">{user.email}</p>
                
                <div className="user-meta">
                  <div className="meta-item">
                    <span className="meta-label">Role:</span>
                    <span className="meta-value">{user.role}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <span className={`meta-value ${user.isVerified ? 'verified' : 'unverified'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Joined:</span>
                    <span className="meta-value">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="user-actions">
                <button className="btn btn-link view-user">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="showing-results">
        Showing {filteredUsers.length} of {stats.total} users
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  )
}

export default UserManagement
