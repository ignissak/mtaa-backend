import { Request, Response } from 'express';
import prisma from '../db';
import { GPS } from '../utils/gps';
import { Res } from '../utils/res';

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
};

export namespace PlacesService {
  /**
   * GET /places/visits/:userId?page=1&limit=10
   * userId is optional, if not provided, get the user id from the request
   */
  export async function getUserVisitedPlaces(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (page < 1 || limit < 1) {
      return Res.bad_request(res, 'Invalid page or limit');
    }

    let userId: number | undefined = parseInt(req.params.userId);
    // if userId is not provided, get the user id from the request
    if (!userId) {
      userId = req.session.userId;
    }
    if (!userId) {
      // just in case, should happen tho
      return Res.unauthorized(res);
    }

    // get the user's visited places
    const visitedPlaces = await prisma.userVisitedPlaces.findMany({
      where: {
        userId: userId,
      },
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

    const userId = req.session.userId;
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

    return Res.success(res, deleted);
  }

  /**
   * POST /places/visits/:placeId
   * body should contain gps coordinates and qr code data
   */
  export async function addVisitedPlace(req: Request, res: Response) {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return Res.property_required(res, 'placeId');
    }

    const userId = req.session.userId;
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
        AND: [
          {
            qrIdentifier: qrData,
          },
          {
            id: placeId,
          },
        ],
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
            placeId: placeId,
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
        placeId: placeId,
      },
    });

    return Res.success(res, newVisitedPlace);
  }

  /**
   * GET /places?page=1&limit=10
   */
  export async function getNearbyPlaces(req: Request, res: Response) {
    const { latitude, longitude } = req.body;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    if (!latitude || !longitude) {
      return Res.properties_required(res, ['latitude', 'longitude']);
    }

    const count = await prisma.place.count();

    const result = (await prisma.$queryRaw`
      SELECT
          *,
          -- Calculate the distance using the Haversine formula
          6371 * 2 * ASIN(SQRT(
              POWER(SIN(RADIANS((p.latitude - ${latitude}) / 2)), 2) +
              COS(RADIANS(${latitude})) * COS(RADIANS(p.latitude)) *
              POWER(SIN(RADIANS((p.longitude - ${longitude}) / 2)), 2)
          )) AS distance
      FROM
          public."Place" p
      ORDER BY
          distance
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit};
    `) as Place[];

    // remove qr_identifier, latitude and longitude from the result
    result.forEach((place) => {
      delete place.qr_identifier;
      delete place.latitude;
      delete place.longitude;
    });

    return Res.successPaginated(res, result, Math.ceil(count / limit));
  }

  /**
   *  GET /places/trending
   *  Returns 10 places that have most visitors for the past 14 days
   */
  export async function getTrendingPlaces(req: Request, res: Response) {
    // try to make in prisma functions
    const result = (await prisma.$queryRaw`
      SELECT
          p.*,
          COUNT(uvp."userId")::integer AS visitors
      FROM
          public."Place" p
      JOIN
          public."UserVisitedPlaces" uvp
      ON
          p."id" = uvp."placeId"
      WHERE
          uvp."createdAt" > NOW() - INTERVAL '14 days'
      GROUP BY
          p."id"
      ORDER BY
          visitors DESC
      LIMIT 10;
    `) as Place[];

    // remove qr_identifier, latitude and longitude from the result
    result.forEach((place) => {
      delete place.qr_identifier;
      delete place.latitude;
      delete place.longitude;
    });

    console.log(result);

    return Res.success(res, result);
  }
}
