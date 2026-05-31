/**
 * Notification Model
 * User notifications for listing status changes and system messages
 */
const { DataTypes } = require('sequelize');
const { NOTIFICATION_TYPES } = require('../config/constants');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'listings',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(NOTIFICATION_TYPES)],
          msg: 'Geçersiz bildirim tipi'
        }
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false, // Notifications don't need updatedAt
    underscored: true,
    indexes: [
      {
        name: 'idx_notifications_user',
        fields: ['user_id']
      },
      {
        name: 'idx_notifications_user_read',
        fields: ['user_id', 'is_read']
      },
      {
        name: 'idx_notifications_created',
        fields: ['created_at']
      }
    ]
  });

  // Instance method to format for API response
  Notification.prototype.toApiObject = function() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      message: this.message,
      isRead: this.is_read,
      listingId: this.listing_id,
      createdAt: this.createdAt
    };
  };

  return Notification;
};
