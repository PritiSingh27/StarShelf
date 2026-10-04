import * as profileService from './profile.service.js';
import { getAuthCookieOptions } from '../../shared/utils/token.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await profileService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await profileService.changePassword(req.user.id, req.body);
    res.cookie('token', result.jwtToken, getAuthCookieOptions());
    res.json({ message: result.message });
  } catch (error) {
    next(error);
  }
};
