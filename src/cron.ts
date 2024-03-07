import { schedule } from 'node-cron';
import prisma from './db';

export class Cron {
  constructor() {
    this.start();
  }

  public start() {
    console.log('CRON: Started scheduler');

    schedule('0 * * * *', this.updatePoints);
    this.updatePoints();
  }

  private async updatePoints() {
    console.log('CRON: Updating points');

    await prisma.$queryRaw`
        WITH sel AS (SELECT "User".id, SUM(P.points) FROM "User"
            JOIN public."UserVisitedPlaces" UVP on "User".id = UVP."userId"
            JOIN public."Place" P on UVP."placeId" = P.id
            GROUP BY "User".id)
        UPDATE "User" SET points = sel.sum FROM sel WHERE "User".id = sel.id;`;
  }
}
