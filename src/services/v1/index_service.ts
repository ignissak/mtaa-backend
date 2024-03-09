import { Request, Response } from 'express';
import { Res } from '../../utils/res';

export namespace IndexService {
  export async function getPackageVersion(req: Request, res: Response) {
    return Res.success(res, {
      version: process.env.npm_package_version,
      userId: req.session.userId,
    });
  }
}
