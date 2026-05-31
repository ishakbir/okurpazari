/**
 * Purchase Model
 * Orders and payments for listings
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'credit_card'
    },
    // Mock payment details (in real app, never store full card)
    payment_last_four: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    shipping_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipping_carrier: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Kargo firması: PTT, Yurtiçi, MNG, Aras, Sürat'
    },
    shipping_barcode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Kargo takip barkodu'
    }
  }, {
    tableName: 'purchases',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_purchases_buyer',
        fields: ['buyer_id']
      },
      {
        name: 'idx_purchases_seller',
        fields: ['seller_id']
      },
      {
        name: 'idx_purchases_listing',
        fields: ['listing_id']
      },
      {
        name: 'idx_purchases_status',
        fields: ['status']
      }
    ]
  });

  return Purchase;
};
