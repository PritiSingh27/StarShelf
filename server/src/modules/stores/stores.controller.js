import * as storesService from './stores.service.js';

export const getStores = async (req, res, next) => {
  try {
    const result = await storesService.getStoresForUser(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rateStore = async (req, res, next) => {
  try {
    const storeId = Number(req.params.id);
    const result = await storesService.rateStore(req.user, storeId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStoreReviews = async (req, res, next) => {
  try {
    const storeId = Number(req.params.id);
    const result = await storesService.getStoreReviews(storeId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
