import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import prisma from '../../db';
import { Res } from '../../utils/res';

export namespace AuthService {
  export async function register(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return Res.properties_required(res, ['email', 'password']);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return Res.conflict(res);
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        settings: {
          create: {},
        },
      },
    });

    req.session.userId = newUser.id;
    return Res.created(res, { id: newUser.id, email: newUser.email });
  }

  export async function login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return Res.properties_required(res, ['email', 'password']);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return Res.unauthorized(res);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return Res.unauthorized(res);
    }

    req.session.userId = user.id;
    return Res.success(res, { id: user.id, email: user.email });
  }

  export async function logOut(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return Res.error(res, err);
      }
      return Res.success(res, {});
    });
  }

  export async function requireLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.session.userId) {
      return Res.unauthorized(res);
    }
    next();
  }
}
