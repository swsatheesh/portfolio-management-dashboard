import { Request, Response } from 'express';

export class ProfileController {
  getProfile(req: Request, res: Response) {
    return res.status(200).json(req.user);
  }
}