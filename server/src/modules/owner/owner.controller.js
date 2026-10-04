import * as ownerService from './owner.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await ownerService.getOwnerDashboard(req.user.id, req.query);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
