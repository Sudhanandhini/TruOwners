import React, { useState } from 'react'
import './HomePage.css'

const PropertyFilters = ({ 
  filters, 
  onFiltersChange, 
  sortBy, 
  onSortChange, 
  totalProperties 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const amenitiesList = [
    'WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Elevator',
    'Balcony', 'Garden', 'Furnished', 'Air Conditioning', 'Heating',
    'Laundry', 'Pet Friendly', 'Near Metro', 'Shopping Mall', 'Hospital'
  ]

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePriceRangeChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [key]: parseInt(value) || 0
      }
    }))
  }

  const handleAmenityToggle = (amenity) => {
    onFiltersChange(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const clearAllFilters = () => {
    onFiltersChange({
      location: '',
      propertyType: 'all',
      priceRange: { min: 0, max: 10000 },
      bedrooms: 'any',
      amenities: []
    })
  }

  return (
    <div className="property-filters">
      <div className="filters-header">
        <div className="filters-title">
        </div>
        
        <div className="filters-controls">
          <button 
            className="btn btn-link"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? '🔼 Less Filters' : '🔽 More Filters'}
          </button>
          
          <button 
            className="btn btn-link"
            onClick={clearAllFilters}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="filters-content">
        {/* Basic Filters */}
        <div className="basic-filters">
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter city, area..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Bedrooms</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              className="filter-select"
            >
              <option value="any">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="advanced-filters-grid">
              <div className="filter-group price-range">
                <label>Price Range (Monthly Rent)</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="filter-input price-input"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="filter-input price-input"
                  />
                </div>
              </div>

              <div className="filter-group amenities-filter">
                <label>Amenities</label>
                <div className="amenities-grid">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                      <span className="checkmark"></span>
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyFilters
