import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../shared/utils/httpError.js';
import { parsePagination } from '../../shared/utils/pagination.js';
import { parseSort } from '../../shared/utils/sort.js';
import { escapeLike } from '../../shared/utils/escapeLike.js';
import { calculateWeightedRating } from '../../shared/utils/rating.js';

const sanitizeComment = (comment) => {
  if (comment === null || comment === undefined) return comment;
  const clean = Array.from(comment)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (
        !(code >= 0 && code <= 31) &&
        !(code >= 127 && code <= 159) &&
        code !== 8203 &&
        code !== 8204 &&
        code !== 8205 &&
        code !== 65279
      );
    })
    .join('')
    .trim();

  if (clean.length > 500) {
    throw new HttpError(400, 'Comment must not exceed 500 characters');
  }
  return clean === '' ? null : clean;
};

export const getStoresForUser = async (userId, query) => {
  const { skip, take, getMeta } = parsePagination(query);

  const where = {};

  if (query.search) {
    const escaped = escapeLike(query.search);
    where.OR = [
      { name: { contains: escaped, mode: 'insensitive' } },
      { address: { contains: escaped, mode: 'insensitive' } },
    ];
  }

  if (query.categoryId) {
    where.categoryId = Number(query.categoryId);
  }

  const allowedColumns = {
    name: 'name',
    address: 'address',
    createdAt: 'createdAt',
  };

  let orderBy;
  if (query.sortBy === 'rating' || query.sortBy === 'top') {
    orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
  } else {
    orderBy = parseSort(query.sortBy, query.order, allowedColumns, 'name', 'asc');
  }

  const [stores, total, allRatings] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        ratings: {
          select: {
            userId: true,
            value: true,
            comment: true,
          },
        },
      },
      orderBy,
      skip: query.sortBy === 'top' || query.sortBy === 'rating' ? undefined : skip,
      take: query.sortBy === 'top' || query.sortBy === 'rating' ? undefined : take,
    }),
    prisma.store.count({ where }),
    prisma.rating.findMany({ select: { value: true } }),
  ]);

  const globalAvg =
    allRatings.length > 0
      ? allRatings.reduce((acc, r) => acc + r.value, 0) / allRatings.length
      : 3.0;

  const formattedStores = stores.map((store) => {
    const count = store.ratings.length;
    let overallRating = null;
    let avg = 0;

    if (count > 0) {
      const sum = store.ratings.reduce((acc, r) => acc + r.value, 0);
      avg = sum / count;
      overallRating = Number(avg.toFixed(1));
    }

    const myRatingObj = store.ratings.find((r) => r.userId === userId);
    const myRating = myRatingObj ? myRatingObj.value : null;
    const myComment = myRatingObj ? myRatingObj.comment : null;

    const weightedScore = calculateWeightedRating(count, avg, globalAvg);

    return {
      id: store.id,
      name: store.name,
      address: store.address,
      category: store.category,
      overallRating,
      ratingCount: count,
      myRating,
      myComment,
      weightedScore,
    };
  });

  if (query.sortBy === 'top') {
    const direction = query.order === 'asc' ? 1 : -1;
    formattedStores.sort((a, b) => (a.weightedScore - b.weightedScore) * direction);
  } else if (query.sortBy === 'rating') {
    const direction = query.order === 'asc' ? 1 : -1;
    formattedStores.sort((a, b) => {
      const valA = a.overallRating === null ? -1 : a.overallRating;
      const valB = b.overallRating === null ? -1 : b.overallRating;
      return (valA - valB) * direction;
    });
  }

  const finalStores =
    query.sortBy === 'top' || query.sortBy === 'rating'
      ? formattedStores.slice(skip, skip + take)
      : formattedStores;

  const cleanedStores = finalStores.map(({ weightedScore: _, ...rest }) => rest);

  return {
    data: cleanedStores,
    meta: getMeta(total),
  };
};

export const rateStore = async (user, storeId, { value, comment }) => {
  if (env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerified) {
    throw new HttpError(
      403,
      'Email verification required to rate stores',
      null,
      'EMAIL_NOT_VERIFIED'
    );
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new HttpError(404, 'Store not found');
  }

  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId,
      },
    },
  });

  let finalComment;
  if (comment === undefined) {
    finalComment = existingRating ? existingRating.comment : null;
  } else {
    finalComment = sanitizeComment(comment);
  }

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId,
      },
    },
    create: {
      userId: user.id,
      storeId,
      value,
      comment: finalComment,
    },
    update: {
      value,
      comment: finalComment,
    },
  });

  const allStoreRatings = await prisma.rating.findMany({
    where: { storeId },
    select: { value: true },
  });

  const ratingCount = allStoreRatings.length;
  const sum = allStoreRatings.reduce((acc, r) => acc + r.value, 0);
  const overallRating = Number((sum / ratingCount).toFixed(1));

  return {
    overallRating,
    ratingCount,
    myRating: value,
    myComment: finalComment,
  };
};

export const getStoreReviews = async (storeId, query) => {
  const { skip, take, getMeta } = parsePagination(query);

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new HttpError(404, 'Store not found');
  }

  const where = {
    storeId,
    comment: {
      not: null,
    },
  };

  const [reviews, total] = await Promise.all([
    prisma.rating.findMany({
      where,
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.rating.count({ where }),
  ]);

  const formattedReviews = reviews
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .map((r) => ({
      id: r.id,
      reviewerName: r.user.name,
      value: r.value,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

  return {
    data: formattedReviews,
    meta: getMeta(total),
  };
};
