import { NextFunction, Request, Response } from 'express';

type AsyncRequestHandler<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler<TRequest extends Request = Request>(
  handler: AsyncRequestHandler<TRequest>
) {
  return (
    req: TRequest,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(
      handler(req, res, next)
    ).catch(next);
  };
}