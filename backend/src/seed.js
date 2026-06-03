const bcrypt = require('bcryptjs');
const { initDatabase, sequelize } = require('./config/db');
const { User, Rating } = require('./models');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // 1. Ensure DB exists
    await initDatabase();
    
    // 2. Sync database (drop tables if they exist to start fresh)
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and synced.');

    // 3. Create Default Users (Names are at least 20 chars, passwords have uppercase and special chars)
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const admin = await User.create({
      name: 'System Administrator User', // 27 chars
      email: 'admin@storerating.com',
      password: passwordHash,
      address: '999 Administration Boulevard, Suite 100, Washington, DC 20001',
      role: 'admin'
    });

    const store1 = await User.create({
      name: 'The Big Apple Shopping Store', // 28 chars
      email: 'owner1@storerating.com',
      password: passwordHash,
      address: '123 Broadway St, New York, NY 10001',
      role: 'store_owner'
    });

    const store2 = await User.create({
      name: 'Green Supermarket International', // 31 chars
      email: 'owner2@storerating.com',
      password: passwordHash,
      address: '456 Garden Ave, San Francisco, CA 94102',
      role: 'store_owner'
    });

    const store3 = await User.create({
      name: 'Tech Gadget Depot Hub Store', // 27 chars
      email: 'owner3@storerating.com',
      password: passwordHash,
      address: '789 Silicon Valley Rd, San Jose, CA 95101',
      role: 'store_owner'
    });

    const user1 = await User.create({
      name: 'Normal Customer Account One', // 27 chars
      email: 'user1@storerating.com',
      password: passwordHash,
      address: '123 User Street, Seattle, WA 98101',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Normal Customer Account Two', // 27 chars
      email: 'user2@storerating.com',
      password: passwordHash,
      address: '456 User Avenue, Austin, TX 78701',
      role: 'user'
    });

    console.log('Default users seeded successfully.');

    // 4. Create Default Ratings
    await Rating.create({
      userId: user1.id,
      storeId: store1.id,
      rating: 5
    });

    await Rating.create({
      userId: user1.id,
      storeId: store2.id,
      rating: 4
    });

    await Rating.create({
      userId: user2.id,
      storeId: store2.id,
      rating: 3
    });

    await Rating.create({
      userId: user2.id,
      storeId: store3.id,
      rating: 4
    });

    console.log('Default ratings seeded successfully.');
    console.log('Database seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
