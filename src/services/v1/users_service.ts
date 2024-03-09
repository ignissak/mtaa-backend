import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../../db';
import { Res } from '../../utils/res';

export namespace UsersService {
  export async function updateSettings(req: Request, res: Response) {
    const { darkMode, visitedPublic, language } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return Res.unauthorized(res);
    }

    if (
      darkMode === undefined ||
      visitedPublic === undefined ||
      language === undefined
    ) {
      return Res.properties_required(res, [
        'darkMode',
        'visitedPublic',
        'language',
      ]);
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        settings: {
          update: {
            darkMode: darkMode,
            visitedPublic: visitedPublic,
            language: language.toUpperCase().replace('-', '_'),
          },
        },
      },
      select: {
        id: true,
        settings: {
          select: {
            darkMode: true,
            visitedPublic: true,
            language: true,
          },
        },
      },
    });

    return Res.success(res, user);
  }

  export async function updatePassword(req: Request, res: Response) {
    let { oldPassword, newPassword } = req.body;
    const userId = req.session.userId;

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
}
