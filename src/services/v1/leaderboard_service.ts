import { Request, Response } from 'express';
import prisma from '../../db';
import { Res } from '../../utils/res';

type LeaderboardUser = {
  id: number;
  name: string;
  visited_places?: number;
  points: number;
  position: number;
};

export namespace LeaderboardService {
  export async function getTopLast30Days(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    const count = await prisma.user.count({});

    const result = (await prisma.$queryRaw`
        SELECT "User".id,
            "User".name,
            COUNT(uvp."placeId")::integer                       AS visited_places,
            SUM(place.points)::integer                                   AS points,
            ROW_NUMBER() OVER (ORDER BY SUM(place.points) DESC)::integer AS position
        FROM "User"
                JOIN public."UserVisitedPlaces" uvp on "User".id = uvp."userId"
                JOIN public."Place" place on uvp."placeId" = place.id
        WHERE uvp."createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY "User".id
        ORDER BY points DESC
        LIMIT ${limit} 
        OFFSET ${(page - 1) * limit};
    `) as LeaderboardUser[];

    return Res.successPaginated(res, result, Math.ceil(count / limit));
  }

  export async function getUserPosition(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return Res.bad_request(res, 'Invalid user id');
    }

    const result = (await prisma.$queryRaw`
    SELECT id, name, points, position
    FROM (SELECT "User".id,
                "User".name,
                SUM(place.points)::integer                                   AS points,
                ROW_NUMBER() OVER (ORDER BY SUM(place.points) DESC)::integer AS position
          FROM "User"
                  JOIN public."UserVisitedPlaces" uvp on "User".id = uvp."userId"
                  JOIN public."Place" place on uvp."placeId" = place.id
          WHERE uvp."createdAt" > NOW() - INTERVAL '30 days'
          GROUP BY "User".id
          ORDER BY points DESC) AS leaderboard
    WHERE id = ${userId};
    `) as LeaderboardUser[];

    if (result.length === 0) {
      return Res.not_found(res);
    }

    return Res.success(res, result[0]);
  }
}
