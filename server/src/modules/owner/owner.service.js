import { prisma } from '../../db/prisma.js';
import { parsePagination } from '../../shared/utils/pagination.js';
import { parseSort } from '../../shared/utils/sort.js';

export const getOwnerDashboard = async (ownerId, query) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const emptyDistribution = [1, 2, 3, 4, 5].map((val) => ({ rating: val, count: 0 }));

  if (!store) {
    const { getMeta } = parsePagination(query);
    return {
      store: null,
      averageRating: null,
      ratingCount: 0,
      distribution: emptyDistribution,
      raters: {
        data: [],
        meta: getMeta(0),
      },
    };
  }

  const { skip, take, getMeta } = parsePagination(query);

  const allowedColumns = {
    name: (order) => ({ user: { name: order } }),
    value: 'value',
    ratedAt: 'createdAt',
  };

  const orderBy = parseSort(query.sortBy, query.order, allowedColumns, 'createdAt', 'desc');

  const [allRatings, paginatedRatings, totalRaters] = await Promise.all([
    prisma.rating.findMany({
      where: { storeId: store.id },
      select: { value: true },
    }),
    prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.rating.count({
      where: { storeId: store.id },
    }),
  ]);

  const ratingCount = allRatings.length;
  let averageRating = null;

  const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (ratingCount > 0) {
    const sum = allRatings.reduce((acc, r) => {
      distMap[r.value] = (distMap[r.value] || 0) + 1;
      return acc + r.value;
    }, 0);
    averageRating = Number((sum / ratingCount).toFixed(1));
  }

  const distribution = [1, 2, 3, 4, 5].map((val) => ({
    rating: val,
    count: distMap[val] || 0,
  }));

  const ratersData = paginatedRatings.map((r) => ({
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    value: r.value,
    comment: r.comment,
    ratedAt: r.createdAt,
  }));

  return {
    store: {
      id: store.id,
      name: store.name,
      address: store.address,
      category: store.category,
    },
    averageRating,
    ratingCount,
    distribution,
    raters: {
      data: ratersData,
      meta: getMeta(totalRaters),
    },
  };
};
