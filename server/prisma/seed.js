import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  await prisma.authToken.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);

  const categoriesData = [
    { name: 'Cafe', slug: 'cafe' },
    { name: 'Restaurant', slug: 'restaurant' },
    { name: 'Grocery', slug: 'grocery' },
    { name: 'Pharmacy', slug: 'pharmacy' },
    { name: 'Salon', slug: 'salon' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fitness', slug: 'fitness' },
    { name: 'Bookstore', slug: 'bookstore' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  const admin1 = await prisma.user.create({
    data: {
      name: 'System Administrator Account',
      email: 'admin@starshelf.com',
      passwordHash: adminPasswordHash,
      address: '100 Admin Plaza, Headquarters Suite 500, New York, NY 10001',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Secondary Admin Administrator',
      email: 'admin2@starshelf.com',
      passwordHash: adminPasswordHash,
      address: '200 Executive Parkway, Suite 10, San Francisco, CA 94105',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Store Owner Alice Smith',
      email: 'owner@starshelf.com',
      passwordHash: ownerPasswordHash,
      address: '123 Baker Street, Downtown District, Seattle, WA 98101',
      role: 'OWNER',
      emailVerified: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Store Owner Bob Johnson',
      email: 'owner2@starshelf.com',
      passwordHash: ownerPasswordHash,
      address: '456 Tech Boulevard, Innovation Park, San Jose, CA 95110',
      role: 'OWNER',
      emailVerified: true,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Store Owner Carol Davis',
      email: 'owner3@starshelf.com',
      passwordHash: ownerPasswordHash,
      address: '789 Market Avenue, Central Plaza, Chicago, IL 60601',
      role: 'OWNER',
      emailVerified: true,
    },
  });

  const usersData = [
    {
      name: 'Regular Customer David Miller',
      email: 'user@starshelf.com',
      address: '12 Elm Street, Apartment 4B, Boston, MA 02108',
    },
    {
      name: 'Regular Customer Emma Wilson',
      email: 'user2@starshelf.com',
      address: '34 Oak Avenue, Suite 12, Austin, TX 78701',
    },
    {
      name: 'Regular Customer Frank Thomas',
      email: 'user3@starshelf.com',
      address: '56 Pine Road, Floor 3, Denver, CO 80202',
    },
    {
      name: 'Regular Customer Grace Taylor',
      email: 'user4@starshelf.com',
      address: '78 Maple Court, Unit 5, Atlanta, GA 30303',
    },
    {
      name: 'Regular Customer Henry Anderson',
      email: 'user5@starshelf.com',
      address: '90 Cedar Lane, Building B, Miami, FL 33101',
    },
    {
      name: 'Regular Customer Isabel Martin',
      email: 'user6@starshelf.com',
      address: '11 Birch Way, Apartment 8A, Portland, OR 97201',
    },
  ];

  const users = [];
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: {
        ...u,
        passwordHash: userPasswordHash,
        role: 'USER',
        emailVerified: true,
      },
    });
    users.push(created);
  }

  const store1 = await prisma.store.create({
    data: {
      name: 'Alice Coffee & Bakery',
      email: 'alice.bakery@starshelf.com',
      address: '123 Baker Street, Downtown District, Seattle, WA 98101',
      categoryId: categories['cafe'].id,
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Bob Tech Gadgets Superstore',
      email: 'bob.tech@starshelf.com',
      address: '456 Tech Boulevard, Innovation Park, San Jose, CA 95110',
      categoryId: categories['electronics'].id,
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Carol Fresh Organic Grocery',
      email: 'carol.grocery@starshelf.com',
      address: '789 Market Avenue, Central Plaza, Chicago, IL 60601',
      categoryId: categories['grocery'].id,
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Downtown City Pharmacy',
      email: 'city.pharmacy@starshelf.com',
      address: '500 Health Street, Medical District, Boston, MA 02115',
      categoryId: categories['pharmacy'].id,
    },
  });

  const store5 = await prisma.store.create({
    data: {
      name: 'Metro Fitness & Wellness Center',
      email: 'metro.fitness@starshelf.com',
      address: '88 Gym Boulevard, Sports Complex, Austin, TX 78704',
      categoryId: categories['fitness'].id,
    },
  });

  const ratingsSeed = [
    { userId: users[0].id, storeId: store1.id, value: 5, comment: 'Great espresso and wonderful pastries!' },
    { userId: users[1].id, storeId: store1.id, value: 4, comment: 'Nice atmosphere, though seating is limited.' },
    { userId: users[2].id, storeId: store1.id, value: 5, comment: null },
    { userId: users[3].id, storeId: store1.id, value: 4, comment: 'Friendly staff and quick service.' },
    { userId: users[4].id, storeId: store1.id, value: 5, comment: 'Best croissants in the city!' },

    { userId: users[0].id, storeId: store2.id, value: 4, comment: 'Wide selection of accessories.' },
    { userId: users[1].id, storeId: store2.id, value: 3, comment: 'Prices are a bit high but quality is solid.' },
    { userId: users[2].id, storeId: store2.id, value: 5, comment: null },
    { userId: users[4].id, storeId: store2.id, value: 4, comment: 'Helpful tech support team.' },

    { userId: users[1].id, storeId: store3.id, value: 5, comment: 'Super fresh produce every day.' },
    { userId: users[2].id, storeId: store3.id, value: 5, comment: 'Love the organic options!' },
    { userId: users[3].id, storeId: store3.id, value: 4, comment: null },
    { userId: users[5].id, storeId: store3.id, value: 4, comment: 'Clean aisle setup and pleasant staff.' },

    { userId: users[0].id, storeId: store4.id, value: 4, comment: null },
    { userId: users[3].id, storeId: store4.id, value: 5, comment: 'Fast prescription refills.' },

    { userId: users[2].id, storeId: store5.id, value: 5, comment: 'Top tier gym equipment and clean showers.' },
    { userId: users[4].id, storeId: store5.id, value: 4, comment: null },
  ];

  for (const r of ratingsSeed) {
    await prisma.rating.create({ data: r });
  }

  const sampleRawToken1 = 'seed_verify_token_123';
  const tokenHash1 = crypto.createHash('sha256').update(sampleRawToken1).digest('hex');
  await prisma.authToken.create({
    data: {
      userId: users[0].id,
      type: 'EMAIL_VERIFY',
      tokenHash: tokenHash1,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const sampleRawToken2 = 'seed_reset_token_456';
  const tokenHash2 = crypto.createHash('sha256').update(sampleRawToken2).digest('hex');
  await prisma.authToken.create({
    data: {
      userId: admin1.id,
      type: 'PASSWORD_RESET',
      tokenHash: tokenHash2,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully for all database schemas (User, Category, Store, Rating, AuthToken)');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
