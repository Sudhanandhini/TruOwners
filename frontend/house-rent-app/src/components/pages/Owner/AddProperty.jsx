import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { uploadFile, generateFileName } from '../../../config/supabase'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import './Owner.css'

const AddProperty = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    rent: '',
    deposit: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: []
  })
  
  // Media file states
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()

  const amenitiesList = [
    'WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Elevator',
    'Balcony', 'Garden', 'Furnished', 'Air Conditioning', 'Heating',
    'Laundry', 'Pet Friendly', 'Near Metro', 'Shopping Mall', 'Hospital'
  ]

  // Allowed file types
  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return

    // Validate file types and sizes
    const validFiles = []
    const errors = []

    files.forEach(file => {
      const isImage = allowedTypes.images.includes(file.type)
      const isVideo = allowedTypes.videos.includes(file.type)
      
      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Invalid file type. Only images and videos are allowed.`)
        return
      }

      // Size validation (10MB for images, 100MB for videos)
      const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024
      if (file.size > maxSize) {
        const sizeLimit = isImage ? '10MB' : '100MB'
        errors.push(`${file.name}: File too large. Maximum size: ${sizeLimit}`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      // Add new files to existing ones
      setMediaFiles(prev => [...prev, ...validFiles])
      
      // Create previews for new files
      validFiles.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = {
            id: Date.now() + index,
            file,
            type: allowedTypes.images.includes(file.type) ? 'image' : 'video',
            url: event.target.result,
            name: file.name
          }
          setMediaPreviews(prev => [...prev, preview])
        }
        reader.readAsDataURL(file)
      })
    }

    // Clear input
    e.target.value = ''
  }

  const removeMedia = (id) => {
    setMediaPreviews(prev => prev.filter(preview => preview.id !== id))
    setMediaFiles(prev => {
      const preview = mediaPreviews.find(p => p.id === id)
      return prev.filter(file => file !== preview?.file)
    })
  }

  const uploadAllMedia = async () => {
    if (mediaFiles.length === 0) return []

    setUploadingMedia(true)
    const uploadedUrls = []

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i]
        const fileName = generateFileName(file.name, formData.title || 'property')
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }))

        const uploadResult = await uploadFile(file, fileName)
        
        if (uploadResult.success) {
          uploadedUrls.push(uploadResult.url)
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }))
        } else {
          throw new Error(`Failed to upload ${file.name}: ${uploadResult.error}`)
        }
      }

      return uploadedUrls
    } catch (error) {
      throw error
    } finally {
      setUploadingMedia(false)
      setUploadProgress({})
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Property title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Property description is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Property location is required')
      return false
    }
    if (!formData.rent || formData.rent <= 0) {
      setError('Valid rent amount is required')
      return false
    }
    if (!formData.deposit || formData.deposit <= 0) {
      setError('Valid deposit amount is required')
      return false
    }
    if (!formData.bedrooms || formData.bedrooms <= 0) {
      setError('Number of bedrooms is required')
      return false
    }
    if (!formData.bathrooms || formData.bathrooms <= 0) {
      setError('Number of bathrooms is required')
      return false
    }
    if (!formData.area || formData.area <= 0) {
      setError('Property area is required')
      return false
    }
    if (mediaFiles.length === 0) {
      setError('At least one image or video is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
  
    setLoading(true)
    setError('')
  
    try {
      // Upload all media files first
      const mediaUrls = await uploadAllMedia()
      
      const response = await fetch(buildApiUrl(API_CONFIG.OWNER.PROPERTIES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          rent: parseInt(formData.rent),
          deposit: parseInt(formData.deposit),
          propertyType: formData.propertyType,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: parseInt(formData.area),
          amenities: formData.amenities,
          images: mediaUrls
        }),
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
        // **Enhanced success handling with verification message**
        const enhancedData = {
          ...data.data,
          showVerificationMessage: true // Flag to show verification message
        }
        onSuccess && onSuccess({ property: enhancedData })
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Add property error:', err)
      setError(err.message || 'Failed to add property. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="auth-overlay">
      <div className="auth-modal property-modal">
        <div className="auth-header">
          <h2>Add New Property</h2>
          <p>List your property to reach thousands of potential tenants</p>
          {onClose && (
            <button className="auth-close" onClick={onClose}>×</button>
          )}
        </div>

        <form className="auth-form property-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Property Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Modern 2BHK Apartment in Downtown"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property, its features, and nearby amenities..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, Downtown, New York, NY"
                required
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="form-section">
            <h3 className="section-title">Property Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="propertyType">Property Type *</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                  <option value="villa">Villa</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="area">Area (sq ft) *</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms *</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms *</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rent">Monthly Rent ($) *</label>
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleInputChange}
                  placeholder="e.g., 2500"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deposit">Security Deposit ($) *</label>
                <input
                  type="number"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3 className="section-title">Amenities</h3>
            <p className="section-subtitle">Select all amenities available in your property</p>
            
            <div className="amenities-grid">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                  />
                  <span className="checkmark"></span>
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="form-section">
            <h3 className="section-title">Property Media</h3>
            <p className="section-subtitle">Upload high-quality images and videos to showcase your property</p>
            
            <div className="form-group">
              <label htmlFor="media">Upload Images & Videos *</label>
              
              {/* File Upload Area */}
              <div className="file-upload-area">
                <input
                  type="file"
                  id="media"
                  accept={[...allowedTypes.images, ...allowedTypes.videos].join(',')}
                  multiple
                  onChange={handleMediaChange}
                  className="file-input"
                  disabled={uploadingMedia || loading}
                />
                <label htmlFor="media" className="file-upload-label">
                  <div className="upload-icon">📷📹</div>
                  <div className="upload-text">
                    <strong>Click to upload</strong> or drag and drop
                  </div>
                  <div className="upload-hint">
                    Images: JPG, PNG, WebP (max 10MB each)<br />
                    Videos: MP4, WebM, MOV (max 100MB each)
                  </div>
                </label>
              </div>

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="media-previews-container">
                  <h4>Selected Media ({mediaPreviews.length})</h4>
                  <div className="media-previews-grid">
                    {mediaPreviews.map(preview => (
                      <div key={preview.id} className="media-preview-item">
                        {preview.type === 'image' ? (
                          <img 
                            src={preview.url} 
                            alt={preview.name}
                            className="media-preview-image"
                          />
                        ) : (
                          <video 
                            src={preview.url}
                            className="media-preview-video"
                            controls
                          />
                        )}
                        
                        <div className="media-preview-overlay">
                          <span className="media-name">{preview.name}</span>
                          <button
                            type="button"
                            className="remove-media-btn"
                            onClick={() => removeMedia(preview.id)}
                            disabled={uploadingMedia || loading}
                          >
                            ×
                          </button>
                        </div>

                        {/* Upload Progress */}
                        {uploadingMedia && uploadProgress[preview.name] !== undefined && (
                          <div className="upload-progress">
                            <div 
                              className="upload-progress-bar"
                              style={{ width: `${uploadProgress[preview.name]}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading || uploadingMedia || mediaFiles.length === 0}
          >
            {uploadingMedia ? (
              <>
                <span className="loading-spinner"></span>
                Uploading Media...
              </>
            ) : loading ? (
              <>
                <span className="loading-spinner"></span>
                Adding Property...
              </>
            ) : (
              'Add Property'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddProperty
