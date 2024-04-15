import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { sockets } from '../..';
import prisma from '../../db';
import { GPS } from '../../utils/gps';
import { Res } from '../../utils/res';
import { removeAccents } from '../../utils/utils';

type Image = {
  fileName: string;
  data?: string;
};

type Place = {
  id: number;
  name: string;
  description: string;
  qr_identifier?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  visitors: number;
  images: Image[];
};

export namespace PlacesService {
  /**
   * GET /places/visits/:userId?page=1&limit=10
   * userId is optional, if not provided, get the user id from the request
   */
  export async function getUserVisitedPlaces(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    if (page < 1 || limit < 1) {
      return Res.bad_request(res, 'Invalid page or limit');
    }
    const placeId = parseInt(req.query.placeId as string);

    let userId: number | undefined = parseInt(req.params.userId);
    // if userId is not provided, get the user id from the request
    if (!userId) {
      userId = req.auth?.userId;
    }
    if (!userId) {
      // just in case, should happen tho
      return Res.unauthorized(res);
    }

    const exists = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        settings: {
          select: {
            visitedPublic: true,
          },
        },
      },
    });

    if (!exists) {
      return Res.not_found(res);
    }

    if (!exists.settings?.visitedPublic) {
      return Res.forbidden(res, 'User has disabled public visits');
    }

    let where;
    if (isNaN(placeId)) {
      where = { userId: userId };
    } else {
      where = { AND: [{ userId: userId }, { placeId: placeId }] };
    }

    // get the user's visited places
    const visitedPlaces = await prisma.userVisitedPlaces.findMany({
      where: where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // get number of pages
    const count = await prisma.userVisitedPlaces.count({
      where: {
        userId: userId,
      },
    });

    return Res.successPaginated(res, visitedPlaces, Math.ceil(count / limit));
  }

  /**
   *  DELETE /places/visits/:placeId
   */
  export async function deleteVisitedPlace(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return Res.unauthorized(res);
    }

    const found = await prisma.userVisitedPlaces.findFirst({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            placeId: placeId,
          },
        ],
      },
    });

    if (!found) {
      return Res.not_found(res);
    }

    // delete the visited place
    const deleted = await prisma.userVisitedPlaces.delete({
      where: {
        userId_placeId: {
          userId: userId,
          placeId: placeId,
        },
      },
    });

    sockets.emitPlaceUpdate(placeId);

    return Res.success(res, deleted);
  }

  /**
   * POST /places/visits/:placeId
   * body should contain gps coordinates and qr code data
   */
  export async function addVisitedPlace(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) {
      return Res.unauthorized(res);
    }

    // get coordinates from the body
    const body = req.body;
    const { latitude, longitude, qrData } = body;
    if (!latitude || !longitude || !qrData) {
      return Res.properties_required(res, ['latitude', 'longitude', 'qrData']);
    }

    // find the place by qrData
    const place = await prisma.place.findFirst({
      where: {
        qrIdentifier: qrData,
      },
    });

    if (!place) {
      return Res.not_found(res);
    }

    const placeLongitude = place.longitude;
    const placeLatitude = place.latitude;

    // calculate distance in meters
    const distance = await GPS.getDistanceInMeters(
      placeLatitude,
      placeLongitude,
      latitude,
      longitude,
    );

    if (distance > 100) {
      return Res.bad_request(res, 'You are too far from the place!');
    }

    // check if it's already visited
    const visitedPlace = await prisma.userVisitedPlaces.findFirst({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            placeId: place.id,
          },
        ],
      },
    });

    if (visitedPlace) {
      return Res.conflict(res);
    }

    // add the visited place
    const newVisitedPlace = await prisma.userVisitedPlaces.create({
      data: {
        userId: userId,
        placeId: place.id,
      },
      select: {
        placeId: true,
        userId: true,
        place: {
          select: {
            points: true,
          },
        },
      },
    });

    sockets.emitPlaceUpdate(place.id);

    return Res.success(res, newVisitedPlace);
  }

  /**
   * GET /places?page=1&limit=10
   */
  export async function searchPlaces(req: Request, res: Response) {
    let { query, type, region } = req.query;
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    if (!latitude || !longitude) {
      return Res.properties_required(res, ['latitude', 'longitude']);
    }

    const searchConditions: Prisma.Sql[] = [];
    if (query) {
      query = removeAccents(query as string);
      searchConditions.push(
        Prisma.sql`(public.unaccent(p.name) ILIKE CONCAT('%', ${query}, '%') OR public.unaccent(p.description) ILIKE CONCAT('%', ${query}, '%'))`,
        // for some reason we cant use '%query%' https://github.com/prisma/prisma/discussions/20568
      );
    }
    if (type) {
      type = (type as string).toUpperCase().split(';');
      searchConditions.push(
        Prisma.sql`(p.type::text IN (${Prisma.join(type)}))`,
      );
    }
    if (region) {
      region = (region as string).toUpperCase().split(';');
      searchConditions.push(
        Prisma.sql`(p.region::text IN (${Prisma.join(region)}))`,
      );
    }
    const where =
      searchConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(searchConditions, ' AND ')}`
        : Prisma.empty;

    let result = (await prisma.$queryRaw`
      SELECT
          p.*,
          array_to_json(array_agg(image."fileName")) as images,
          -- Calculate the distance using the Haversine formula
          6371 * 2 * ASIN(SQRT(
              POWER(SIN(RADIANS((p.latitude - ${latitude}) / 2)), 2) +
              COS(RADIANS(${latitude})) * COS(RADIANS(p.latitude)) *
              POWER(SIN(RADIANS((p.longitude - ${longitude}) / 2)), 2)
          )) AS distance,
          (COUNT(p.id) OVER())::integer AS total
      FROM
          public."Place" p
      JOIN public."Image" image on p.id = image."placeId"
      ${where}
      GROUP BY
          p.id
      ORDER BY
          distance
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit};
    `) as (Place & { total?: number })[];

    const count = result[0]?.total || 0;

    // remove qr_identifier, latitude and longitude from the result
    result = await Promise.all(
      result.map(async (place) => {
        delete place.qr_identifier;
        place.images = await Promise.all(
          place.images.map(async (image) => {
            const data = await readFile(`public/images/${image}`);
            return {
              fileName: image.fileName,
              data: data.toString('base64'),
            };
          }),
        );

        return place;
      }),
    );

    return Res.successPaginated(res, result, Math.ceil(count / limit));
  }

  /**
   *  GET /places/trending
   *  Returns 10 places that have most visitors for the past 14 days
   */
  export async function getTrendingPlaces(req: Request, res: Response) {
    // try to make in prisma functions
    let result = (await prisma.$queryRaw`
      SELECT p.*,
            array_to_json(array_agg(DISTINCT I."fileName")) as images,
            COUNT(uvp."userId")::integer                    AS visitors
      FROM public."Place" p
              JOIN public."UserVisitedPlaces" uvp ON p."id" = uvp."placeId"
              JOIN public."Image" I on p.id = I."placeId"
      WHERE uvp."createdAt" > NOW() - INTERVAL '14 days'
      GROUP BY p."id", p.name
      ORDER BY visitors DESC
      LIMIT 10;
    `) as Place[];

    // remove qr_identifier, latitude and longitude from the result
    result = await Promise.all(
      result.map(async (place) => {
        delete place.qr_identifier;
        place.images = await Promise.all(
          place.images.map(async (image) => {
            const data = await readFile(`public/images/${image}`);
            return {
              fileName: image.fileName,
              data: data.toString('base64'),
            };
          }),
        );

        return place;
      }),
    );

    return Res.success(res, result);
  }

  export async function getPlace(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const place = await prisma.place.findFirst({
      where: {
        id: placeId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        points: true,
        type: true,
        images: {
          select: {
            fileName: true,
          },
        },
      },
    });

    if (!place) {
      return Res.not_found(res);
    }

    place.images = await Promise.all(
      place.images.map(async (image) => {
        const data = await readFile(`public/images/${image.fileName}`);
        return {
          fileName: image.fileName,
          data: data.toString('base64'),
        };
      }),
    );

    return Res.success(res, place);
  }

  /* Reviews */

  /** 
    GET /places/reviews/:placeId?page=1&limit=10
  */
  export async function getPlaceReviews(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (page < 1 || limit < 1) {
      return Res.bad_request(res, 'Invalid page or limit');
    }

    const exists = await prisma.place.findFirst({
      where: {
        id: placeId,
      },
    });

    if (!exists) {
      return Res.not_found(res);
    }

    const count = await prisma.review.count({
      where: {
        placeId: placeId,
      },
    });

    const reviews = await prisma.review.findMany({
      where: {
        placeId: placeId,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
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

    reviews.map(async (review) => {
      const images = await Promise.all(
        review.images.map(async (image) => {
          const fileName = image.fileName;
          const data = await readFile(`public/images/${fileName}`);
          return {
            id: image.id,
            fileName: fileName,
            data: data.toString('base64'),
          };
        }),
      );
      review.images = images;
      return review;
    });

    const sumOfRatings = await prisma.review.aggregate({
      where: {
        placeId: placeId,
      },
      _sum: {
        rating: true,
      },
    });

    const countOfReviews = await prisma.review.count({
      where: {
        placeId: placeId,
      },
    });

    return Res.successPaginated(res, reviews, Math.ceil(count / limit), {
      sumOfRatings,
      countOfReviews,
    });
  }

  /**
   * PUT /places/reviews/:placeId
   */
  export async function upsertPlaceReview(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return Res.unauthorized(res);
    }

    const body = req.body;
    const { rating, comment } = body;
    if (!rating || !comment) {
      return Res.properties_required(res, ['rating', 'comment']);
    }
    const fileName = req.file?.filename;

    const visited = await prisma.userVisitedPlaces.findFirst({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            placeId: placeId,
          },
        ],
      },
    });

    if (!visited) {
      return Res.bad_request(res, 'You have to visit the place first');
    }

    const review = await prisma.review.upsert({
      where: {
        userId_placeId: {
          userId: userId,
          placeId: placeId,
        },
      },
      update: {
        rating: parseInt(rating),
        comment: comment,
      },
      create: {
        userId: userId,
        placeId: placeId,
        rating: parseInt(rating),
        comment: comment,
        images: {
          create: fileName ? { fileName: fileName } : undefined,
        },
      },
    });

    sockets.emitPlaceUpdate(placeId);

    return Res.success(res, review);
  }

  /**
   * DELETE /places/reviews/:placeId
   */
  export async function deletePlaceReview(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return Res.unauthorized(res);
    }

    const review = await prisma.review.findFirst({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            placeId: placeId,
          },
        ],
      },
    });

    if (!review) {
      return Res.not_found(res);
    }

    const deleted = await prisma.review.delete({
      where: {
        userId_placeId: {
          userId: userId,
          placeId: placeId,
        },
      },
    });

    sockets.emitPlaceUpdate(placeId);

    return Res.success(res, deleted);
  }

  export async function getPlaceVisits(placeId: number) {
    const count = await prisma.userVisitedPlaces.count({
      where: {
        placeId: placeId,
      },
    });

    return count;
  }

  export async function getPlaceAverageRating(placeId: number) {
    const sumOfRatings = await prisma.review.aggregate({
      where: {
        placeId: placeId,
      },
      _sum: {
        rating: true,
      },
    });

    const countOfReviews = await prisma.review.count({
      where: {
        placeId: placeId,
      },
    });

    if (!sumOfRatings._sum.rating || !countOfReviews) {
      return 0;
    }

    return sumOfRatings._sum.rating / countOfReviews;
  }

  export async function removePlace(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    try {
      await prisma.$transaction([
        prisma.place.delete({
          where: { id: placeId },
        }),
        prisma.externalLink.deleteMany({
          where: { placeId: placeId },
        }),
        prisma.review.deleteMany({
          where: { placeId: placeId },
        }),
        prisma.image.deleteMany({
          where: { placeId: placeId },
        }),
        prisma.userVisitedPlaces.deleteMany({
          where: { placeId: placeId },
        }),
      ]);
      return Res.success(res, { message: 'Removed' });
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }

  export async function updatePlaceDescription(req: Request, res: Response) {
    try {
      const placeId = parseInt(req.params.placeId);
      const newDescription = req.params.newDescription;

      const updatedPlace = await prisma.place.update({
        where: { id: placeId },
        data: { description: newDescription },
      });

      return Res.success(res, updatedPlace);
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }

  export async function getLatestAddedPlaces(req: Request, res: Response) {
    try {
      const latestPlaces = await prisma.place.findMany({
        take: 3,
        orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      });

      return Res.success(res, latestPlaces);
    } catch (error) {
      return Res.bad_request(res, 'Server Error');
    }
  }
}
