import * as categoriesService from './categories.service.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
