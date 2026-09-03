import { successResponse } from '../utils/responseHandler.js';

export const getresultsData = async (req, res, next) => {
  try {
    return successResponse(res, { module: 'results', status: 'ready' }, 'results service foundation ready');
  } catch (error) {
    next(error);
  }
};
