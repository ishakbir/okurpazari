/**
 * DirectMessage Model
 * Individual messages within a conversation
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DirectMessage = sequelize.define('DirectMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'direct_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_direct_messages_conversation',
        fields: ['conversation_id']
      },
      {
        name: 'idx_direct_messages_sender',
        fields: ['sender_id']
      },
      {
        name: 'idx_direct_messages_unread',
        fields: ['conversation_id', 'is_read']
      }
    ]
  });

  return DirectMessage;
};
