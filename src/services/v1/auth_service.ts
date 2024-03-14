import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
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

    const access_token = await generateAccessToken(newUser.id);
    return Res.created(res, {
      id: newUser.id,
      email: newUser.email,
      access_token,
    });
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

    const access_token = await generateAccessToken(user.id);
    return Res.success(res, { access_token, userId: user.id });
  }

  export async function requireLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return Res.unauthorized(res);
    }

    try {
      const decoded = await verifyAccessToken(token);
      if (!decoded) {
        return Res.unauthorized(res);
      }

      req.auth = decoded as { userId: number };
      next();
    } catch (error) {
      return Res.unauthorized(res);
    }
  }

  export async function verifyAccessToken(token: string) {
    return new Promise<JwtPayload | undefined>((resolve, reject) => {
      verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded as JwtPayload);
      });
    });
  }

  export async function generateAccessToken(userId: number) {
    return sign(
      {
        userId,
      },
      process.env.SECRET as string,
      {
        expiresIn: '100 years',
        algorithm: 'HS256',
      },
    );
  }
}
