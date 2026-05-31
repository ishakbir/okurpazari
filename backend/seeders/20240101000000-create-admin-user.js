'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@listingplatform.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        phone: null,
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@listingplatform.com'
    }, {});
  }
};
