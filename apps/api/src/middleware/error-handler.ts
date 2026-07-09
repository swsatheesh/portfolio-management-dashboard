import { ErrorRequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { appConfig } from '../config/auth.config';
import { ApiError } from '../errors/api-error';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: z.treeifyError(error),
      },
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.name,
        message: error.message,
        details: error.details,
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
      details: appConfig.isProduction ? undefined : error.message,
    },
  });
};