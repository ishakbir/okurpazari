/**
 * Conversation Model
 * Private conversations between users about a listing
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    participant1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'First participant (usually the buyer/asker)'
    },
    participant2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Second participant (usually the seller)'
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Optional: listing that initiated the conversation'
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last message for sorting'
    }
  }, {
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_conversations_participant1',
        fields: ['participant1_id']
      },
      {
        name: 'idx_conversations_participant2',
        fields: ['participant2_id']
      },
      {
        name: 'idx_conversations_listing',
        fields: ['listing_id']
      },
      {
        name: 'idx_conversations_unique_pair',
        unique: true,
        fields: ['participant1_id', 'participant2_id', 'listing_id']
      }
    ]
  });

  return Conversation;
};
