import { HttpError } from './httpError.js';

export const parsePagination = (query) => {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new HttpError(400, 'Page parameter must be a positive integer');
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new HttpError(400, 'Limit parameter must be a positive integer');
    }
    limit = Math.min(parsedLimit, 50);
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const getMeta = (total) => {
    const totalPages = Math.ceil(total / limit) || 0;
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
    };
  };

  return { page, limit, skip, take, getMeta };
};
