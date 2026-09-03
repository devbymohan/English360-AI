import { successResponse } from '../utils/responseHandler.js';

export const getauthData = async (req, res, next) => {
  try {
    return successResponse(res, { module: 'auth', status: 'ready' }, 'auth service foundation ready');
  } catch (error) {
    next(error);
  }
};
