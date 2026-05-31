/**
 * Seed Script
 * Creates test data for development
 * Note: Does NOT hash password manually - model hooks handle hashing
 */
const { User, Listing, testConnection } = require('../src/models');

async function seed() {
  try {
    await testConnection();
    
    // Create admin - password will be hashed by model hook
    const admin = await User.create({
      email: 'admin@demo.com',
      password_hash: 'Admin123!', // Model hook will hash this
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN'
    });
    console.log('Admin created:', admin.email);
    
    // Create seller
    const seller = await User.create({
      email: 'satici@demo.com',
      password_hash: 'satici123', // Model hook will hash this
      first_name: 'Satici',
      last_name: 'Demo',
      phone: '05551234567',
      role: 'USER'
    });
    console.log('Seller created:', seller.email);
    
    // Create buyer
    const buyer = await User.create({
      email: 'alici@demo.com',
      password_hash: 'alici123', // Model hook will hash this
      first_name: 'Alici',
      last_name: 'Demo',
      phone: '05559876543',
      role: 'USER'
    });
    console.log('Buyer created:', buyer.email);
    
    // Create test listing (ACTIVE)
    const listing = await Listing.create({
      seller_id: seller.id,
      title: 'Test Ürün - Elektronik',
      description: 'Bu bir test ürünüdür. Satın alma ve mesajlaşma özelliklerini test etmek için kullanılabilir.',
      price: 150.00,
      category: 'Elektronik',
      condition: 'Az Kullanılmış',
      status: 'ACTIVE'
    });
    console.log('Listing created:', listing.title);
    
    console.log('\n=== Seed Complete ===');
    console.log('Admin: admin@demo.com / Admin123!');
    console.log('Satici: satici@demo.com / satici123!');
    console.log('Alici: alici@demo.com / alici123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
