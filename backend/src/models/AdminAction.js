/**
 * AdminAction Model
 * Audit log for all admin actions on listings
 */
const { DataTypes } = require('sequelize');
const { ADMIN_ACTIONS } = require('../config/constants');

module.exports = (sequelize) => {
  const AdminAction = sequelize.define('AdminAction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'listings',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM(Object.values(ADMIN_ACTIONS)),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    previous_state: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Snapshot of listing state before action'
    }
  }, {
    tableName: 'admin_actions',
    timestamps: true,
    updatedAt: false, // Audit logs should not be updated
    underscored: true,
    indexes: [
      {
        name: 'idx_admin_actions_listing',
        fields: ['listing_id']
      },
      {
        name: 'idx_admin_actions_admin',
        fields: ['admin_id']
      },
      {
        name: 'idx_admin_actions_created',
        fields: ['created_at']
      }
    ]
  });

  // Instance method to get formatted action log
  AdminAction.prototype.toLogObject = function() {
    return {
      id: this.id,
      action: this.action,
      reason: this.reason,
      previousState: this.previous_state,
      createdAt: this.createdAt,
      admin: this.admin ? {
        id: this.admin.id,
        name: `${this.admin.first_name} ${this.admin.last_name}`
      } : null,
      listing: this.listing ? {
        id: this.listing.id,
        title: this.listing.title
      } : null
    };
  };

  return AdminAction;
};
