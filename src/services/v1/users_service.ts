import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../../db';
import { Res } from '../../utils/res';

export namespace UsersService {
  export async function updateSettings(req: Request, res: Response) {
    const { appearance, visitedPublic, language } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return Res.unauthorized(res);
    }

    if (
      appearance === undefined ||
      visitedPublic === undefined ||
      language === undefined
    ) {
      return Res.properties_required(res, [
        'appearance',
        'visitedPublic',
        'language',
      ]);
    }

    // validate
    if (
      appearance.toUpperCase() !== 'LIGHT_MODE' &&
      appearance.toUpperCase() !== 'DARK_MODE' &&
      appearance.toUpperCase() !== 'SYSTEM'
    ) {
      return Res.bad_request(res, 'appareance must be a valid value');
    }

    if (typeof visitedPublic !== 'boolean') {
      return Res.bad_request(res, 'visitedPublic must be a boolean');
    }

    if (language !== 'en-GB' && language !== 'sk-SK') {
      return Res.bad_request(res, 'language must be a valid value');
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        settings: {
          update: {
            appearance: appearance.toUpperCase(),
            visitedPublic: visitedPublic,
            language: language.toUpperCase().replace('-', '_'),
          },
        },
      },
      select: {
        id: true,
        settings: {
          select: {
            appearance: true,
            visitedPublic: true,
            language: true,
          },
        },
      },
    });

    return Res.success(res, user);
  }

  export async function updatePassword(req: Request, res: Response) {
    let { newPassword } = req.body;
    const { oldPassword } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return Res.unauthorized(res);
    }

    if (!oldPassword || !newPassword) {
      return Res.properties_required(res, ['oldPassword', 'newPassword']);
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    newPassword = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return Res.unauthorized(res);
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });

    return Res.success(res, { id: userId });
  }

  export async function getUser(req: Request, res: Response) {
    const userId = req.params.userId;

    if (!userId) {
      return Res.property_required(res, 'userId');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        name: true,
        points: true,
        settings: {
          select: {
            darkMode: true,
            visitedPublic: true,
            language: true,
          },
        },
      },
    });

    if (!user) {
      return Res.not_found(res);
    }

    return Res.success(res, user);
  }
}
