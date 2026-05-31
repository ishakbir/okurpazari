/**
 * Message Model
 * Questions and answers about listings
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for questions, filled for answers
      comment: 'Parent message ID for replies'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Mesaj içeriği gerekli' },
        len: {
          args: [1, 1000],
          msg: 'Mesaj 1-1000 karakter arasında olmalı'
        }
      }
    },
    is_seller_reply: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'True if this is the seller replying to a question'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'If true, visible to everyone. If false, only visible to seller and asker'
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Messages are immutable
    indexes: [
      {
        name: 'idx_messages_listing',
        fields: ['listing_id']
      },
      {
        name: 'idx_messages_parent',
        fields: ['parent_id']
      },
      {
        name: 'idx_messages_sender',
        fields: ['sender_id']
      }
    ]
  });

  return Message;
};
