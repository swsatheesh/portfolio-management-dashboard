import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

type RequestSchemas = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export interface ValidatedRequestData {
  body?: unknown;
  params?: unknown;
  query?: unknown;
}

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {

    const validated: ValidatedRequestData = {};

    if (schemas.body) {
      const body = schemas.body.parse(req.body);
      req.body = body;
      validated.body = body;
    }

    if (schemas.params) {
      const params = schemas.params.parse(req.params);

      Object.assign(req.params, params);
      validated.params = params;
    }

    if (schemas.query) {
      validated.query = schemas.query.parse(
        req.query
      );
    }

    res.locals.validated = validated;

    next();
  };
}

export const uuidParamSchema = z.object({
  id: z.uuid('Invalid id format'),
});