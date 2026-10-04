import * as adminService from './admin.service.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsersList(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const details = await adminService.getUserDetails(userId);
    res.json(details);
  } catch (error) {
    next(error);
  }
};

export const getStores = async (req, res, next) => {
  try {
    const result = await adminService.getStoresList(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const store = await adminService.createStore(req.body);
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

export const getAvailableOwners = async (req, res, next) => {
  try {
    const owners = await adminService.getAvailableOwners();
    res.json(owners);
  } catch (error) {
    next(error);
  }
};
