import bcrypt from 'bcrypt';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { parsePagination } from '../../shared/utils/pagination.js';
import { parseSort } from '../../shared/utils/sort.js';
import { escapeLike } from '../../shared/utils/escapeLike.js';

export const getAdminStats = async () => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const ratingsRecent = await prisma.rating.findMany({
    where: {
      createdAt: {
        gte: fourteenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const countsByDay = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    countsByDay[dateStr] = 0;
  }

  for (const r of ratingsRecent) {
    const dateStr = r.createdAt.toISOString().split('T')[0];
    if (countsByDay[dateStr] !== undefined) {
      countsByDay[dateStr] += 1;
    }
  }

  const ratingsPerDay = Object.keys(countsByDay).map((date) => ({
    date,
    count: countsByDay[date],
  }));

  return {
    totalUsers,
    totalStores,
    totalRatings,
    ratingsPerDay,
  };
};

export const getUsersList = async (query) => {
  const { skip, take, getMeta } = parsePagination(query);

  const where = {};

  if (query.name) {
    where.name = { contains: escapeLike(query.name), mode: 'insensitive' };
  }
  if (query.email) {
    where.email = { contains: escapeLike(query.email), mode: 'insensitive' };
  }
  if (query.address) {
    where.address = { contains: escapeLike(query.address), mode: 'insensitive' };
  }
  if (query.role) {
    where.role = query.role;
  }

  const allowedColumns = {
    name: 'name',
    email: 'email',
    address: 'address',
    role: 'role',
    createdAt: 'createdAt',
  };

  const orderBy = parseSort(query.sortBy, query.order, allowedColumns, 'createdAt', 'desc');

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: getMeta(total),
  };
};

export const createUser = async ({ name, email, password, address, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new HttpError(409, 'Email address is already in use');
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_COST);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      address,
      role,
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return user;
};

export const getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
          ratings: {
            select: {
              value: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let storeName = null;
  let storeRating = null;

  if (user.role === 'OWNER' && user.store) {
    storeName = user.store.name;
    const ratings = user.store.ratings;
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.value, 0);
      storeRating = Number((sum / ratings.length).toFixed(1));
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    storeName,
    storeRating,
  };
};

export const getStoresList = async (query) => {
  const { skip, take, getMeta } = parsePagination(query);

  const where = {};

  if (query.name) {
    where.name = { contains: escapeLike(query.name), mode: 'insensitive' };
  }
  if (query.email) {
    where.email = { contains: escapeLike(query.email), mode: 'insensitive' };
  }
  if (query.address) {
    where.address = { contains: escapeLike(query.address), mode: 'insensitive' };
  }
  if (query.categoryId) {
    where.categoryId = Number(query.categoryId);
  }

  const allowedColumns = {
    name: 'name',
    email: 'email',
    address: 'address',
    category: (order) => ({ category: { name: order } }),
    createdAt: 'createdAt',
  };

  let orderBy;
  if (query.sortBy === 'rating') {
    orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
  } else {
    orderBy = parseSort(query.sortBy, query.order, allowedColumns, 'createdAt', 'desc');
  }

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        ratings: {
          select: { value: true },
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.store.count({ where }),
  ]);

  const formattedStores = stores.map((store) => {
    const count = store.ratings.length;
    let rating = null;
    if (count > 0) {
      const sum = store.ratings.reduce((acc, r) => acc + r.value, 0);
      rating = Number((sum / count).toFixed(1));
    }

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      category: store.category,
      rating,
      ratingCount: count,
      ownerId: store.ownerId,
      createdAt: store.createdAt,
    };
  });

  if (query.sortBy === 'rating') {
    const direction = query.order === 'asc' ? 1 : -1;
    formattedStores.sort((a, b) => {
      const valA = a.rating === null ? -1 : a.rating;
      const valB = b.rating === null ? -1 : b.rating;
      return (valA - valB) * direction;
    });
  }

  return {
    data: formattedStores,
    meta: getMeta(total),
  };
};

export const createStore = async ({ name, email, address, categoryId, ownerId }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new HttpError(400, 'Selected category does not exist');
  }

  const existingEmail = await prisma.store.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingEmail) {
    throw new HttpError(409, 'A store with this email address already exists');
  }

  if (ownerId) {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { store: true },
    });

    if (!owner) {
      throw new HttpError(400, 'Owner user not found');
    }

    if (owner.role !== 'OWNER') {
      throw new HttpError(400, 'User must have the OWNER role');
    }

    if (owner.store) {
      throw new HttpError(409, 'This user already owns another store');
    }
  }

  const store = await prisma.store.create({
    data: {
      name,
      email: normalizedEmail,
      address,
      categoryId,
      ownerId: ownerId || null,
    },
    include: {
      category: true,
    },
  });

  return store;
};

export const getAvailableOwners = async () => {
  return prisma.user.findMany({
    where: {
      role: 'OWNER',
      store: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });
};
