import { Request, Response } from 'express';
import { Res } from './response_service';

export namespace IndexService {
  export async function getPackageVersion(_req: Request, res: Response) {
    return Res.success(res, { version: '1.0.0' });
  }
}
