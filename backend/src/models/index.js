/**
 * Sequelize Models Index
 * Initializes database connection and loads all models
 */
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging ? (msg) => logger.debug(msg) : false,
    pool: dbConfig.pool,
    define: dbConfig.define
  }
);

// Initialize models
const User = require('./User')(sequelize);
const Listing = require('./Listing')(sequelize);
const AdminAction = require('./AdminAction')(sequelize);
const Notification = require('./Notification')(sequelize);
const Message = require('./Message')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const DirectMessage = require('./DirectMessage')(sequelize);
const SiteSettings = require('./SiteSettings')(sequelize);

// Define associations
// User -> Listings (as seller)
User.hasMany(Listing, { 
  foreignKey: 'seller_id', 
  as: 'listings' 
});
Listing.belongsTo(User, { 
  foreignKey: 'seller_id', 
  as: 'seller' 
});

// User -> Listings (as buyer)
User.hasMany(Listing, { 
  foreignKey: 'buyer_id', 
  as: 'purchasedListings' 
});
Listing.belongsTo(User, { 
  foreignKey: 'buyer_id', 
  as: 'buyer' 
});

// User -> AdminActions (admin who performed)
User.hasMany(AdminAction, { 
  foreignKey: 'admin_id', 
  as: 'adminActions' 
});
AdminAction.belongsTo(User, { 
  foreignKey: 'admin_id', 
  as: 'admin' 
});

// Listing -> AdminActions
Listing.hasMany(AdminAction, { 
  foreignKey: 'listing_id', 
  as: 'actions' 
});
AdminAction.belongsTo(Listing, { 
  foreignKey: 'listing_id', 
  as: 'listing' 
});

// User -> Notifications
User.hasMany(Notification, { 
  foreignKey: 'user_id', 
  as: 'notifications' 
});
Notification.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Listing -> Notifications
Listing.hasMany(Notification, { 
  foreignKey: 'listing_id', 
  as: 'notifications' 
});
Notification.belongsTo(Listing, { 
  foreignKey: 'listing_id', 
  as: 'listing' 
});

// User -> Messages (sender)
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages'
});
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

// Listing -> Messages
Listing.hasMany(Message, {
  foreignKey: 'listing_id',
  as: 'messages'
});
Message.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing'
});

// Message -> Replies (self-referencing)
Message.hasMany(Message, {
  foreignKey: 'parent_id',
  as: 'replies'
});
Message.belongsTo(Message, {
  foreignKey: 'parent_id',
  as: 'parent'
});

// User -> Purchases (as buyer)
User.hasMany(Purchase, {
  foreignKey: 'buyer_id',
  as: 'purchases'
});
Purchase.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer'
});

// User -> Purchases (as seller)
User.hasMany(Purchase, {
  foreignKey: 'seller_id',
  as: 'sales'
});
Purchase.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

// Listing -> Purchase (one-to-one for sold items)
Listing.hasOne(Purchase, {
  foreignKey: 'listing_id',
  as: 'purchase'
});
Purchase.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing'
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Veritabanı bağlantısı başarılı');
  } catch (error) {
    logger.error('Veritabanı bağlantı hatası:', error);
    throw error;
  }
};

// Sync database (use migrations in production)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(`Veritabanı senkronize edildi ${force ? '(tablolar yeniden oluşturuldu)' : ''}`);
  } catch (error) {
    logger.error('Veritabanı senkronizasyon hatası:', error);
    throw error;
  }
};

// Conversation associations
Conversation.belongsTo(User, {
  foreignKey: 'participant1_id',
  as: 'participant1'
});
Conversation.belongsTo(User, {
  foreignKey: 'participant2_id',
  as: 'participant2'
});
Conversation.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing'
});
Conversation.hasMany(DirectMessage, {
  foreignKey: 'conversation_id',
  as: 'messages'
});

DirectMessage.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});
DirectMessage.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

User.hasMany(Conversation, {
  foreignKey: 'participant1_id',
  as: 'conversationsAsParticipant1'
});
User.hasMany(Conversation, {
  foreignKey: 'participant2_id',
  as: 'conversationsAsParticipant2'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Listing,
  AdminAction,
  Notification,
  Message,
  Purchase,
  Conversation,
  DirectMessage,
  SiteSettings,
  testConnection,
  syncDatabase
};

