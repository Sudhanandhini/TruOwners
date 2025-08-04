const Property = require('../models/Property');
const Owner = require('../models/Owner');
const { PROPERTY_STATUS } = require('../utils/constants');

// Upload new property
const uploadProperty = async (req, res) => {
  const {
    title,
    description,
    location,
    rent,
    deposit,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
    images
  } = req.body;

  try {
    // Find owner profile
    const owner = await Owner.findOne({ user: req.user._id });
    console.log(owner);
    
    if (!owner) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        error: {
          message: 'Owner profile not found'
        },
        data: null
      });
    }

    const property = new Property({
      owner: owner._id,
      title,
      description,
      location,
      rent,
      deposit,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      amenities: amenities || [],
      images: images || [],
      status: PROPERTY_STATUS.PENDING
    });

    response = await property.save();

    console.log("Property saved:", response);
    
    
    // Add property to owner's properties list
    owner.properties.push(property._id);
    await owner.save();

    res.status(201).json({
      statusCode: 201,
      success: true,
      error: null,
      data: {
        message: 'Property uploaded successfully',
        property: {
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent,
          deposit: property.deposit,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          owner: property.owner,
          createdAt: property.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Upload property error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      },
      data: null
    });
  }
};

// Get owner's properties
const getOwnerProperties = async (req, res) => {
  try {
    const owner = await Owner.findOne({ user: req.user._id }).populate('properties');
    if (!owner) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: 'Owner profile not found'
        },
        data: null
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: 'Properties retrieved successfully',
        properties: owner.properties.map(property => ({
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent,
          deposit: property.deposit,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        })),
        totalProperties: owner.properties.length
      }
    });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      },
      data: null
    });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: 'Property not found'
        },
        data: null
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: 'Property retrieved successfully',
        property: {
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent,
          deposit: property.deposit,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      },
      data: null
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'title', 'description', 'location', 'rent', 'deposit',
    'propertyType', 'bedrooms', 'bathrooms', 'area', 'amenities', 'images'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      error: {
        message: 'Invalid updates! Allowed fields: ' + allowedUpdates.join(', ')
      },
      data: null
    });
  }

  try {
    const owner = await Owner.findOne({ user: req.user._id });
    if (!owner) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        error: {
          message: 'Owner profile not found'
        },
        data: null
      });
    }

    const property = await Property.findOne({
      _id: req.params.id,
      owner: owner._id
    });

    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: 'Property not found or you do not have permission to update this property'
        },
        data: null
      });
    }

    // If property is approved/published, changing it will require re-approval
    if (property.status === PROPERTY_STATUS.APPROVED || property.status === PROPERTY_STATUS.PUBLISHED) {
      property.status = PROPERTY_STATUS.PENDING;
    }

    updates.forEach(update => property[update] = req.body[update]);
    property.updatedAt = new Date();
    await property.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: 'Property updated successfully',
        property: {
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent,
          deposit: property.deposit,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          owner: property.owner,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      },
      data: null
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: 'Property not found'
        },
        data: null
      });
    }

    await Property.deleteOne({ _id: req.params.id });
    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: 'Property deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      },
      data: null
    });
  }
};

module.exports = {
  uploadProperty,
  getOwnerProperties,
  updateProperty,
  getProperty,
  deleteProperty
};