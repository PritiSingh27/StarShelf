import { prisma } from '../../src/db/prisma.js';

export const resetDb = async () => {
  await prisma.authToken.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
};
