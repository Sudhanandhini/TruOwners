// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    VALIDATE_OTP: '/auth/validate-otp',
    SEND_OTP: '/auth/send-otp',
    LOGIN_OTP: '/auth/login/otp',
    LOGIN_PASSWORD: '/auth/login/password'
  },
  
  // Owner endpoints
  OWNER: {
    PROPERTIES: '/owner/properties'
  },

  ADMIN: {
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    REVIEW_PROPERTY: '/admin/properties/:id/review',
    PUBLISH_PROPERTY: '/admin/properties/:id/publish'
  },

  USER: {
    PROPERTIES: '/user/properties',
    WISHLIST: '/user/wishlist',
    WISHLIST_REMOVE: '/user/wishlist'

  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
