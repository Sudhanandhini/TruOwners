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
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

const stats = [
  {
    value: 130,
    suffix: ' cr+',
    description: 'Brokerage saved monthly',
    prefix: '₹',
  },
  {
    value: 30,
    suffix: ' Lakh+',
    description: 'Customers Connected Monthly',
  },
  {
    value: 2,
    suffix: ' Lakh+',
    description: 'New Listings Monthly',
  },
];


const testimonials = [
  {
    name: 'John Doe',
    role: 'CEO, ABC Corp',
    text: 'This product has truly transformed our business. Highly recommended!',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Jane Smith',
    role: 'Marketing Head, XYZ Ltd',
    text: 'Excellent service, great support. It was a pleasure working with the team.',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Ravi Kumar',
    role: 'Founder, StartTech',
    text: 'Professional and efficient. We are seeing great results already!',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    name: 'Priya Patel',
    role: 'CTO, TechZen',
    text: 'Great team, fast delivery, and superb support!',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    name: 'Amit Verma',
    role: 'Co-Founder, MarketHub',
    text: 'Exactly what we needed. Highly professional!',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];



const destinations = [
  { name: 'New Cairo', image: '/src/assets/images/homebanner.jpg' },
  { name: 'El Sheikh Zayed', image: '/src/assets/images/homebanner.jpg' },
  { name: '6th of October', image: '/src/assets/images/homebanner.jpg' },
  { name: 'El Gouna', image: '/src/assets/images/homebanner.jpg' },
  { name: 'North Coast', image: '/src/assets/images/homebanner.jpg' },
  { name: 'Ras El Hekma', image: '/src/assets/images/homebanner.jpg' },
  { name: 'El Gouna', image: '/src/assets/images/homebanner.jpg' },
  { name: 'North Coast', image: '/src/assets/images/homebanner.jpg' },
  { name: 'Ras El Hekma', image: '/src/assets/images/homebanner.jpg' },
];


const HomePage = () => {
  const [showAll, setShowAll] = useState(false);
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
              <div>
              <h1 className="main-heading">
          <span className="highlight">No</span> Brokers |{" "}
          <span className="highlight">No</span> Commissions
        </h1></div>

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



          <div className='container section1'>


            {/* ✅ New Section: Top Destinations */}
            <section className="top-destinations">
              <div className="header1">
                <h3>Top Destinations:</h3>
                <button className="toggle-btn" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Show Less' : 'Show All'}
                </button>
              </div>
              <div className="cards-container">
                {destinations.slice(0, showAll ? destinations.length : 6).map((item, index) => (
                  <div
                    className="destination-card"
                    key={index}
                    style={{ backgroundImage: `url(${item.image})` }}
                  >
                    <span className="label">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>
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


         <div className="counter-container">
        <h2 className="counter-title">We Make A Difference</h2>
        <div className="counter-grid">
          {stats.map((item, index) => (
            <div className="counter-box" key={index}>
              <div className="counter-circle">
                <CountUp
                  start={0}
                  end={item.value}
                  duration={2}
                  prefix={item.prefix || ''}
                  suffix={item.suffix || ''}
                />
              </div>
              <p className="counter-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

{/* Testimonial Section */}
      <div className="testimonial-slider-container" style={{ padding: '40px 0', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="slider-title" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>
          What Our Clients Say
        </h2>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1} // Start with 1 on mobile
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          
          loop={true}
          breakpoints={{
            640: { slidesPerView: 2 }, // 2 slides on tablets
            1024: { slidesPerView: 3 } // 3 slides on desktop
          }}
          style={{ padding: '20px' }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} style={{ height: 'auto' }}>
              <div style={{
                background: ' #f5f4f4ff',
                borderRadius: '10px',
                
                padding: '30px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                height: '250px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '15px'
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0', fontSize: '1.1rem' }}>{testimonial.name}</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#666' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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