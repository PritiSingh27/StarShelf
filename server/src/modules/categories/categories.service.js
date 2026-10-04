import { prisma } from '../../db/prisma.js';
import { HttpError } from '../../shared/utils/httpError.js';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
};

export const createCategory = async ({ name }) => {
  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: { equals: trimmedName, mode: 'insensitive' } }, { slug }],
    },
  });

  if (existing) {
    throw new HttpError(409, 'A category with this name already exists');
  }

  return prisma.category.create({
    data: {
      name: trimmedName,
      slug,
    },
  });
};
