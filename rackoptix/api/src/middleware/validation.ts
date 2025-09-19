/**
 * Validation middleware for the RackOptix API.
 * 
 * This middleware validates request data using express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request data.
 * 
 * This middleware checks for validation errors from express-validator
 * and returns a 400 Bad Request response if any errors are found.
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.debug('Validation errors:', errors.array());

    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }

  next();
}
