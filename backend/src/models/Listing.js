/**
 * Listing Model
 * Defines listing schema with status workflow and visibility rules
 */
const { DataTypes } = require('sequelize');
const { LISTING_STATUS, PRODUCT_CONDITIONS } = require('../config/constants');

module.exports = (sequelize) => {
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'İlan başlığı gerekli'
        },
        len: {
          args: [5, 200],
          msg: 'İlan başlığı 5-200 karakter arasında olmalı'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'İlan açıklaması gerekli'
        },
        len: {
          args: [20, 5000],
          msg: 'İlan açıklaması 20-5000 karakter arasında olmalı'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Geçerli bir fiyat girin'
        },
        min: {
          args: [0.01],
          msg: 'Fiyat 0\'dan büyük olmalı'
        }
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Kategori seçimi gerekli'
        }
      }
    },
    condition: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Ürün durumu gerekli'
        },
        isIn: {
          args: [Object.values(PRODUCT_CONDITIONS)],
          msg: 'Geçersiz ürün durumu'
        }
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidImages(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Resimler dizi formatında olmalı');
          }
          if (value && value.length > 10) {
            throw new Error('En fazla 10 resim yükleyebilirsiniz');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM(Object.values(LISTING_STATUS)),
      allowNull: false,
      defaultValue: LISTING_STATUS.PENDING
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sold_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    listing_number: {
      type: DataTypes.STRING(8),
      allowNull: true,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'listings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_listings_status',
        fields: ['status']
      },
      {
        name: 'idx_listings_seller',
        fields: ['seller_id']
      },
      {
        name: 'idx_listings_buyer',
        fields: ['buyer_id']
      },
      {
        name: 'idx_listings_category',
        fields: ['category']
      },
      {
        name: 'idx_listings_created',
        fields: ['created_at']
      },
      {
        name: 'idx_listings_status_created',
        fields: ['status', 'created_at']
      },
      {
        name: 'idx_listings_slug',
        fields: ['slug']
      },
      {
        name: 'idx_listings_number',
        fields: ['listing_number']
      }
    ],
    hooks: {
      beforeCreate: async (listing) => {
        // Generate unique 8-digit listing number
        const generateListingNumber = () => {
          return Math.floor(10000000 + Math.random() * 90000000).toString();
        };
        
        // Generate slug from title
        const generateSlug = (title, listingNumber) => {
          const turkishChars = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
          };
          
          let slug = title.toLowerCase();
          for (const [char, replacement] of Object.entries(turkishChars)) {
            slug = slug.replace(new RegExp(char, 'g'), replacement);
          }
          
          slug = slug
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 200);
          
          return `${slug}-${listingNumber}`;
        };
        
        // Keep trying until we get a unique number
        let attempts = 0;
        while (attempts < 10) {
          try {
            const listingNumber = generateListingNumber();
            listing.listing_number = listingNumber;
            listing.slug = generateSlug(listing.title, listingNumber);
            break;
          } catch (e) {
            attempts++;
          }
        }
      }
    }
  });

  // Instance method to check if listing is editable
  Listing.prototype.isEditable = function() {
    return this.status === LISTING_STATUS.PENDING || 
           this.status === LISTING_STATUS.REJECTED;
  };

  // Instance method to check if user can view this listing
  Listing.prototype.canBeViewedBy = function(userId, userRole) {
    // Admin can view all
    if (userRole === 'ADMIN') return true;
    
    // Active listings visible to all
    if (this.status === LISTING_STATUS.ACTIVE) return true;
    
    // Seller can always view their own listings
    if (this.seller_id === userId) return true;
    
    // Buyer can view SOLD listings they bought
    if (this.status === LISTING_STATUS.SOLD && this.buyer_id === userId) return true;
    
    // PENDING and REJECTED visible only to seller
    if (this.status === LISTING_STATUS.PENDING || 
        this.status === LISTING_STATUS.REJECTED) {
      return this.seller_id === userId;
    }
    
    return false;
  };

  // Instance method to get public-safe data
  Listing.prototype.toPublicObject = function(includeSellerInfo = true) {
    const data = {
      id: this.id,
      slug: this.slug,
      listingNumber: this.listing_number,
      title: this.title,
      description: this.description,
      price: parseFloat(this.price),
      category: this.category,
      condition: this.condition,
      images: this.images || [],
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    // Include rejection reason only for seller
    if (this.status === LISTING_STATUS.REJECTED) {
      data.rejectionReason = this.rejection_reason;
    }

    // Include sold info if applicable
    if (this.status === LISTING_STATUS.SOLD) {
      data.soldAt = this.sold_at;
    }

    // Include seller info if available
    if (includeSellerInfo && this.seller) {
      data.seller = {
        id: this.seller.id,
        firstName: this.seller.first_name,
        lastName: this.seller.last_name.charAt(0) + '.' // Privacy: show only initial
      };
    }

    return data;
  };

  return Listing;
};
