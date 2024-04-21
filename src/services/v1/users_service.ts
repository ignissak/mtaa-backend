import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import prisma from '../../db';
import { Res } from '../../utils/res';

export namespace UsersService {
  export async function updateSettings(req: Request, res: Response) {
    const { appearance, visitedPublic, language } = req.body;
    let { name } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return Res.unauthorized(res);
    }

    if (
      appearance === undefined ||
      visitedPublic === undefined ||
      language === undefined ||
      name === undefined
    ) {
      return Res.properties_required(res, [
        'appearance',
        'visitedPublic',
        'language',
        'name',
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

    if (
      language.toLowerCase().replace('_', '-') !== 'en-gb' &&
      language.toLowerCase().replace('_', '-') !== 'sk-sk'
    ) {
      return Res.bad_request(res, 'language must be a valid value');
    }

    if (name === null) name = '';
    if (name.length < 3 || name.length > 20) {
      return Res.bad_request(res, 'name must be between 3 and 20 characters');
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
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
        name: true,
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

    if (isNaN(parseInt(userId))) {
      return Res.bad_request(res, 'userId must be a number');
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
            appearance: true,
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

  export async function getUserReviews(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return Res.property_required(res, 'userId');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const placeId = parseInt(req.query.placeId as string) || null;
    if (page < 1 || limit < 1) {
      return Res.bad_request(res, 'Invalid page or limit');
    }

    const exists = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!exists) {
      return Res.not_found(res);
    }

    const count = await prisma.review.count({
      where: {
        userId: userId,
      },
    });

    const reviews = await prisma.review.findMany({
      where: {
        userId: userId,
        placeId: placeId ? placeId : undefined,
      },
      select: {
        place: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        id: true,
        rating: true,
        comment: true,
        images: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    let result = reviews;

    result = await Promise.all(
      result.map(async (review) => {
        review.images = await Promise.all(
          review.images.map(async (image) => {
            const data = await readFile(`public/images/${image.fileName}`);
            return {
              fileName: image.fileName,
              id: image.id,
              data: data.toString('base64'),
            };
          }),
        );

        return review;
      }),
    );

    return Res.successPaginated(res, result, Math.ceil(count / limit));
  }

  export async function getTopReviewers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topUsers = await prisma.review.groupBy({
        by: ['userId'],
        _count: {
          userId: true,
        },
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: limit,
      });

      return Res.success(res, topUsers);
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }

  export async function getUsersFavoritePlaces(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      const favoritePlaces = await prisma.review.findMany({
        where: {
          userId: userId,
          rating: {
            gt: 4,
          },
        },
        select: {
          place: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          id: true,
          rating: true,
          comment: true,
        },
      });
      return Res.success(res, favoritePlaces);
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }

  export async function deleteReviewById(req: Request, res: Response) {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });
      return Res.success(res, { message: 'Removed' });
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }
}
